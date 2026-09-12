import { NgComponentOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CafeTiles } from './cafe-tiles';
import { BusinessScene } from './business-scene';
import { AddonId, ConfiguratorStore, IndustryId } from './configurator.store';

@Component({
  selector: 'app-experience-hero',
  standalone: true,
  imports: [FormsModule, NgComponentOutlet, BusinessScene, CafeTiles],
  templateUrl: './experience-hero.html',
  styleUrl: './experience-hero.scss',
})
export class ExperienceHero {
  readonly store = inject(ConfiguratorStore);
  name = '';
  contact = '';
  city = '';

  get mailtoLink(): string {
    const subject = encodeURIComponent(
      `Koncepcja cyfrowego usprawnienia — ${this.store.industry()?.label ?? 'moja firma'}`,
    );
    const solutions =
      this.store
        .selectedAddons()
        .map((item) => `- ${item.label}`)
        .join('\n') || '- do ustalenia';
    const body = encodeURIComponent(
      `Cześć Adam,\n\nchcę porozmawiać o przygotowanej koncepcji cyfrowego usprawnienia.\n\nImię: ${this.name.trim()}\nKontakt: ${this.contact.trim()}\nMiasto: ${this.city.trim()}\nBranża: ${this.store.industry()?.label ?? 'do ustalenia'}\n\nWybrane rozwiązania:\n${solutions}}`,
    );
    return `mailto:aulanowski98@gmail.com?subject=${subject}&body=${body}`;
  }

  start(): void {
    this.store.start();
  }
  selectIndustry(id: IndustryId): void {
    this.store.selectIndustry(id);
  }
  toggleAddon(id: AddonId): void {
    this.store.toggleAddon(id);
  }
  next(): void {
    this.store.next();
  }
  back(): void {
    this.store.back();
  }
  showResult(): void {
    if (this.name.trim() && this.contact.trim() && this.city.trim()) this.store.showResult();
  }
  restart(): void {
    this.name = '';
    this.contact = '';
    this.city = '';
    this.store.restart();
  }
}
