"use client";

import { CardWrapper } from "./card-wrapper";
import * as z from "zod";
import { infer as zInfer } from "zod";
import { ResetSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { reset } from "@/actions/reset";
import { startTransition, useState } from "react";

export const ResetForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<zInfer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: zInfer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    console.log(values);

    startTransition(() => {
      setIsLoading(true);
      reset(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
      setIsLoading(false);
    });
  };

  return (
    <CardWrapper
      headerTitle="Forgot your password?"
      headerLabel="Enter your email below"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="lebron.james@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            Send reset email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
