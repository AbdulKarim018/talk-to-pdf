import { env } from "@/env";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/utils";
import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const rawBody = await req.text();
  // const body = await req.json();

  const webhook_secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;

  const receivedSignature = req.headers.get("X-Signature") ?? "";

  const verificationResult = verifyLemonSqueezyWebhookSignature(
    rawBody,
    receivedSignature,
    webhook_secret,
  );

  if (!verificationResult) {
    return Response.json(
      {
        error: "Invalid signature",
      },
      { status: 401 },
    );
  }

  const body = JSON.parse(rawBody);
  // console.log(body);

  const userId = body.meta.custom_data.user_id;

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return Response.json(
      {
        error: "User not found",
      },
      { status: 404 },
    );
  }

  const d = {
    subscriptionId: body.data.id,
    customerId: body.data.attributes.customer_id,
    status: body.data.attributes.cancelled ? "CANCELLED" : "ACTIVE",
    renews_at: body.data.attributes.renews_at,
  } as const;

  const data: {
    ls_subscription_id: string;
    ls_customer_id: string;
    status: "ACTIVE" | "CANCELLED";
    renewsAt: string;
    endsAt?: string;
  } = {
    ls_subscription_id: d.subscriptionId,
    ls_customer_id: `${d.customerId}`,
    status: d.status,
    renewsAt: d.renews_at,
  } as const;

  if (body.data.attributes.ends_at) {
    data.endsAt = body.data.attributes.ends_at;
  }

  if (data.status === "ACTIVE") {
    await db.$transaction([
      db.subscription.upsert({
        where: {
          ls_subscription_id: data.ls_subscription_id,
        },
        update: data,
        create: { ...data, userId: user.id },
      }),
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "PRO",
        },
      }),
    ]);
  } else {
    await db.$transaction([
      db.subscription.upsert({
        where: {
          ls_subscription_id: data.ls_subscription_id,
        },
        update: data,
        create: { ...data, userId: user.id },
      }),
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "FREE",
        },
      }),
    ]);
  }

  console.log(data);

  return Response.json({ success: true }, { status: 200 });
};
