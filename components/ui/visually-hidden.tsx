/** Texto solo para lectores de pantalla. */
export function VisuallyHidden({ children, as: Tag = "span" }: { children: React.ReactNode; as?: "span" | "div" }) {
  return <Tag className="sr-only">{children}</Tag>;
}
