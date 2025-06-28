import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AutoLoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      filter(val => val !== null), // Tunggu sampai status auth diketahui
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // JIKA SUDAH LOGIN:
          // Panggil fungsi redirect utama dari service
          this.authService.currentUser.pipe(take(1)).subscribe(user => {
            if (user) {
              this.authService.redirectUser(user.role);
            }
          });
          // Jangan izinkan akses ke halaman login
          return false;
        }
        // Jika belum login, izinkan akses ke halaman login
        return true;
      })
    );
  }
}