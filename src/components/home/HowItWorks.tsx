const STEPS = [
  {
    n: "01",
    title: "Auksionni tanlang",
    text: "Jonli yoki tez orada boshlanadigan mashina savdolaridan birini tanlang, batafsil ma'lumot bilan tanishing.",
  },
  {
    n: "02",
    title: "Real vaqtda taklif bering",
    text: "Narx har soniyada boshqa ishtirokchilar tomonidan oshirib boriladi — o'z taklifingizni kiriting va reytingda oldinga chiqing.",
  },
  {
    n: "03",
    title: "Taймер nazorati",
    text: "Har bir savdo aniq belgilangan vaqtda avtomatik yopiladi, admin esa istalgan vaqt savdoni qo'lda yakunlashi mumkin.",
  },
  {
    n: "04",
    title: "G'olib e'lon qilinadi",
    text: "Savdo yakunlanishi bilan eng yuqori taklif beruvchi g'olib deb e'lon qilinadi va statistika yangilanadi.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-turbo-border bg-turbo-black-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
          Jarayon
        </p>
        <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
          Savdo qanday ishlaydi
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-turbo-border bg-turbo-surface p-6"
            >
              <span className="font-display text-3xl text-turbo-red/70">{step.n}</span>
              <h3 className="mt-3 font-condensed text-lg font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-turbo-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
