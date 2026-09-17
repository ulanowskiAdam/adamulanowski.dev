import { NgComponentOutlet } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectedAddons } from './selected-addons';
import { BusinessScene } from './business-scene';
import { AddonId, ConfiguratorStore, IndustryId } from './configurator.store';

@Component({
  selector: 'app-experience-hero',
  standalone: true,
  imports: [FormsModule, NgComponentOutlet, BusinessScene, SelectedAddons],
  templateUrl: './experience-hero.html',
  styleUrl: './experience-hero.scss',
})
export class ExperienceHero {
  @ViewChild(BusinessScene, { static: true }) private businessScene?: BusinessScene;

  readonly store = inject(ConfiguratorStore);
  name = '';
  contact = '';
  city = '';

  get mailtoLink(): string {
    const { subject, body } = this.emailDraft();
    return `mailto:aulanowski98@gmail.com?subject=${subject}&body=${body}`;
  }

  get gmailLink(): string {
    const { subject, body } = this.emailDraft();
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aulanowski98%40gmail.com&su=${subject}&body=${body}`;
  }

  start(): void {
    this.store.start();
    this.syncScene();
  }
  selectIndustry(id: IndustryId): void {
    this.store.selectIndustry(id);
    this.syncScene();
  }
  toggleAddon(id: AddonId): void {
    this.store.toggleAddon(id);
  }
  next(): void {
    this.store.next();
    this.syncScene();
  }
  back(): void {
    this.store.back();
    this.syncScene();
  }
  showResult(): void {
    if (this.name.trim() && this.contact.trim() && this.city.trim()) {
      this.store.showResult();
      this.syncScene();
    }
  }
  restart(): void {
    this.name = '';
    this.contact = '';
    this.city = '';
    this.store.restart();
    this.syncScene();
  }

  private syncScene(): void {
    this.businessScene?.sync(this.store.industryId(), this.store.step());
  }

  private emailBody(industry: string, solutions: string): string {
    return `Cześć Adam,\n\nChcę porozmawiać o usprawnieniu dla branży: ${industry}.\n\nWybrane rozwiązania:\n${solutions}\n\nImię: ${this.name.trim()}\nKontakt: ${this.contact.trim()}\nMiasto: ${this.city.trim()}\n\nPozdrawiam!`;
  }

  private emailDraft(): { subject: string; body: string } {
    const industry = this.store.industry()?.label ?? 'moja firma';
    const solutions =
      this.store
        .selectedAddons()
        .map((item) => `- ${item.label}`)
        .join('\n') || '- do ustalenia';
    return {
      subject: encodeURIComponent(`Koncepcja: ${industry}`),
      body: encodeURIComponent(this.emailBody(industry, solutions).replace(/\r?\n/g, '\r\n')),
    };
  }
}
