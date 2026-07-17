import Logo from "../Logo";

export default function BrandHero() {
  return (
    <section className="relative overflow-hidden border-b border-turbo-border bg-turbo-black">
      <div className="speed-lines absolute inset-0 opacity-60" />
      <div
        className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--turbo-red)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <Logo size={40} />

          <h1 className="mt-6 font-display text-4xl leading-[1.05] text-white sm:text-6xl">
            Avtomobil <span className="text-gradient-red">eksporti</span> va{" "}
            <span className="text-gradient-red">auksionlari</span> — bitta manzilda
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-turbo-muted sm:text-lg">
            TURBO — xorijdan avtomobil eksport qilish va onlayn kim oshdi
            savdolarini bir platformada birlashtirgan ishonchli xizmat.
            Har bir bosqich shaffof, har bir savdo nazorat ostida.
          </p>
        </div>
      </div>
    </section>
  );
}
