import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { connectLemonSqueezy } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { getProduct } from "@lemonsqueezy/lemonsqueezy.js";
import { ArrowRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function PlansPage() {
  const session = await getServerAuthSession();

  const plan = session?.user.plan;

  // const cc_usd = await (
  //   await fetch(
  //     "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
  //   )
  // ).json();

  await connectLemonSqueezy();
  const { error, data: subscription } = await getProduct(311887);

  if (error) {
    console.log(error);
    return notFound();
  }

  // console.log(subscription.data.attributes);

  // const priceInRuppees = subscription.data.attributes.price / 100;

  // const priceInUsd = priceInRuppees / cc_usd.usd.pkr;

  // console.log(subscription);

  // console.log("price====> ", `$${priceInUsd.toFixed(2)}`);

  // console.log(
  //   "price2====> ",
  //   `${new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //   }).format(priceInRuppees)}`,
  // );

  const checkoutUrl = subscription.data.attributes.buy_now_url;

  return (
    <div>
      <Navbar />
      <main className="container mx-auto my-6 max-w-6xl">
        <div className="mb-10 flex w-full flex-col text-center">
          <h1 className="title-font mb-2 text-3xl font-medium text-white sm:text-4xl">
            Pricing
          </h1>
          <p className="mx-auto text-base leading-relaxed lg:w-2/3">
            Talk2PDF is a freemium service with a few limitations. You can
            choose the plan that best suits your needs.
          </p>
        </div>
        <div className="-m-4 flex flex-wrap justify-center">
          <div className="w-full p-4 md:w-1/2 xl:w-1/4">
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-gray-700 p-6">
              <h2 className="title-font mb-1 text-sm font-medium tracking-widest text-gray-400">
                FREE PLAN{" "}
                {plan === "FREE" && (
                  <span className="text-xs text-gray-400">(Active)</span>
                )}
              </h2>
              <h1 className="mb-4 border-b border-gray-800 pb-4 text-5xl leading-none text-white">
                Free
              </h1>
              <p className="mb-2 flex items-center text-gray-400">
                <GreyTickIcon />3 PDFs/chats
              </p>
              <p className="mb-2 flex items-center text-gray-400">
                <GreyTickIcon /> 1MB size limit for each PDF
              </p>
              <p className="mb-6 flex items-center text-gray-400">
                <GreyTickIcon />
                Limited support
              </p>
              <form>
                <Button
                  formAction={async () => {
                    "use server";
                    redirect("/api/auth/signin?callbackUrl=/plans");
                  }}
                  variant="outline"
                  disabled={!!session?.user || plan === "PRO"}
                  className="w-full"
                >
                  Get Started
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </form>
              {/* <p className="mt-3 text-xs text-gray-400">
                Literally you probably haven't heard of them jean shorts.
              </p> */}
            </div>
          </div>
          <div className="w-full p-4 md:w-1/2 xl:w-1/4">
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-white p-6">
              <span className="absolute right-0 top-0 rounded-bl bg-white px-3 py-1 text-xs font-bold tracking-widest text-black">
                POPULAR
              </span>
              <h2 className="title-font mb-1 text-sm font-medium tracking-widest text-gray-400">
                PRO{" "}
                {plan === "PRO" && (
                  <span className="text-sm text-gray-400">(Active)</span>
                )}
              </h2>
              <h1 className="mb-4 flex items-center border-b border-gray-800 pb-4 text-5xl leading-none text-white">
                <span>${subscription.data.attributes.price / 100}</span>
                <span className="ml-1 text-lg font-normal text-gray-400">
                  /mo
                </span>
              </h1>
              <p className="mb-2 flex items-center text-gray-400">
                <GreyTickIcon premium stroke="black" />
                Unlimited PDFs/chats
              </p>
              <p className="mb-2 flex items-center text-gray-400">
                <GreyTickIcon premium stroke="black" />
                16MB size limit for each PDF
              </p>
              <p className="mb-6 flex items-center text-gray-400">
                <GreyTickIcon premium stroke="black" />
                Priority support
              </p>
              <form>
                <Button
                  formAction={async () => {
                    "use server";
                    if (!session?.user) {
                      redirect("/api/auth/signin?callbackUrl=/plans");
                    } else {
                      redirect(
                        encodeURI(
                          `${checkoutUrl}?checkout[custom][user_id]=${session?.user.id}`,
                        ),
                      );
                    }
                  }}
                  disabled={plan === "PRO"}
                  className="w-full"
                >
                  Get Started
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </form>
              {/* <p className="mt-3 text-xs text-gray-400">
                Literally you probably haven't heard of them jean shorts.
              </p> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GreyTickIcon({
  stroke = "currentColor",
  premium = false,
}: {
  stroke?: string;
  premium?: boolean;
}) {
  return (
    <span className="mr-2 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gray-800 text-gray-500">
      <svg
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        className={`size-4 rounded-full p-0.5 ${premium ? "bg-white" : "bg-gray-800"} ${stroke}`}
        viewBox="0 0 24 24"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}
