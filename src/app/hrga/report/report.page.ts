import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonButton,
    IonIcon, ToastController, IonButtons, IonToggle, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, downloadOutline, sunnyOutline, moonOutline, documentTextOutline, searchOutline, warningOutline, fileTrayOutline, documentAttachOutline, gridOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-report',
    templateUrl: './report.page.html',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePipe, TitleCasePipe, IonContent, IonHeader, IonTitle,
        IonToolbar, IonSpinner, IonButton, IonIcon, IonButtons, IonToggle,
        IonSelect, IonSelectOption // Import yang baru
    ]
})
export class ReportPage implements OnInit {
    reportData: any[] = [];
    filter = 'daily';
    selectedDate: string = new Date().toISOString().split('T')[0];
    
    isLoading = false; // Set ke false, aktifkan hanya saat memuat
    errorMessage: string | null = null;
    apiUrl = `${environment.apiUrl}/hrga/konsumsi/report`;

    isDarkMode$: Observable<boolean>;

    constructor(
        private http: HttpClient,
        private toastController: ToastController,
        private authService: AuthService,
        private themeService: ThemeService
    ) {
        addIcons({ 
            calendarOutline, downloadOutline, sunnyOutline, moonOutline, documentTextOutline, 
            searchOutline, warningOutline, fileTrayOutline, documentAttachOutline, gridOutline 
        });
        this.isDarkMode$ = this.themeService.isDarkMode;
    }

    ngOnInit() {
        this.loadReport();
    }

    loadReport() {
        this.isLoading = true;
        this.errorMessage = null;

        let params = new HttpParams()
            .set('filter', this.filter)
            .set('tanggal', this.selectedDate);

        this.http.get<any>(this.apiUrl, { params }).subscribe({
            next: (response) => {
                this.reportData = response.data;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = 'Gagal memuat data laporan dari server.';
                this.isLoading = false;
                console.error(err);
            },
        });
    }
    
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    async downloadReport(row: any, format: string) {
        this.presentToast(`Mempersiapkan unduhan ${format.toUpperCase()}...`, 'primary');
        try {
            const token = await firstValueFrom(this.authService.getToken());
            if (!token) {
                this.presentToast('Otentikasi gagal. Silakan login ulang.', 'danger');
                return;
            }

            const url = `${environment.apiUrl}/hrga/konsumsi/download`;
            const params = new HttpParams()
                .set('tanggal', row.tanggal)
                .set('shift', row.shift)
                .set('format', format);

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const fileBlob = await firstValueFrom(
                this.http.get(url, { params, headers, responseType: 'blob' })
            );

            const blobUrl = window.URL.createObjectURL(fileBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `laporan_konsumsi_${row.tanggal}_shift_${row.shift}.${format === 'excel' ? 'xlsx' : format}`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            a.remove();

            this.presentToast(`Laporan berhasil diunduh (${format.toUpperCase()}).`, 'success');

        } catch (error) {
            console.error('Gagal mengunduh file:', error);
            this.presentToast('Terjadi kesalahan saat mengunduh laporan.', 'danger');
        }
    }

    async presentToast(message: string, color: 'primary' | 'success' | 'danger') {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color: color,
            position: 'top'
        });
        toast.present();
    }
}