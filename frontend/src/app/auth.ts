"use server"
import type { TSingUpFormData } from "~/components/sign-up-form";
import { signIn } from "~/server/auth";

export async function signInUser(data: TSingUpFormData) {
  await signIn("credentials", data);
}
export async function signUpUser(data: TSingUpFormData) {
    return
}