import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  currentUser = new BehaviorSubject<any>(null); 
  private _storage: Storage | null = null;

  constructor(private http: HttpClient, private storage: Storage, private router: Router) {
    this.initStorage();
  }

  async initStorage() {
    this._storage = await this.storage.create();
    this.checkToken();
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
      switchMap((res: any) => from(this._storage!.set(TOKEN_KEY, res.access_token)).pipe(
        switchMap(() => this.http.get<any>(`${environment.apiUrl}/auth/me`))
      )),
      tap(user => {
        this.currentUser.next(user);
        this.isAuthenticated.next(true);
      }),
      catchError(err => {
        this.isAuthenticated.next(false);
        this.currentUser.next(null);
        throw new Error('Login atau pengambilan data user gagal');
      })
    );
  }

  async logout() {
    await this._storage!.remove(TOKEN_KEY);
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async checkToken() {
    const token = await this._storage!.get(TOKEN_KEY);
    if (token) {
      this.http.get<any>(`${environment.apiUrl}/auth/me`).subscribe({
        next: (user) => {
          this.currentUser.next(user);
          this.isAuthenticated.next(true);
          if (user && user.role) this.redirectUser(user.role);
        },
        error: () => {
          this.isAuthenticated.next(false);
          this.logout();
        }
      });
    } else {
      this.isAuthenticated.next(false);
    }
  }

  redirectUser(role: string) {
    const userRole = role.toLowerCase();
    if (userRole === 'hrga') {
      // PERBAIKAN: Arahkan ke rute tab HRGA
      this.router.navigateByUrl('/hrga/dashboard', { replaceUrl: true });
    } else if (userRole === 'karyawan') {
      this.router.navigateByUrl('/karyawan-dashboard', { replaceUrl: true });
    } else {
      this.router.navigateByUrl('/home', { replaceUrl: true }); // Fallback
    }
  }

  getToken() {
    return from(this._storage!.get(TOKEN_KEY) as Promise<string>);
  }
}