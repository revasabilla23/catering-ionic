// src/app/app.component.ts

import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ThemeService } from './services/theme.service'; // <-- Import ThemeService

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private themeService: ThemeService // <-- Suntikkan (Inject) ThemeService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // Panggil fungsi inisialisasi tema
    this.themeService.initTheme();
  }
}