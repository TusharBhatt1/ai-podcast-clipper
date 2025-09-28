import React from "react";
import { SignInForm } from "~/components/sign-in-form";

export default async function page() {

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm className="w-72 sm:w-96" />
    </div>
  );
}
