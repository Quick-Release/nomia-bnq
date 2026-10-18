import * as React from "react";

import { cn } from "../../../lib/utils";

export type MacroMesoMicroTierId = "macro" | "meso" | "micro";

export type MacroMesoMicroTier = {
  id: MacroMesoMicroTierId;
  /** e.g. "Macro" — also used as pill label */
  pillLabel: string;
  title: string;
  portraitSrc: string;
  portraitAlt: string;
  description: string;
};

export type NomiaMacroMesoMicroSectionProps = {
  leftImageSrc: string;
  leftImageAlt: string;
  tiers: readonly MacroMesoMicroTier[];
  defaultTierId?: MacroMesoMicroTierId;
};

const PILL_BASE =
  "text-extra font-primary rounded-[32px] px-2 py-1 font-medium leading-[var(--typography-line-height-j)] tracking-[var(--tracking-typography-0)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-main-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-monochrome-light-100";

export default function NomiaMacroMesoMicroSection({
  leftImageSrc,
  leftImageAlt,
  tiers,
  defaultTierId = "macro",
}: NomiaMacroMesoMicroSectionProps) {
  const [activeId, setActiveId] = React.useState<MacroMesoMicroTierId>(defaultTierId);
  const active = tiers.find((t) => t.id === activeId) ?? tiers[0];

  if (!active) {
    return null;
  }

  return (
    <div
      className="font-primary flex w-full flex-col md:flex-row md:items-stretch md:justify-center"
      data-node-id="40017244:13125"
    >
      <div className="relative min-h-[min(50svh,560px)] w-full md:min-h-[min(100svh,944px)] md:w-1/2 md:max-w-[960px] md:flex-none">
        <img
          src={leftImageSrc}
          alt={leftImageAlt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
          width={960}
          height={944}
        />
      </div>

      <div
        className="bg-monochrome-light-100 text-main-cinza-700 flex w-full flex-col md:min-h-[min(100svh,944px)] md:w-1/2 md:max-w-[960px] md:flex-none"
        data-nomia-header-surface="light"
      >
        <div
          className="flex min-h-0 flex-1 flex-col px-8 py-14 md:px-14 md:py-14"
          data-node-id="40017244:13127"
        >
          <div
            className="flex flex-1 flex-col items-center justify-center gap-10 pb-12 text-center md:max-w-[620px] md:mx-auto md:pb-20"
            data-node-id="40017244:13128"
          >
            <h2
              className="text-h4 font-semibold leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
              data-node-id="40017244:13129"
            >
              {active.title}
            </h2>
            <div
              className="relative aspect-[268/410] w-full max-w-[268px] overflow-hidden rounded-lg"
              data-node-id="40017244:13130"
            >
              <img
                key={active.id}
                src={active.portraitSrc}
                alt={active.portraitAlt}
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
                decoding="async"
                width={268}
                height={410}
              />
            </div>
            <p
              className="text-body font-normal leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)] max-w-prose whitespace-pre-wrap"
              data-node-id="40017244:13131"
            >
              {active.description}
            </p>
          </div>

          <div
            className="flex shrink-0 flex-wrap items-center justify-center gap-4 pb-6 pt-2"
            role="tablist"
            aria-label="Nível de ação"
            data-node-id="40017244:13132"
          >
            {tiers.map((tier) => {
              const selected = tier.id === active.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(tier.id)}
                  className={cn(
                    PILL_BASE,
                    selected
                      ? "bg-main-ciano-500 text-neutral-bw-white"
                      : "bg-neutral-bw-white text-main-ciano-500 hover:opacity-90",
                  )}
                  data-node-id={
                    tier.id === "macro"
                      ? "40017244:13133"
                      : tier.id === "meso"
                        ? "40017244:13135"
                        : "40017244:13137"
                  }
                >
                  {tier.pillLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
