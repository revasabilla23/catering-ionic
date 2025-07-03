import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, 
  IonSpinner, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonButtons, IonIcon, IonToggle,
  IonAvatar, IonPopover, IonList, IonItem, IonLabel, IonBadge
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap, tap, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import qrcode from 'qrcode-generator';
import { addIcons } from 'ionicons';
import { 
  sunnyOutline, 
  moonOutline, 
  logOutOutline,
  personCircleOutline,
  locationOutline,
  callOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-karyawan-dashboard',
  templateUrl: './karyawan-dashboard.page.html',
  styleUrls: ['./karyawan-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButton, IonSpinner, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButtons, IonIcon, IonToggle,
    IonAvatar, IonPopover, IonList, IonItem, IonLabel, IonBadge
  ]
})
export class KaryawanDashboardPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('qrcode', { static: false }) qrCodeElement!: ElementRef;
  
  user: any;
  qrData: { token: string; expired: string } | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  isDarkMode$ = new BehaviorSubject<boolean>(false);

  private qrSubscription!: Subscription;
  private darkModeObserver!: MutationObserver;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    addIcons({ 
      sunnyOutline, 
      moonOutline, 
      logOutOutline,
      personCircleOutline,
      locationOutline,
      callOutline
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
    this.checkDarkMode();
    this.setupDarkModeListener();
  }

  ngAfterViewInit() {
    this.startQrPolling();
  }

  checkDarkMode() {
    this.isDarkMode$.next(document.body.classList.contains('dark'));
  }

  setupDarkModeListener() {
    this.darkModeObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        const targetElement = mutation.target as HTMLElement;

        if (mutation.attributeName === 'class' && targetElement.tagName === 'BODY') {
          this.checkDarkMode();
          if (this.qrData) {
            this.generateQrCode(this.qrData.token);
          }
        }
      });
    });
    this.darkModeObserver.observe(document.body, { attributes: true });
  }

  toggleTheme() {
    document.body.classList.toggle('dark');
    this.checkDarkMode();
  }

  startQrPolling() {
    this.qrSubscription = interval(15000).pipe(
      startWith(0),
      switchMap(() => this.http.get<{ token: string; expired: string }>(`${environment.apiUrl}/karyawan/qr`)),
      tap(() => {
        this.isLoading = false;
        this.errorMessage = null;
      })
    ).subscribe({
      next: data => {
        this.qrData = data;
        this.generateQrCode(data.token);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = "Gagal memuat QR token. Coba lagi nanti.";
        console.error(err);
      }
    });
  }

  generateQrCode(token: string) {
    if (!this.qrCodeElement) return;

    this.qrCodeElement.nativeElement.innerHTML = '';

    const typeNumber = 4;
    const errorCorrectionLevel = 'L';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(token);
    qr.make();
    
    const svgString = qr.createSvgTag({ margin: 0 });
    this.qrCodeElement.nativeElement.innerHTML = svgString;

    const svgElement = this.qrCodeElement.nativeElement.querySelector('svg');
    if (svgElement) {
      svgElement.style.width = '100%';
      svgElement.style.height = '100%';

      const isDarkMode = this.isDarkMode$.getValue();
      const colorForQrSquares = isDarkMode ? "#ffffff" : "#000000";
      const colorForQrBackground = isDarkMode ? "#1a202c" : "#ffffff";

      const paths = svgElement.querySelectorAll('path');
      paths.forEach((path: SVGPathElement) => {
        path.setAttribute('fill', colorForQrSquares);
      });

      const rects = svgElement.querySelectorAll('rect');
      rects.forEach((rect: SVGRectElement) => {
        rect.setAttribute('fill', colorForQrBackground);
      });

      svgElement.style.backgroundColor = colorForQrBackground;
    }
  }

  onImgError(event: any) {
    event.target.src = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }

  async logout() {
    try {
      await this.authService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  ngOnDestroy() {
    if (this.qrSubscription) {
      this.qrSubscription.unsubscribe();
    }
    if (this.darkModeObserver) {
      this.darkModeObserver.disconnect();
    }
    this.isDarkMode$.complete();
  }
}