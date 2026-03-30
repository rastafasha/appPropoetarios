import { HTTP_INTERCEPTORS } from '@angular/common/http';

// import { AuthInterceptor } from './auth-interceptor';
import {imageInterceptor} from './image-intereceptor';

export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: imageInterceptor, multi: true }
];
