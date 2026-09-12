import { computed, Injectable, signal } from '@angular/core';
import {
  LucideBell,
  LucideBot,
  LucideBriefcaseBusiness,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideCalculator,
  LucideClipboardList,
  LucideHeartPulse,
  LucideIcon,
  LucideListChecks,
  LucideMailCheck,
  LucideRefreshCw,
  LucideShoppingCart,
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
          icon: LucideShoppingCart,
        },
        {
          id: 'gastronomia-rezerwacje',
          label: 'System rezerwacji stolików',
          description: 'Rezerwacje online, potwierdzenia i opcjonalne przedpłaty.',
          shortLabel: 'Rezerwacje',
          icon: LucideCalendarDays,
        },
        {
          id: 'gastronomia-asystent-ai',
          label: 'Asystent AI dla klientów',
          description: 'Odpowiada na pytania o menu, alergeny, godziny i dostępność.',
          shortLabel: 'Asystent AI',
          icon: LucideBot,
        },
        {
          id: 'gastronomia-kontakt-po-wizycie',
          label: 'Automatyczna obsługa po wizycie',
          description: 'Wysyła podziękowanie, ankietę lub prośbę o opinię.',
          shortLabel: 'Automatyzacje kontaktu',
          icon: LucideMailCheck,
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
          icon: LucideCalendarCheck,
        },
        {
          id: 'wizyty-przypomnienia',
          label: 'Automatyczne przypomnienia',
          description: 'SMS lub e-mail przed wizytą pomagający ograniczyć nieobecności.',
          shortLabel: 'Przypomnienia',
          icon: LucideBell,
        },
        {
          id: 'wizyty-asystent-ai',
          label: 'Asystent AI dla klientów',
          description: 'Odpowiada na częste pytania i pomaga dobrać właściwą usługę.',
          shortLabel: 'Asystent AI',
          icon: LucideBot,
        },
        {
          id: 'wizyty-powrot-klienta',
          label: 'Automatyzacja powrotu klienta',
          description: 'Przypomina o kolejnej wizycie na podstawie wykonanej usługi.',
          shortLabel: 'Powroty klientów',
          icon: LucideRefreshCw,
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
          icon: LucideClipboardList,
        },
        {
          id: 'fachowcy-konfigurator-wyceny',
          label: 'Konfigurator szybkiej wyceny',
          description: 'Oblicza orientacyjną cenę według ustalonych reguł.',
          shortLabel: 'Szybka wycena',
          icon: LucideCalculator,
        },
        {
          id: 'fachowcy-status-realizacji',
          label: 'Panel statusu realizacji',
          description: 'Klient sam sprawdza etap zlecenia, dokumenty i kolejne kroki.',
          shortLabel: 'Status zlecenia',
          icon: LucideListChecks,
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
    if (this.step() < 3) this.step.update((step) => step + 1);
  }
  back(): void {
    if (this.step() > 1) this.step.update((step) => step - 1);
  }
  showResult(): void {
    this.step.set(4);
  }
  restart(): void {
    this.step.set(0);
    this.industryId.set(null);
    this.selectedAddonIds.set(new Set());
    this.activeAddonId.set(null);
  }
}
