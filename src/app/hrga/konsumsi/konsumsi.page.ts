import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonButton, 
  IonIcon, IonDatetime, IonModal, IonButtons,
  // 1. Tambahkan IonToggle
  IonToggle
} from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
// 2. Tambahkan ikon untuk tema
import { calendarOutline, sunnyOutline, moonOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

// 3. Import ThemeService dan Observable
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';

Chart.register(...registerables); 

@Component({
  selector: 'app-konsumsi',
  templateUrl: './konsumsi.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe, IonContent, IonHeader, IonTitle, 
    IonToolbar, IonSpinner, IonButton, IonIcon, IonDatetime,
    IonModal, IonButtons,
    // 4. Daftarkan IonToggle
    IonToggle
  ]
})
export class KonsumsiPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('monitoringChart') private chartCanvas!: ElementRef;
  @ViewChild(IonModal) modal!: IonModal;

  monitoringData: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  displayDate: string = new Date().toISOString();
  isLoading = true;
  errorMessage: string | null = null;
  chart: Chart | undefined;

  // 5. Tambahkan properti isDarkMode$
  isDarkMode$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    // 6. Suntikkan ThemeService
    private themeService: ThemeService
  ) {
    // 7. Daftarkan ikon tema
    addIcons({ 'calendar-outline': calendarOutline, sunnyOutline, moonOutline });
    // 8. Hubungkan properti dengan service
    this.isDarkMode$ = this.themeService.isDarkMode;
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.loadMonitoringData();
  }
  
  loadMonitoringData() {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.chart) {
        this.chart.destroy();
    }

    const params = new HttpParams().set('tanggal', this.selectedDate);
    const apiUrl = `${environment.apiUrl}/hrga/konsumsi/monitoring`;

    this.http.get<any>(apiUrl, { params }).subscribe({
      next: (response) => {
        this.monitoringData = response.data;
        this.displayDate = response.tanggal;
        this.isLoading = false;
        setTimeout(() => this.createOrUpdateChart(), 0);
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat data monitoring.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
  
  handleDateChange(event: any) {
    const dateValue = event.detail.value;
    this.selectedDate = new Date(dateValue).toISOString().split('T')[0];
  }

  confirmDate() {
    this.modal.dismiss();
    this.loadMonitoringData();
  }
  
  cancelDate() {
     this.modal.dismiss();
  }

  // 9. Tambahkan metode toggleTheme()
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  createOrUpdateChart() {
    if (!this.chartCanvas) {
      console.error("Canvas element not found! Make sure it is visible in the DOM.");
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }
    
    const labels = this.monitoringData.map(item => item.shift);
    const pesananData = this.monitoringData.map(item => item.pesanan);
    const konsumsiData = this.monitoringData.map(item => item.konsumsi);
    const sisaData = this.monitoringData.map(item => item.sisa);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Pesanan', data: pesananData, backgroundColor: '#3b82f6', borderRadius: 6 },
          { label: 'Konsumsi', data: konsumsiData, backgroundColor: '#10b981', borderRadius: 6 },
          { label: 'Sisa', data: sisaData, backgroundColor: '#f59e0b', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}