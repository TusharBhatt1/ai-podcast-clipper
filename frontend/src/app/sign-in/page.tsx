import { redirect } from "next/navigation";
import React from "react";
import { SignInForm } from "~/components/sign-in-form";
import { auth } from "~/server/auth";

export default async function page() {
  const session = await auth();

  if (session?.user?.id) redirect("/dashboard");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm className="w-72 sm:w-96" />
    </div>
  );
}
