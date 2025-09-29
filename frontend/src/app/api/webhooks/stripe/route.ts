import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "~/env";
import { db } from "~/server/db";

const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      WEBHOOK_SECRET,
    );

    if (
      event.type === "checkout.session.completed" ||
      event.type === "charge.updated"
    ) {
      const session = event.data.object;

      const retrievedSession = await stripe.checkout.sessions.retrieve(
        session.id,
        { expand: ["line_items"] },
      );

      const line_items = retrievedSession.line_items;

      if (line_items && line_items.data.length > 0) {
        const priceId = line_items.data[0]?.price?.id ?? undefined;

        if (priceId) {
          let creditsToAdd = 0;

          if (priceId === env.STRIPE_SMALL_PRICE_ID) creditsToAdd = 50;
          if (priceId === env.STRIPE_MEDIUM_PRICE_ID) creditsToAdd = 150;
          if (priceId === env.STRIPE_LARGE_PRICE_ID) creditsToAdd = 500;

          const stripeCustomerId = session.customer as string;

          await db.user.update({
            where: {
              stripeCustomerId,
            },
            data: {
              credits: {
                increment: creditsToAdd,
              },
            },
          });

          return new NextResponse(null, {
            status: 200,
          });
        }
      }
    }
  } catch (error) {
    console.log("WEBHOOK SIGNATURE VERIFICATION FAILED: ", error);
    return new NextResponse("WEBHOOK SIGNATURE VERIFICATION FAILED:", {
      status: 500,
    });
  }
}
