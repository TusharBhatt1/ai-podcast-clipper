import { redirect } from "next/navigation";
import React from "react";
import { auth } from "~/server/auth";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user.id) redirect("/sign-in");

  return <div>{children}</div>;
}
