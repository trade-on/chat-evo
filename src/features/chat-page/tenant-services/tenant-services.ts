import { ServerActionResponse } from "@/features/common/server-action-response";
import { ChatThread, Tenant } from "@prisma/client";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { NEW_CHAT_NAME } from "@/features/theme/theme-config";
import { prisma } from "@/features/common/services/sql";
import { CreateChatThread } from "../chat-services/chat-thread-service";
import { RedirectToChatThread } from "@/features/common/navigation-helpers";

type CreateStripeSubscriptionProps = {
  email: string;
  name: string;
};

export const createStripeSubscription = async (
  formData: FormData
): Promise<Stripe.Response<Stripe.Subscription> | undefined> => {
  try {
    const stripe = new Stripe(process.env.STRIPE_API_KEY ?? "");
    const customer = await stripe.customers.create({
      email: formData.get("email") as string,
      name: formData.get("name") as string,
    });
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID ?? "",
          quantity: 1,
        },
      ],
    });
    return subscription;
  } catch (error) {
    console.error("Error", error);
  }
};

export const createStripeCheckoutSession = async () => {
  const stripe = new Stripe(process.env.STRIPE_API_KEY ?? "");
  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    currency: "jpy",
    // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
    // the actual Session ID is returned in the query parameter when your customer
    // is redirected to the success page.
    success_url:
      "http://localhost:3000/organization/register?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://locolhost:3000/organization/register",
  });
  redirect(session.url ?? "/");
};

export const CreateNewTenant = async () => {
  const response = await CreateChatThread();
  if (response.status === "OK") {
    RedirectToChatThread(response.response.id);
  }
};
