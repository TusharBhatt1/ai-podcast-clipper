"use server";
import type { TAuthFormFieldsData } from "~/components/sign-up-form";
import { signIn } from "~/server/auth";
import { db } from "~/server/db";
import bcrypt from "bcrypt";
// import stripe, { Stripe } from "stripe";
interface AuthReturnValues {
  success: boolean;
  message: string;
}

export async function signInUser(data: TAuthFormFieldsData) {
  try {
    await signIn("credentials", data);
  } catch (e) {
    console.error(e);
  }
}
export async function signUpUser(
  data: TAuthFormFieldsData,
): Promise<AuthReturnValues> {
  try {
    const existingUser = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return { success: false, message: "EMAIL ALREADY IN USE" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // const stripe = new Stripe("TODO:STRIPE KEY");

    // const stripeCustomer = await stripe.customers.create({
    //   email: data.email,
    // });

    await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        // stripeCustomerId: stripeCustomer.id,
      },
    });

    return { success: true, message: "USER CREATED" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "SOMETHING WENT WRONG" };
  }
}
