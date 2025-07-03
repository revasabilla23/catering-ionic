/* ============================================================================
 * File: hrga-dashboard.page.ts
 * Deskripsi: Disesuaikan agar sinkron dengan template HTML responsif terbaru.
 * ============================================================================
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, 
  IonSpinner, IonIcon, IonRefresher, IonRefresherContent, 
  IonPopover, IonList, IonItem, IonLabel, IonAvatar, 
  IonToggle, IonButtons, IonItemDivider, IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  sunnyOutline, moonOutline, clipboardOutline, peopleOutline, 
  fastFoodOutline, analyticsOutline, chevronForwardOutline, 
  personAddOutline, addCircleOutline, syncOutline, 
  documentTextOutline, checkmarkCircle, closeCircle, 
  personCircleOutline, logOutOutline, locationOutline, 
  callOutline, businessOutline, settingsOutline,
  chevronDownOutline
} from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

registerLocaleData(localeId, 'id');

@Component({
  selector: 'app-hrga-dashboard',
  templateUrl: './hrga-dashboard.page.html',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DatePipe,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonSpinner, 
    IonIcon, 
    IonRefresher, 
    IonRefresherContent, 
    IonPopover, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonAvatar, 
    IonToggle, 
    IonButtons, 
    IonItemDivider,
    IonBadge
  ],
})
export class HrgaDashboardPage implements OnInit {
  user: any;
  dashboardData: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  currentDate = new Date();
  isDarkMode$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private themeService: ThemeService,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({
      sunnyOutline, moonOutline, clipboardOutline, peopleOutline,
      fastFoodOutline, analyticsOutline, chevronForwardOutline, 
      personAddOutline, addCircleOutline, syncOutline, 
      documentTextOutline, checkmarkCircle, closeCircle,
      personCircleOutline, logOutOutline, locationOutline, 
      callOutline, businessOutline, settingsOutline,
      chevronDownOutline
    });
    this.isDarkMode$ = this.themeService.isDarkMode;
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
    this.loadDashboardData();
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    
    await alert.present();
  }

  loadDashboardData(event?: any) {
    if (!event) { this.isLoading = true; }
    this.errorMessage = null;
    this.http.get<any>(`${environment.apiUrl}/hrga/dashboard`).subscribe({
      next: data => {
        this.dashboardData = data.data;
        this.isLoading = false;
        if (event) { event.target.complete(); }
      },
      error: err => {
        this.errorMessage = 'Gagal memuat data dashboard. Silakan coba lagi.';
        this.isLoading = false;
        if (event) { event.target.complete(); }
      }
    });
  }

  handleRefresh(event: any) {
    this.loadDashboardData(event);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onImgError(event: any) {
    event.target.src = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }

  openProfileSettings() {
    console.log('Navigasi ke halaman pengaturan profil');
  }
}