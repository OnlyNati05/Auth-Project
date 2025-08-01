"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@/lib/generated/prisma";
import { FormError } from "../form-error";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole();

  if (role !== allowedRole) {
    return (
      <FormError message="You do not have premession to view this content" />
    );
  }

  return <>{children}</>;
};
