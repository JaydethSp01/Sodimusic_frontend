/** Sustituye marcadores en textos del CMS (p. ej. {{count}}, {{total}}). */
export function replaceCatalogTemplate(
  template: string,
  vars: { count?: number; total?: number },
): string {
  let s = template;
  if (vars.count !== undefined) {
    s = s.split("{{count}}").join(String(vars.count));
  }
  if (vars.total !== undefined) {
    s = s.split("{{total}}").join(String(vars.total));
  }
  return s;
}
