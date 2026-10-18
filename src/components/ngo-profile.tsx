import { Building2 } from "lucide-react";

export function EmptyNgoProfile({ name }: { name?: string | undefined }) {
  return (
    <section className="mt-8 border-t py-10">
      <Building2 className="size-8 text-muted-foreground" />
      <h2 className="mt-4 break-words text-2xl font-semibold">{name ?? "Moja organizacja"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Profil NGO — ekran w przygotowaniu.</p>
    </section>
  );
}