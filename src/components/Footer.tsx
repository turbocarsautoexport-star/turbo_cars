import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-turbo-border bg-turbo-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo size={28} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-turbo-muted">
              TURBO — mashinalar bo&apos;yicha real vaqtda o&apos;tkaziladigan
              ishonchli kim oshdi savdosi platformasi.
            </p>
          </div>

          <div>
            <h4 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
              Navigatsiya
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-turbo-muted">
              <li>
                <Link href="/" className="hover:text-turbo-red">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/auksionlar" className="hover:text-turbo-red">
                  Barcha auksionlar
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-turbo-red">
                  Admin panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
              Aloqa
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-turbo-muted">
              <li>+998 90 000 00 00</li>
              <li>info@turbo-auksion.uz</li>
              <li>Toshkent, Yunusobod tumani</li>
            </ul>
          </div>

          <div>
            <h4 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
              Demo eslatma
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-turbo-muted">
              Bu versiya frontend-demo bosqichida: ma&apos;lumotlar brauzer
              xotirasida simulyatsiya qilinadi. Backend ulanganda real
              foydalanuvchilar va to&apos;lovlar qo&apos;shiladi.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-turbo-border pt-6 text-xs text-turbo-muted sm:flex-row">
          <p>© {new Date().getFullYear()} TURBO. Barcha huquqlar himoyalangan.</p>
          <p>Race sport regular · #f6060a · #120f0e</p>
        </div>
      </div>
    </footer>
  );
}
