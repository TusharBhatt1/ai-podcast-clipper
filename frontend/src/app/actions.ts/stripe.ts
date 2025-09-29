"use server";
import Stripe from "stripe";
import type { PriceId } from "../dashboard/billing/page";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function getCheckoutSession(priceId: PriceId) {
  let redirectUrl = null;
  try {
    const session = await auth();

    if (!session?.user.id) throw new Error("UNAUTHORIZED");

    let stripePriceId;

    if (priceId === "small") stripePriceId = env.STRIPE_SMALL_PRICE_ID;
    if (priceId === "medium") stripePriceId = env.STRIPE_MEDIUM_PRICE_ID;
    else stripePriceId = env.STRIPE_LARGE_PRICE_ID;

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
    });

    if (!user.stripeCustomerId) throw new Error("STRIPE CUSTOMER ID NOT FOUND");

    const { url } = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer: user.stripeCustomerId,
      mode: "payment",
      success_url: `${env.NEXT_PUBLIC_BASE_URL}?paymentStatus=true`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/paymentStatus=false`,
    });

    if (!url)
      throw new Error("SOMETHING WENT WRONG WHILE CREATING CHECKOUT URL");

    redirectUrl = url;
  } catch (error) {
    console.log(error);
    throw new Error("SOMETHING WENT WRONG WHILE CREATING CHECKOUT SESSION");
  } finally {
    if (redirectUrl) redirect(redirectUrl);
  }
}
