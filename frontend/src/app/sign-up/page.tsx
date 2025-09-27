"use server";
import { redirect } from "next/navigation";
import React from "react";
import { SingUpForm } from "~/components/sign-up-form";
import { auth } from "~/server/auth";

export default async function page() {
  const session = await auth();

  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SingUpForm className="w-72 sm:w-96" />
    </div>
  );
}
