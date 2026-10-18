import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ngo/$name")({
  head: ({ params }) => ({
    meta: [
      { title: `Profil organizacji: ${params.name}` },
      { name: "description", content: "Profil organizacji składającej wnioski o rezerwację." },
      { property: "og:title", content: `Profil organizacji: ${params.name}` },
      { property: "og:description", content: "Profil organizacji składającej wnioski o rezerwację." },
    ],
  }),
  component: NgoProfile,
});

function NgoProfile() {
  const { name } = Route.useParams();
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button onClick={() => router.history.back()} className="text-sm text-muted-foreground hover:underline">← Wróć</button>
      <p className="mt-4 text-sm uppercase tracking-widest text-accent">Profil organizacji</p>
      <h1 className="text-4xl font-semibold">{name}</h1>
      <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
        Profil NGO — ekran w przygotowaniu.
      </div>
      <Link to="/" className="mt-6 inline-block text-sm hover:underline">Kalendarz</Link>
    </div>
  );
}
