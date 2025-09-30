import Image from "next/image";
import Link from "next/link";
import CreatedBy from "~/components/created-by";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";

export default async function HomePage() {
  const session = await auth();

  const userLoggedIn = session?.user.id;
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center">
      <header className="fixed top-0 z-10 flex w-full items-center justify-between border-b bg-white p-2 sm:p-0 sm:px-3">
        <CreatedBy />
        {userLoggedIn ? (
          <Link href={"/dashboard"} className="flex">
            <Button>
              <Image
                src={"/logo.svg"}
                alt="PodClip.ai"
                height={20}
                width={20}
              />
              Dashboard{" "}
            </Button>
          </Link>
        ) : (
          <Link href={"/sign-up"}>
            <Button>
              <Image
                src={"/logo.svg"}
                alt="PodClip.ai"
                height={20}
                width={20}
              />
              Try out{" "}
            </Button>
          </Link>
        )}
      </header>
      <Image
        src={"/ss.png"}
        height={1000}
        width={900}
        alt="PodClip.ai"
        className="lg:pt-28"
      />
    </div>
  );
}
