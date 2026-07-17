import { getCars } from "@/lib/queries/cars";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_CARS } from "@/lib/mockMarketing";
import CarCard from "@/components/export/CarCard";
import { Car } from "@/lib/types";

async function loadCars(): Promise<Car[]> {
  if (!isSupabaseConfigured) return MOCK_CARS;
  const supabase = await createClient();
  return getCars(supabase);
}

export default async function EksportPage() {
  const cars = await loadCars();
  const inStock = cars.filter((c) => c.status !== "sold");
  const delivered = cars.filter((c) => c.status === "sold");

  return (
    <div>
      <section className="relative overflow-hidden border-b border-turbo-border bg-turbo-black">
        <div className="speed-lines absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
            Eksport
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl leading-[1.1] text-white sm:text-5xl">
            Xorijdan avtomobil eksporti — hujjatidan yetkazib berishgacha
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-turbo-muted sm:text-base">
            Tanlov, sotib olish, tashish va bojxona rasmiylashtiruvi — barcha
            jarayonni o&apos;z ustimizga olamiz. Quyida hozirda sotuvdagi va
            yetkazib berilgan avtomobillarni ko&apos;rishingiz mumkin.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Sotuvda mavjud ({inStock.length})
        </h2>
        {inStock.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-turbo-border py-12 text-center text-sm text-turbo-muted">
            Hozircha sotuvda avtomobil yo&apos;q. Tez orada yangilanadi.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inStock.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {delivered.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
            Yaqinda yetkazib berilgan
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {delivered.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
