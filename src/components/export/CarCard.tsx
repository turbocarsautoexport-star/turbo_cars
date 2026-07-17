import { Car } from "@/lib/types";
import CarIllustration from "@/components/CarIllustration";

const STATUS_LABEL: Record<Car["status"], string> = {
  in_stock: "Sotuvda",
  transit: "Yo'lda",
  sold: "Yetkazib berildi",
};

const STATUS_CLASS: Record<Car["status"], string> = {
  in_stock: "border-turbo-green/30 bg-turbo-green/10 text-turbo-green",
  transit: "border-turbo-gold/30 bg-turbo-gold/10 text-turbo-gold",
  sold: "border-turbo-border bg-white/5 text-turbo-muted",
};

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-turbo-border bg-turbo-surface transition-all hover:-translate-y-1 hover:border-turbo-red/50">
      <div className="relative h-44">
        {car.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.photos[0]} alt={car.model} className="h-full w-full object-cover" />
        ) : (
          <CarIllustration className="h-full w-full" label={car.model} />
        )}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_CLASS[car.status]}`}
          >
            {STATUS_LABEL[car.status]}
          </span>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 font-condensed text-xs font-bold text-white backdrop-blur">
          {car.year}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-condensed text-lg font-bold text-white group-hover:text-turbo-red">
          {car.model}
        </h3>
        {car.category && <p className="mt-0.5 text-xs text-turbo-muted">{car.category}</p>}
      </div>
    </div>
  );
}
