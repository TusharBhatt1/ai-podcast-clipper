"use server";
import React from "react";
import { SignUpForm } from "~/components/sign-up-form";

export default async function page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUpForm className="w-72 sm:w-96" />
    </div>
  );
}
