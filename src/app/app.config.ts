import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

export const appConfig = {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule)
  ]
};
