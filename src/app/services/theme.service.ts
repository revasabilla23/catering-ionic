    import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
    import { BehaviorSubject } from 'rxjs';

    @Injectable({
      providedIn: 'root'
    })
    export class ThemeService {
      // BehaviorSubject untuk menyimpan status tema saat ini (true = gelap, false = terang)
      // Komponen lain bisa 'subscribe' ke sini untuk tahu perubahan tema
      public isDarkMode = new BehaviorSubject<boolean>(false);
      
      // Renderer2 digunakan untuk memanipulasi DOM (menambah/menghapus class) dengan aman di Angular
      private renderer: Renderer2;

      constructor(rendererFactory: RendererFactory2) {
        // Buat instance renderer
        this.renderer = rendererFactory.createRenderer(null, null);
      }

      /**
       * Inisialisasi tema saat aplikasi pertama kali dimuat.
       * Mengecek preferensi dari localStorage atau dari pengaturan OS pengguna.
       */
      initTheme() {
        const storedPreference = localStorage.getItem('dark-theme');
        // Cek apakah pengguna sudah punya preferensi tersimpan
        if (storedPreference !== null) {
          const isDark = storedPreference === 'true';
          this.setTheme(isDark);
        } else {
          // Jika tidak ada, cek preferensi dari OS (prefers-color-scheme)
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          this.setTheme(prefersDark);
        }
      }

      /**
       * Fungsi utama untuk mengubah tema.
       * @param isDark - true untuk tema gelap, false untuk tema terang.
       */
      setTheme(isDark: boolean) {
        // Update status di BehaviorSubject
        this.isDarkMode.next(isDark);
        
        // Simpan preferensi pengguna ke localStorage agar tidak hilang saat refresh
        localStorage.setItem('dark-theme', String(isDark));
        
        // Tambahkan atau hapus class 'dark' dari elemen <body>
        // Inilah yang akan mengaktifkan semua class 'dark:' dari Tailwind
        if (isDark) {
          this.renderer.addClass(document.body, 'dark');
        } else {
          this.renderer.removeClass(document.body, 'dark');
        }
      }

      /**
       * Fungsi toggle untuk membalik tema saat ini.
       */
      toggleTheme() {
        const newThemeState = !this.isDarkMode.value;
        this.setTheme(newThemeState);
      }
    }
    