/* ============================================================================
  File: employee-list.page.ts (Disesuaikan untuk Tampilan Profesional)
  Deskripsi: Logika untuk halaman manajemen karyawan. Impor komponen telah
             disesuaikan untuk cocok dengan struktur HTML yang baru.
 ============================================================================
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonRefresher,
  IonRefresherContent, IonSpinner, IonButton, IonButtons, IonIcon,
  AlertController, ToastController, ModalController, IonFab, IonFabButton, IonBadge,
  IonToggle,
  // PENYESUAIAN: Tambahkan IonList dan IonItem ke daftar impor
  IonList,
  IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add, trash, create, mail, sync, eye, sunnyOutline, moonOutline,
  // PENYESUAIAN: Tambahkan ikon baru untuk UI yang lebih baik
  peopleOutline, createOutline, trashOutline, mailOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe, IonContent, IonHeader, IonTitle, IonToolbar,
    IonSearchbar, IonRefresher, IonRefresherContent, IonSpinner, IonButton,
    IonButtons, IonIcon, IonFab, IonFabButton, IonBadge, IonToggle,
    // PENYESUAIAN: Tambahkan IonList dan IonItem di sini juga
    IonList,
    IonItem
  ],
})
export class EmployeeListPage implements OnInit {
  employees: any[] = [];
  shifts: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  apiUrl = `${environment.apiUrl}/hrga/karyawan`;
  isDarkMode$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private themeService: ThemeService
  ) {
    // PENYESUAIAN: Menambahkan ikon baru yang digunakan di HTML
    addIcons({
      add, trash, create, mail, sync, eye, sunnyOutline, moonOutline,
      peopleOutline, createOutline, trashOutline, mailOutline
    });
    this.isDarkMode$ = this.themeService.isDarkMode;
  }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees(event?: any, search: string = '') {
    if (!event) this.isLoading = true;
    this.errorMessage = null;

    let params = new HttpParams();
    if (search) {
      params = params.append('search', search);
    }

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.employees = Array.isArray(response.data) ? response.data : [];
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat data karyawan.';
        this.employees = [];
        this.isLoading = false;
        console.error(err);
        if (event) event.target.complete();
      },
    });

    this.http.get<any>(`${environment.apiUrl}/hrga/shifts`).subscribe({
      next: (res) => {
        this.shifts = Array.isArray(res.data) ? res.data : [];
      },
      error: (err) => {
        console.warn('Gagal memuat shift:', err);
        this.shifts = [];
      },
    });
  }

  async openForm(employee: any = null) {
    const modal = await this.modalController.create({
      component: EmployeeFormComponent,
      componentProps: {
        employee: employee,
        shifts: this.shifts
      }
    });

    modal.onWillDismiss().then((result) => {
      if (result.data && result.data.dismissed) {
        this.loadEmployees();
      }
    });

    return await modal.present();
  }

  handleRefresh(event: any) { this.loadEmployees(event); }
  handleSearch(event: any) { this.loadEmployees(null, event.detail.value || ''); }

  async confirmDelete(employee: any) {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus <strong>${employee.profile.name}</strong>?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Hapus', role: 'confirm', handler: () => this.deleteEmployee(employee.IdUsers) },
      ],
    });
    await alert.present();
  }

  deleteEmployee(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
            this.presentToast('Karyawan berhasil dihapus.', 'success');
            this.loadEmployees();
        },
        error: (err) => {
            this.presentToast('Gagal menghapus karyawan.', 'danger');
            console.error(err);
        },
    });
  }

  async confirmSendEmail(employee: any) {
    const alert = await this.alertController.create({
        header: 'Kirim Email Aktivasi',
        message: `Kirim email ke <strong>${employee.profile.name}</strong> dan aktifkan statusnya?`,
        buttons: [
            { text: 'Batal', role: 'cancel' },
            { text: 'Ya, Kirim', role: 'confirm', handler: () => this.sendActivationEmail(employee.IdUsers) },
        ],
    });
    await alert.present();
  }

  sendActivationEmail(id: number) {
    this.http.post(`${this.apiUrl}/${id}/send-email`, {}).subscribe({
        next: () => {
            this.presentToast('Email aktivasi berhasil dikirim.', 'success');
            this.loadEmployees();
        },
        error: (err) => {
            this.presentToast('Gagal mengirim email aktivasi.', 'danger');
            console.error(err);
        },
    });
  }

  async confirmRotateShift() {
    const alert = await this.alertController.create({
      header: 'Putar Shift',
      message: 'Yakin ingin memutar shift semua karyawan sekarang?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Ya, Putar', role: 'confirm', handler: () => this.rotateShift() },
      ],
    });
    await alert.present();
  }

  rotateShift() {
    this.http.post(`${this.apiUrl}/rotate-shift`, {}).subscribe({
      next: () => {
        this.presentToast('Shift berhasil diputar.', 'success');
        this.loadEmployees();
      },
      error: (err) => {
        this.presentToast('Gagal memutar shift.', 'danger');
        console.error(err);
      },
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, duration: 2500, color });
    toast.present();
  }
}