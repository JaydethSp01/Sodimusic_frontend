import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Formulario POST a /logout (route handler fuera del middleware de auth). */
export function AdminLogoutButton() {
  return (
    <form method="post" action="/logout" className="min-w-0 flex-1">
      <Button type="submit" variant="outline" className="w-full">
        <LogOut strokeWidth={1.75} aria-hidden />
        Cerrar sesión
      </Button>
    </form>
  );
}
