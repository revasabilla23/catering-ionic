import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
    IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, 
    IonButtons, IonIcon, ModalController, ToastController, IonSelect, 
    IonSelectOption, IonFooter
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-order-form',
    templateUrl: './order-form.component.html',
    standalone: true,
    // Impor disesuaikan, IonItem dan IonTextarea tidak lagi digunakan
    imports: [ 
        CommonModule, FormsModule, ReactiveFormsModule, IonContent, IonHeader, 
        IonTitle, IonToolbar, IonInput, IonButton, IonButtons, IonIcon, 
        IonSelect, IonSelectOption, IonFooter
    ]
})
export class OrderFormComponent implements OnInit {
    @Input() order: any;
    
    form: FormGroup;
    isEditMode = false;
    shifts: any[] = [];
    menus: any[] = [];
    apiUrl = `${environment.apiUrl}/hrga/pesanan`;

    constructor(
        private fb: FormBuilder,
        private modalCtrl: ModalController,
        private http: HttpClient,
        private toastController: ToastController
    ) {
        this.form = this.fb.group({
            tanggalPesanan: ['', Validators.required],
            IdShift: ['', Validators.required],
            IdMenu: ['', Validators.required],
            JumlahPesanan: ['', [Validators.required, Validators.min(1)]],
            statusPesanan: [0] // Default value untuk mode tambah
        });
        addIcons({ close });
    }

    ngOnInit() {
        this.isEditMode = !!this.order;
        this.loadInitialData();

        if (this.isEditMode && this.order) {
            this.form.patchValue({
                // Penanganan tanggal yang lebih robust, memastikan format YYYY-MM-DD
                tanggalPesanan: this.order.tanggalPesanan ? new Date(this.order.tanggalPesanan).toISOString().split('T')[0] : '',
                IdShift: this.order.IdShift,
                IdMenu: this.order.IdMenu,
                JumlahPesanan: this.order.JumlahPesanan,
                statusPesanan: this.order.statusPesanan ? 1 : 0
            });
        }
    }

    loadInitialData() {
        // Mengambil data shift dan menu dari API
        this.http.get<any>(`${environment.apiUrl}/hrga/shifts`).subscribe(res => this.shifts = res.data);
        this.http.get<any>(`${environment.apiUrl}/hrga/menus`).subscribe(res => this.menus = res.data);
    }

    cancel() { 
        return this.modalCtrl.dismiss(null, 'cancel'); 
    }

    confirm() {
        if (this.form.invalid) {
            this.presentToast('Harap isi semua kolom dengan benar.', 'danger');
            return;
        }

        const formData = this.form.value;
        let request: Observable<any>;

        if (this.isEditMode) {
            request = this.http.put(`${this.apiUrl}/${this.order.IdPesanan}`, formData);
        } else {
            // Hapus statusPesanan untuk form tambah agar default di backend
            delete formData.statusPesanan; 
            request = this.http.post(this.apiUrl, formData);
        }

        request.subscribe({
            next: () => {
                const message = this.isEditMode ? 'Pesanan berhasil diperbarui' : 'Pesanan berhasil ditambahkan';
                this.presentToast(message, 'success');
                this.modalCtrl.dismiss({ dismissed: true }, 'confirm');
            },
            error: (err: any) => { 
                console.error('Save/Update Error:', err);
                const errorMsg = err.error?.message || 'Terjadi kesalahan pada server. Silakan coba lagi.';
                this.presentToast(errorMsg, 'danger');
            }
        });
    }

    async presentToast(message: string, color: 'success' | 'danger') {
        const toast = await this.toastController.create({ 
            message, 
            duration: 3000, 
            color,
            position: 'top'
        });
        toast.present();
    }
}