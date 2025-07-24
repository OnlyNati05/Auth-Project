import { getVerificationTokenByEmail } from "@/data/verification-token";
import { v4 as uuiv4 } from "uuid";
import { db } from "./db";

export const generateVerificationToken = async (email: string) => {
  const token = uuiv4();
  const expires = new Date(new Date().getTime() + 1000 * 60 * 60);

  const exisitingToken = await getVerificationTokenByEmail(email);

  if (exisitingToken) {
    await db.verificationToken.delete({
      where: {
        id: exisitingToken.id,
      },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};
