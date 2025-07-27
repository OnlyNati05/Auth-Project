"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validateFields = LoginSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validateFields.data;

  const exisitingUser = await getUserByEmail(email);

  if (!exisitingUser || !exisitingUser.email || !exisitingUser.password) {
    console.log("ERRRR");
    return { error: "Invalid credentials" };
  }

  if (!exisitingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      exisitingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Confirmation email sent" };
  }

  if (exisitingUser.isTwoFactorEnabled && exisitingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(
        exisitingUser.email
      );

      if (!twoFactorToken) {
        return { error: "Invalid code" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired" };
      }

      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      const exisitingConfirmation = await getTwoFactorConfirmationByUserId(
        exisitingUser.id
      );

      if (exisitingConfirmation) {
        await db.twoFactorConformation.delete({
          where: {
            id: exisitingConfirmation.id,
          },
        });
      }

      await db.twoFactorConformation.create({
        data: {
          userId: exisitingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(exisitingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    console.log("HELLO1");
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });

    console.log("HELLO_END");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
};
