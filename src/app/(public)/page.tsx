import { CircuitTrace } from "@/components/brand/circuit-trace";

export default function HomePage() {
  return (
    <section className="flex flex-col gap-4 py-12">
      <CircuitTrace />
      <h1 className="text-5xl sm:text-7xl">Hub S.I.</h1>
      <p className="max-w-xl text-lg text-muted">Em construção.</p>
    </section>
  );
}
