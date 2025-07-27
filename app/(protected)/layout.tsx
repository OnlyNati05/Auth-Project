import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  return (
    <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center gradient-anim">
      <SessionProvider session={session}>
        <Navbar />
        {children}
      </SessionProvider>
    </div>
  );
}
