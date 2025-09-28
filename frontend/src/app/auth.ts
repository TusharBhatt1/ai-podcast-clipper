"use server"
import type { TSignUpFormData } from "~/components/sign-up-form";
import { signIn } from "~/server/auth";

export async function signInUser(data: TSignUpFormData) {
  await signIn("credentials", data);
}
export async function signUpUser(data: TSignUpFormData) {
    return
}