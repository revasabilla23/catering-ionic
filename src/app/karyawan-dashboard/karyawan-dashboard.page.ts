import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import qrcode from 'qrcode-generator'; // Import library QR

@Component({
  selector: 'app-karyawan-dashboard',
  templateUrl: './karyawan-dashboard.page.html',
  styleUrls: ['./karyawan-dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class KaryawanDashboardPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('qrcode', { static: false }) qrCodeElement!: ElementRef;
  
  user: any;
  qrData: { token: string; expired: string } | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  isDarkMode = false;

  private qrSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => this.user = user);
    this.isDarkMode = document.body.classList.contains('dark');
  }

  ngAfterViewInit() {
    this.startQrPolling();
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
    
    // PERBAIKAN: Menggunakan opsi yang valid untuk `createSvgTag`.
    // Opsi untuk warna tidak didukung secara langsung dengan cara ini,
    // jadi kita akan membuat QR code dengan warna default (hitam/putih) yang berfungsi di semua tema.
    this.qrCodeElement.nativeElement.innerHTML = qr.createSvgTag({ margin: 0 });
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.qrSubscription) {
      this.qrSubscription.unsubscribe();
    }
  }
}