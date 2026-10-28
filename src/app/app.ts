import { AnalyticsConsent } from './components/analytics-consent';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader, SiteFooter } from './components/site-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter, AnalyticsConsent],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
