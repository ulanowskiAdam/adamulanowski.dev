import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { BusinessScene } from './business-scene';
import { SelectedAddons } from './selected-addons';
import { AddonId, ConfiguratorStore, IndustryId } from './configurator.store';

@Component({
  selector: 'app-experience-hero',
  imports: [RouterLink, NgComponentOutlet, BusinessScene, SelectedAddons],
  providers: [ConfiguratorStore],
  templateUrl: './experience-hero.html',
  styleUrl: './experience-hero.scss',
})
export class ExperienceHero {
  readonly store = inject(ConfiguratorStore);
  readonly explored = signal(false);
  readonly labels: Record<IndustryId, string> = {
    gastronomia: 'Gastronomia',
    wizyty: 'Wizyty',
    fachowcy: 'Usługi',
  };
  constructor() {
    this.store.selectIndustry('gastronomia');
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
    this.store.selectIndustry('gastronomia');
    this.explored.set(false);
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
