"use client";

import { CardWrapper } from "./card-wrapper";
import * as z from "zod";
import { infer as zInfer } from "zod";
import { NewPasswordSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { newPassword } from "@/actions/new-password";
import { startTransition, useState } from "react";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<zInfer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: zInfer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");

    console.log(values);

    startTransition(() => {
      setIsLoading(true);
      newPassword(values, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
      setIsLoading(false);
    });
  };

  return (
    <CardWrapper
      headerTitle="Change Password"
      headerLabel="Enter a new password below"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            Reset Password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
