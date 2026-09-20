import { NgComponentOutlet } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
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
  message = '';
  website = '';
  readonly sendState = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  readonly sendError = signal('');

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
  async sendMessage(): Promise<void> {
    if (this.sendState() === 'sending' || this.sendState() === 'sent') return;

    const industry = this.store.industry();
    if (!industry || !this.name.trim() || !this.contact.trim() || !this.city.trim()) return;

    this.sendState.set('sending');
    this.sendError.set('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.name.trim(),
          contact: this.contact.trim(),
          city: this.city.trim(),
          message: this.message.trim(),
          website: this.website,
          industry: industry.label,
          solutions: this.store.selectedAddons().map((item) => item.label),
        }),
      });

      if (!response.ok) throw new Error('Contact request failed');
      this.sendState.set('sent');
    } catch {
      this.sendState.set('error');
      this.sendError.set('Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.');
    }
  }

  editDetails(): void {
    this.sendState.set('idle');
    this.sendError.set('');
    this.back();
  }

  restart(): void {
    this.name = '';
    this.contact = '';
    this.city = '';
    this.message = '';
    this.website = '';
    this.sendState.set('idle');
    this.sendError.set('');
    this.store.restart();
    this.syncScene();
  }

  private syncScene(): void {
    this.businessScene?.sync(this.store.industryId(), this.store.step());
  }

}
