import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { BusinessScene } from './business-scene';
import { AddonId, ConfiguratorStore, IndustryId } from './configurator.store';

@Component({
  selector: 'app-experience-hero',
  imports: [RouterLink, NgComponentOutlet, BusinessScene],
  providers: [ConfiguratorStore],
  templateUrl: './experience-hero.html',
  styleUrl: './experience-hero.scss',
})
export class ExperienceHero {
  readonly initialIndustry = input<IndustryId>('gastronomia');
  readonly store = inject(ConfiguratorStore);
  readonly explored = signal(false);
  readonly mobileStep = signal(1);
  readonly steps = ['Branża', 'Funkcje', 'Podsumowanie'];
  readonly labels: Record<IndustryId, string> = {
    gastronomia: 'Gastronomia',
    wizyty: 'Wizyty',
    fachowcy: 'Usługi',
  };
  constructor() {
    this.store.selectIndustry('gastronomia');
    effect(() => {
      const industry = this.initialIndustry();
      untracked(() => {
        this.store.selectIndustry(industry);
        this.explored.set(false);
        this.mobileStep.set(1);
      });
    });
  }
  selectIndustry(id: IndustryId) {
    this.store.selectIndustry(id);
    this.explored.set(true);
  }
  toggleAddon(id: AddonId) {
    this.store.toggleAddon(id);
    this.explored.set(true);
  }
  restart() {
    this.store.restart();
    this.store.selectIndustry(this.initialIndustry());
    this.explored.set(false);
    this.mobileStep.set(1);
  }
  get context() {
    if (!this.explored()) return '';
    return [
      'Inspiracja z demo',
      this.store.industry()?.label,
      ...this.store.selectedAddons().map((item) => item.label),
    ]
      .filter(Boolean)
      .join(' — ')
      .slice(0, 500);
  }
}
