import { redirect } from "next/navigation";
import React from "react";
import NavHeader from "~/components/nav-header";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user.id) redirect("/sign-in");

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
  });

  return (
    <div>
      <NavHeader user={user} />
      {children}
    </div>
  );
}
