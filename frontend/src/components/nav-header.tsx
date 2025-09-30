"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "next-auth/react";
import type { User } from "@prisma/client";
import Image from "next/image";

const NavHeader = ({ user }: { user: User }) => {
  const { email, credits } = user;
  return (
    <header className="bg-background sticky top-0 z-10 flex justify-center border-b">
      <div className="container flex h-16 items-center justify-between px-2 xs:px-4 py-2">
        <Link href="/dashboard" className="flex items-center">
          <Image src={"/logo-with-name.svg"} alt="PodClip" className="sm:block hidden" height={120} width={120}/>
          <Image src={"/logo.svg"} alt="PodClip" className="sm:hidden block" height={40} width={40}/>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={"outline"}>
              {credits}
              {credits > 1 ? " credits" : " credit"} left
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/billing">Buy more</Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0"
              >
                <Avatar>
                  <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="text-muted-foreground text-xs">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/sign-in" })}
                className="text-destructive cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
