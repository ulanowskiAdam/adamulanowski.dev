import { computed, Injectable, signal } from '@angular/core';
import {
  LucideBellRing,
  LucideBadgeDollarSign,
  LucideBotMessageSquare,
  LucideBriefcaseBusiness,
  LucideCalendarClock,
  LucideCalendarHeart,
  LucideClipboardPenLine,
  LucideHeartPulse,
  LucideHistory,
  LucideIcon,
  LucideMessageCircleMore,
  LucideRoute,
  LucideShoppingBag,
  LucideUtensilsCrossed,
  LucideWorkflow,
} from '@lucide/angular';

export type IndustryId = 'gastronomia' | 'wizyty' | 'fachowcy';
export type AddonId =
  | 'gastronomia-zamowienia-online'
  | 'gastronomia-rezerwacje'
  | 'gastronomia-asystent-ai'
  | 'gastronomia-kontakt-po-wizycie'
  | 'wizyty-rezerwacje'
  | 'wizyty-przypomnienia'
  | 'wizyty-asystent-ai'
  | 'wizyty-powrot-klienta'
  | 'fachowcy-formularz-zapytania'
  | 'fachowcy-konfigurator-wyceny'
  | 'fachowcy-status-realizacji'
  | 'fachowcy-obsluga-zlecen';

export interface AddonDefinition {
  readonly id: AddonId;
  readonly label: string;
  readonly description: string;
  readonly shortLabel: string;
  readonly icon: LucideIcon;
}

export interface IndustryDefinition {
  readonly id: IndustryId;
  readonly label: string;
  readonly sceneLabel: string;
  readonly icon: LucideIcon;
  readonly addons: readonly AddonDefinition[];
}

@Injectable({ providedIn: 'root' })
export class ConfiguratorStore {
  readonly industries: readonly IndustryDefinition[] = [
    {
      id: 'gastronomia',
      label: 'Gastronomia',
      sceneLabel: 'Obsługa lokalu & zamówienia',
      icon: LucideUtensilsCrossed,
      addons: [
        {
          id: 'gastronomia-zamowienia-online',
          label: 'Aplikacja do zamówień online',
          description: 'Własny proces zamówienia, płatności i odbioru bez pośrednika.',
          shortLabel: 'Zamówienia online',
          icon: LucideShoppingBag,
        },
        {
          id: 'gastronomia-rezerwacje',
          label: 'System rezerwacji stolików',
          description: 'Rezerwacje online, potwierdzenia i opcjonalne przedpłaty.',
          shortLabel: 'Rezerwacje',
          icon: LucideCalendarClock,
        },
        {
          id: 'gastronomia-asystent-ai',
          label: 'Asystent AI dla klientów',
          description: 'Odpowiada na pytania o menu, alergeny, godziny i dostępność.',
          shortLabel: 'Asystent AI',
          icon: LucideBotMessageSquare,
        },
        {
          id: 'gastronomia-kontakt-po-wizycie',
          label: 'Automatyczna obsługa po wizycie',
          description: 'Wysyła podziękowanie, ankietę lub prośbę o opinię.',
          shortLabel: 'Automatyzacje kontaktu',
          icon: LucideMessageCircleMore,
        },
      ],
    },
    {
      id: 'wizyty',
      label: 'Beauty, zdrowie i wizyty',
      sceneLabel: 'Wizyty & obsługa klientów',
      icon: LucideHeartPulse,
      addons: [
        {
          id: 'wizyty-rezerwacje',
          label: 'Aplikacja do rezerwacji wizyt',
          description: 'Klient sam wybiera usługę, specjalistę i wolny termin.',
          shortLabel: 'Rezerwacje 24/7',
          icon: LucideCalendarHeart,
        },
        {
          id: 'wizyty-przypomnienia',
          label: 'Automatyczne przypomnienia',
          description: 'SMS lub e-mail przed wizytą pomagający ograniczyć nieobecności.',
          shortLabel: 'Przypomnienia',
          icon: LucideBellRing,
        },
        {
          id: 'wizyty-asystent-ai',
          label: 'Asystent AI dla klientów',
          description: 'Odpowiada na częste pytania i pomaga dobrać właściwą usługę.',
          shortLabel: 'Asystent AI',
          icon: LucideBotMessageSquare,
        },
        {
          id: 'wizyty-powrot-klienta',
          label: 'Automatyzacja powrotu klienta',
          description: 'Przypomina o kolejnej wizycie na podstawie wykonanej usługi.',
          shortLabel: 'Powroty klientów',
          icon: LucideHistory,
        },
      ],
    },
    {
      id: 'fachowcy',
      label: 'Fachowcy i usługi',
      sceneLabel: 'Zapytania & realizacje',
      icon: LucideBriefcaseBusiness,
      addons: [
        {
          id: 'fachowcy-formularz-zapytania',
          label: 'Inteligentny formularz zapytania',
          description: 'Zbiera opis, zdjęcia, lokalizację, termin i najważniejsze wymagania.',
          shortLabel: 'Lepsze zapytania',
          icon: LucideClipboardPenLine,
        },
        {
          id: 'fachowcy-konfigurator-wyceny',
          label: 'Konfigurator szybkiej wyceny',
          description: 'Oblicza orientacyjną cenę według ustalonych reguł.',
          shortLabel: 'Szybka wycena',
          icon: LucideBadgeDollarSign,
        },
        {
          id: 'fachowcy-status-realizacji',
          label: 'Panel statusu realizacji',
          description: 'Klient sam sprawdza etap zlecenia, dokumenty i kolejne kroki.',
          shortLabel: 'Status zlecenia',
          icon: LucideRoute,
        },
        {
          id: 'fachowcy-obsluga-zlecen',
          label: 'Automatyzacja obsługi zleceń',
          description: 'Łączy formularz, CRM, kalendarz, powiadomienia i dokumenty.',
          shortLabel: 'Obsługa zleceń',
          icon: LucideWorkflow,
        },
      ],
    },
  ];

  readonly step = signal(0);
  readonly industryId = signal<IndustryId | null>(null);
  readonly selectedAddonIds = signal<ReadonlySet<AddonId>>(new Set());
  readonly activeAddonId = signal<AddonId | null>(null);
  readonly industry = computed(
    () => this.industries.find((item) => item.id === this.industryId()) ?? null,
  );
  readonly addons = computed(() => this.industry()?.addons ?? []);
  readonly selectedAddons = computed(() =>
    this.addons().filter((item) => this.selectedAddonIds().has(item.id)),
  );

  start(): void {
    this.step.set(1);
  }
  selectIndustry(id: IndustryId): void {
    if (this.industryId() !== id) {
      this.selectedAddonIds.set(new Set());
      this.activeAddonId.set(null);
    }
    this.industryId.set(id);
  }
  toggleAddon(id: AddonId): void {
    const next = new Set(this.selectedAddonIds());
    if (next.has(id)) {
      next.delete(id);
      this.activeAddonId.set([...next].at(-1) ?? null);
    } else {
      next.add(id);
      this.activeAddonId.set(id);
    }
    this.selectedAddonIds.set(next);
  }
  next(): void {
    if (this.step() === 1 && this.industryId()) this.step.set(2);
  }
  back(): void {
    if (this.step() > 1) this.step.update((step) => step - 1);
  }
  showResult(): void {
    if (this.industryId()) this.step.set(2);
  }
  restart(): void {
    this.step.set(0);
    this.industryId.set(null);
    this.selectedAddonIds.set(new Set());
    this.activeAddonId.set(null);
  }
}
