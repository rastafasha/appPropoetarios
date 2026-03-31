import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { HttpEvent, HttpHandlerFn, HttpRequest, provideHttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideNgxMask } from 'ngx-mask'; //validador de telefono

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(),
  provideAnimations(),
  provideNgxMask(),
    provideToastr({
      positionClass: 'toast-top-center', // customize global options
      timeOut: 3000,
      // ... more options
    }),
  provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),
    registrationStrategy: 'registerWhenStable:30000'
  })],
  
};

function imageInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  // Check if the request is for an image
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || req.url.endsWith('.jpeg')) {
   
    const jwtToken = window.localStorage.getItem('auth_token');
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`
      }
    });
    return next(modifiedReq);
    
  }
  // Pass through other requests unmodified
  return next(req);
}