import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, LoadingController, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    // styleUrls tidak diperlukan jika style ada di HTML
    standalone: true,
    imports: [ CommonModule, FormsModule, ReactiveFormsModule, IonContent ]
})
export class LoginPage implements OnInit {
    loginForm: FormGroup;
    isDarkMode: boolean = false;
    currentYear: number = new Date().getFullYear();
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    ngOnInit() {
        // Cek tema saat komponen diinisialisasi
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            this.isDarkMode = storedTheme === 'dark';
        } else {
            // Jika tidak ada tema tersimpan, gunakan preferensi sistem
            this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
    }

    private applyTheme() {
        // Menambahkan atau menghapus kelas 'dark' dari elemen body
        document.body.classList.toggle('dark', this.isDarkMode);
    }
    
    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    async login() {
        if (this.loginForm.invalid) {
            this.presentToast('Harap isi email dan password dengan benar.', 'danger');
            return;
        }

        const loading = await this.loadingController.create({ message: 'Mohon tunggu...' });
        await loading.present();

        const { email, password } = this.loginForm.value;
        
        this.authService.login({ email, password }).pipe(first()).subscribe({
            next: (user) => {
                loading.dismiss();
                if (user && user.role) {
                    this.authService.redirectUser(user.role); 
                } else {
                    // Fallback jika tidak ada role, mungkin ke halaman dashboard umum
                    this.router.navigate(['/dashboard']); 
                }
            },
            error: (err) => {
                loading.dismiss();
                // Memberikan pesan error yang lebih spesifik jika memungkinkan
                const errorMessage = err.error?.message || 'Login Gagal! Periksa kembali email dan password Anda.';
                this.presentToast(errorMessage, 'danger');
            }
        });
    }

    async presentToast(message: string, color: 'primary' | 'success' | 'danger' | 'warning') {
        const toast = await this.toastController.create({
            message: message,
            duration: 3000,
            position: 'bottom',
            color: color
        });
        toast.present();
    }
}