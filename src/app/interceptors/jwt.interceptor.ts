import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Hanya tambahkan token jika request menuju API kita
    const isApiUrl = req.url.startsWith(environment.apiUrl);
    if (isApiUrl) {
      return this.authService.getToken().pipe(
        switchMap(token => {
          if (token) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          return next.handle(req);
        })
      );
    }
    // Jika bukan request ke API kita, lanjutkan tanpa modifikasi
    return next.handle(req);
  }
}