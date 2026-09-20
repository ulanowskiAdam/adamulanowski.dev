import { Component } from '@angular/core';
import { AboutPortrait } from '../../components/about-portrait/about-portrait';
import { ExperienceHero } from '../../components/experience-hero/experience-hero';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ExperienceHero, AboutPortrait],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {}
