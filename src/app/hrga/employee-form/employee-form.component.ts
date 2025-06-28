import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
    IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, 
    IonButtons, IonIcon, ModalController, ToastController, IonSelect, 
    IonSelectOption, IonTextarea, IonFooter 
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Observable } from 'rxjs';
// Capacitor Camera API tetap sama
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
    selector: 'app-employee-form',
    templateUrl: './employee-form.component.html',
    // styleUrls tidak lagi dibutuhkan karena style ada di HTML
    standalone: true,
    imports: [ 
        CommonModule, 
        FormsModule, 
        ReactiveFormsModule, 
        IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, 
        IonButtons, IonIcon, IonSelect, IonSelectOption, IonTextarea, IonFooter 
    ]
})
export class EmployeeFormComponent implements OnInit {
    @Input() employee: any;
    @Input() shifts: any[] = [];
    
    form: FormGroup;
    isEditMode = false;
    imageBase64: string | null = null;
    apiUrl = `${environment.apiUrl}/hrga/karyawan`;

    constructor(
        private fb: FormBuilder,
        private modalCtrl: ModalController,
        private http: HttpClient,
        private toastController: ToastController
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            IdShift: ['', Validators.required],
            nik: ['', Validators.required],
            noTelepon: ['', Validators.required],
            address: ['', Validators.required],
            tanggalLahir: ['', Validators.required],
        });
        addIcons({ close });
    }

    ngOnInit() {
        this.isEditMode = !!this.employee;

        if (this.isEditMode && this.employee) {
            this.form.patchValue({
                name: this.employee.profile?.name,
                email: this.employee.email,
                IdShift: this.employee.IdShift,
                nik: this.employee.profile?.nik,
                noTelepon: this.employee.profile?.noTelepon,
                address: this.employee.profile?.address,
                // Pastikan format tanggal YYYY-MM-DD untuk input type="date"
                tanggalLahir: this.employee.profile?.tanggalLahir ? new Date(this.employee.profile.tanggalLahir).toISOString().split('T')[0] : ''
            });
            // Password tidak wajib diisi saat edit
            this.form.get('password')?.setValidators(null);
            this.form.get('password')?.updateValueAndValidity();
        } else {
            // Password wajib diisi saat membuat karyawan baru
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.form.get('password')?.updateValueAndValidity();
        }
    }

    // Fungsi untuk membuka pemilih file
    openFileSelector(fileInput: HTMLInputElement) {
        fileInput.click();
    }

    // Fungsi untuk menangani file yang dipilih dari input
    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.imageBase64 = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    // Fungsi untuk menutup modal
    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    // Fungsi untuk konfirmasi dan submit form
    confirm() {
        if (this.form.invalid) {
            this.presentToast('Harap isi semua kolom yang wajib diisi dengan benar.', 'danger');
            return;
        }
        if (!this.isEditMode && !this.imageBase64) {
            this.presentToast('Harap pilih foto profil untuk karyawan baru.', 'danger');
            return;
        }

        const formData = { ...this.form.value };
        if (this.imageBase64) {
            formData.foto = this.imageBase64;
        }
        
        let request: Observable<any>;
        if (this.isEditMode) {
            request = this.http.put(`${this.apiUrl}/${this.employee.IdUsers}`, formData);
        } else {
            request = this.http.post(this.apiUrl, formData);
        }

        request.subscribe({
            next: () => {
                const message = this.isEditMode ? 'Data karyawan berhasil diperbarui' : 'Karyawan baru berhasil ditambahkan';
                this.presentToast(message, 'success');
                this.modalCtrl.dismiss({ dismissed: true }, 'confirm');
            },
            error: (err: any) => { 
                console.error('Save/Update Error:', err);
                const errorMessage = err.error?.message || 'Terjadi kesalahan pada server. Silakan coba lagi.';
                this.presentToast(errorMessage, 'danger');
            }
        });
    }

    // Fungsi untuk menampilkan notifikasi toast
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