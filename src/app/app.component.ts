// src/app/app.component.ts

declare var navigator: any;

import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private isAlertOpen = false; // ✅ Tambahkan ini

  constructor(
    private platform: Platform,
    private router: Router,
    private themeService: ThemeService,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    this.themeService.initTheme();

    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: false });

    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;

      if (this.isAlertOpen) return; // ✅ Cegah alert muncul/tertutup berulang

      if (currentUrl === '/hrga/dashboard' || currentUrl === '/karyawan-dashboard') {
        this.confirmLogout();
      } else if (currentUrl === '/login') {
        navigator.app.exitApp();
      } else {
        window.history.back();
      }
    });
  }

  async confirmLogout() {
    this.isAlertOpen = true; // ✅ Set flag saat alert muncul

    const alert = await this.alertController.create({
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar?',
      backdropDismiss: false, // ✅ Jangan biarkan ditutup sembarangan
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          handler: () => {
            this.isAlertOpen = false; // ✅ Reset flag saat dibatalkan
          }
        },
        {
          text: 'Logout',
          handler: () => {
            this.isAlertOpen = false;
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  logout() {
    localStorage.clear(); // atau this.authService.logout(); jika kamu pakai
    this.router.navigateByUrl('/login');
  }
}
