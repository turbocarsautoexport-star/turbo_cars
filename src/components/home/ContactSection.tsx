const CONTACTS = [
  { label: "Telefon", value: "+998 90 000 00 00", href: "tel:+998900000000" },
  { label: "Email", value: "info@turbo-auksion.uz", href: "mailto:info@turbo-auksion.uz" },
  { label: "Manzil", value: "Toshkent, Yunusobod tumani" },
];

export default function ContactSection() {
  return (
    <section id="kontakt" className="border-t border-turbo-border bg-turbo-black-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
          Kontakt
        </p>
        <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
          Biz bilan bog&apos;laning
        </h2>
        <p className="mt-2 max-w-xl text-sm text-turbo-muted">
          Savolingiz bo&apos;lsa, quyidagi kanallar orqali yozing yoki pastki
          o&apos;ng burchakdagi chat orqali murojaat qiling.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONTACTS.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-turbo-border bg-turbo-surface p-5"
            >
              <p className="text-xs uppercase tracking-wide text-turbo-muted">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="mt-1 block text-white hover:text-turbo-red">
                  {c.value}
                </a>
              ) : (
                <p className="mt-1 text-white">{c.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
