import { Component } from '@angular/core';
import { ExperienceHero } from '../../components/experience-hero/experience-hero';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ExperienceHero],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {}
