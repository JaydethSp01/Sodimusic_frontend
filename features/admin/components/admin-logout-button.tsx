import { Button } from "@/components/ui/button";

/** Formulario POST a /logout (route handler fuera del middleware de auth). */
export function AdminLogoutButton() {
  return (
    <form method="post" action="/logout" className="w-full">
      <Button type="submit" variant="outline" className="w-full">
        Cerrar sesión
      </Button>
    </form>
  );
}
