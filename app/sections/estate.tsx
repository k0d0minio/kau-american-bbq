import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";

const stats = [
  { value: "12h+", label: "In the smoke" },
  { value: "8", label: "Meats by weight" },
  { value: "1", label: "Godzilla — our smoker" },
];

export function Estate() {
  return (
    <section id="estate" className="relative bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow text-amber">The Smokehouse</p>
              <h2 className="mt-4 font-display text-4xl font-light leading-tight text-pine-900 text-balance sm:text-5xl">
                Real fire, real smoke, real patience
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5 text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
                <p>
                  KAU started with a bite of brisket in Paris and a pilgrimage to Texas. Years of
                  pop-ups, festivals and sold-out events later, Rui and Vera Matias opened the doors
                  of their mother house in Malveira — one of the largest steakhouses in the country.
                </p>
                <p>
                  Everything runs through Godzilla, our custom smoker. Meats go in before sunrise and
                  come out hours later — carved in the moment, weighed at the counter, and served
                  while the smoke ring is still proud.
                </p>
              </div>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-3 gap-6 border-t border-pine-900/10 pt-8">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <p className="font-display text-3xl text-pine-700 sm:text-4xl">{s.value}</p>
                  <p className="mt-1 text-xs leading-snug text-stone sm:text-sm">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl shadow-lift">
              <Image
                src="/img/seasoning.jpg"
                alt="Seasoning a brisket with rub before it goes into the smoke"
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* floating accent card */}
            <div className="absolute -bottom-6 -left-4 max-w-[15rem] rounded-2xl bg-cream-100 p-5 shadow-lift sm:-left-8">
              <p className="font-display text-lg italic text-pine-700">
                &ldquo;These guys really understand what American BBQ is.&rdquo;
              </p>
              <p className="mt-2 eyebrow text-stone">Guest review · Google</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
