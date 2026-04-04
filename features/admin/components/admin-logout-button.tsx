"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  return (
    <Button type="button" variant="outline" className="w-full" onClick={() => void signOut({ callbackUrl: "/" })}>
      Cerrar sesión
    </Button>
  );
}
