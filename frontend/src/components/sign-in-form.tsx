"use client";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signInUser } from "~/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formSchema, type TAuthFormFieldsData } from "./sign-up-form";
import { useRouter } from "next/navigation";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TAuthFormFieldsData>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  async function onSubmit(values: TAuthFormFieldsData) {
    try {
      await signInUser(values);
      router.push("/dashboard");
    } catch {
      toast.error("SOMETHING WENT WRONG");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  required
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}{" "}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  required
                  disabled={isSubmitting}
                />

                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password?.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Login
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Dont have an account?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
