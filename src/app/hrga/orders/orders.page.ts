import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    IonContent, IonHeader, IonTitle, IonToolbar, IonList,
    IonRefresher, IonRefresherContent, IonSpinner, IonButton, IonIcon,
    AlertController, ToastController, ModalController, IonBadge,
    IonButtons, IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Ikon 'search' ditambahkan, ikon 'calendar' dan fab 'add' tidak lagi utama
import { add, trash, create, search, sunnyOutline, moonOutline, documentTextOutline, createOutline, trashOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { OrderFormComponent } from 'src/app/hrga/order-form/order-form.component';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.page.html',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePipe, IonContent, IonHeader, IonTitle, IonToolbar,
        IonList, IonRefresher, IonRefresherContent, IonSpinner, IonButton,
        IonIcon, IonBadge, IonButtons, IonToggle
    ],
})
export class OrdersPage implements OnInit {
    orders: any[] = [];
    isLoading = true;
    errorMessage: string | null = null;
    apiUrl = `${environment.apiUrl}/hrga/pesanan`;
    
    // Properti untuk filter tanggal
    selectedDate: string = '';

    isDarkMode$: Observable<boolean>;

    constructor(
        private http: HttpClient,
        private alertController: AlertController,
        private toastController: ToastController,
        private modalController: ModalController,
        private themeService: ThemeService
    ) {
        addIcons({ add, trash, create, search, sunnyOutline, moonOutline, documentTextOutline, createOutline, trashOutline });
        this.isDarkMode$ = this.themeService.isDarkMode;
    }

    ngOnInit() {
        this.loadOrders();
    }

    // Modifikasi loadOrders untuk menerima filter tanggal
    loadOrders(event?: any) {
        if (!event) this.isLoading = true;
        this.errorMessage = null;

        let params = new HttpParams();
        if (this.selectedDate) {
            params = params.append('tanggal', this.selectedDate);
        }

        this.http.get<any>(this.apiUrl, { params }).subscribe({
            next: (response) => {
                this.orders = response.data.data ? response.data.data : response.data; // Sesuaikan dengan struktur API Anda
                this.isLoading = false;
                if (event) event.target.complete();
            },
            error: (err) => {
                this.errorMessage = 'Gagal memuat data pesanan.';
                this.isLoading = false;
                console.error(err);
                if (event) event.target.complete();
            },
        });
    }
    
    // Metode untuk menerapkan filter
    applyFilter() {
        this.loadOrders();
    }

    // Metode untuk mereset filter
    resetFilter() {
        this.selectedDate = '';
        this.loadOrders();
    }

    async openForm(order: any = null) {
        const modal = await this.modalController.create({
            component: OrderFormComponent,
            componentProps: { order }
        });
        modal.onWillDismiss().then((result) => {
            if (result.data && result.data.dismissed) {
                this.loadOrders();
            }
        });
        return await modal.present();
    }

    async confirmDelete(order: any) {
        const alert = await this.alertController.create({
            header: 'Konfirmasi Hapus',
            message: `Hapus pesanan untuk <strong>${order.menu.namaMenu}</strong> pada tanggal <strong>${new DatePipe('id-ID').transform(order.tanggalPesanan, 'd MMM y')}</strong>?`,
            buttons: [
                { text: 'Batal', role: 'cancel' },
                { text: 'Hapus', role: 'confirm', handler: () => this.deleteOrder(order.IdPesanan) },
            ],
        });
        await alert.present();
    }

    deleteOrder(id: number) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this.presentToast('Pesanan berhasil dihapus.', 'success');
                this.loadOrders();
            },
            error: (err) => {
                this.presentToast('Gagal menghapus pesanan.', 'danger');
                console.error(err);
            },
        });
    }

    handleRefresh(event: any) {
        this.resetFilter(); // Sebaiknya reset filter saat refresh
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    async presentToast(message: string, color: 'success' | 'danger') {
        const toast = await this.toastController.create({
            message,
            duration: 2500,
            color: color,
        });
        toast.present();
    }
}