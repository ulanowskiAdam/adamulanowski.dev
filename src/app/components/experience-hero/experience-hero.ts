import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { BusinessScene } from './business-scene';
import { SelectedAddons } from './selected-addons';
import { AboutPortrait } from '../about-portrait/about-portrait';
import { AddonId, ConfiguratorStore, IndustryId } from './configurator.store';

@Component({
  selector: 'app-experience-hero',
  imports: [RouterLink, NgComponentOutlet, BusinessScene, SelectedAddons, AboutPortrait],
  providers: [ConfiguratorStore],
  templateUrl: './experience-hero.html',
  styleUrl: './experience-hero.scss',
})
export class ExperienceHero {
  @ViewChild('stepTitle') private stepTitle?: ElementRef<HTMLElement>;
  readonly store = inject(ConfiguratorStore);
  showVisual = false;
  start() {
    this.store.start();
    this.focusStep();
  }
  selectIndustry(id: IndustryId) {
    this.store.selectIndustry(id);
  }
  toggleAddon(id: AddonId) {
    this.store.toggleAddon(id);
  }
  next() {
    this.store.next();
    this.focusStep();
  }
  back() {
    this.store.back();
    this.focusStep();
  }
  restart() {
    this.store.restart();
  }
  private focusStep() {
    setTimeout(() => this.stepTitle?.nativeElement.focus());
  }
  get context() {
    return [this.store.industry()?.label, ...this.store.selectedAddons().map((item) => item.label)]
      .filter(Boolean)
      .join(' — ');
  }
}
