import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonIcon, LoadingController, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonContent, IonIcon]
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
        // Register icons
        addIcons({ eyeOutline, eyeOffOutline });

        // Initialize form
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit() {
        this.checkThemePreference();
    }

    private checkThemePreference() {
        // Check saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        this.isDarkMode = savedTheme 
            ? savedTheme === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
    }

    private applyTheme() {
        document.body.classList.toggle('dark', this.isDarkMode);
    }
    
    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    async login() {
        if (this.loginForm.invalid) {
            await this.showErrorToast('Harap isi email dan password dengan benar');
            return;
        }

        const loading = await this.showLoading();
        
        try {
            const { email, password } = this.loginForm.value;
            const user = await this.authService.login({ email, password })
                .pipe(first())
                .toPromise();

            loading.dismiss();
            
            if (user?.role) {
                this.authService.redirectUser(user.role);
            } else {
                this.router.navigate(['/dashboard']);
            }
        } catch (error) {
            loading.dismiss();
            this.handleLoginError(error);
        }
    }

    private async showLoading() {
        const loading = await this.loadingController.create({
            message: 'Memproses...',
            spinner: 'crescent'
        });
        await loading.present();
        return loading;
    }

    private async showErrorToast(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            position: 'bottom',
            color: 'danger',
            buttons: [{ text: 'OK', role: 'cancel' }]
        });
        await toast.present();
    }

    private handleLoginError(error: any) {
        const errorMessage = error.error?.message || 
                           'Login gagal. Periksa kembali email dan password Anda.';
        this.showErrorToast(errorMessage);
    }
}