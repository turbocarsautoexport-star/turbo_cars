import Link from "next/link";

const PRODUCTS = [
  {
    href: "/eksport",
    emoji: "🚢",
    title: "Avtomobil eksporti",
    text: "Xorijdan avtomobil tanlash, sotib olish va O'zbekistonga yetkazib berish xizmati — barcha bosqichlar shaffof va nazorat ostida.",
    cta: "Eksport katalogi",
  },
  {
    href: "/auksionlar",
    emoji: "🔨",
    title: "Kim oshdi savdosi",
    text: "Real vaqtda o'tkaziladigan mashinalar auksioni. Jonli narx oshishi, aniq taймer va shaffof g'oliblar.",
    cta: "Jonli savdolar",
  },
  {
    href: "/portal",
    emoji: "🧭",
    title: "Mijozlar portali",
    text: "Yangiliklar, takliflar, valyuta kursi, konteyner va buyurtma kuzatuvi, sharhlar — barchasi bir joyda.",
    cta: "Portalga o'tish",
  },
];

export default function ProductLinks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Xizmatlarimiz
      </p>
      <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
        Qaysi bo&apos;lim kerak?
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PRODUCTS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group relative overflow-hidden rounded-3xl border border-turbo-border bg-turbo-surface p-8 transition-colors hover:border-turbo-red/50"
          >
            <span className="text-4xl">{p.emoji}</span>
            <h3 className="mt-4 font-condensed text-xl font-bold uppercase tracking-wide text-white">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-turbo-muted">{p.text}</p>
            <span className="mt-6 inline-flex items-center gap-1 font-condensed text-sm font-bold uppercase tracking-wide text-turbo-red">
              {p.cta}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
