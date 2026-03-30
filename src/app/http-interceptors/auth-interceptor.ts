import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _router: Router) {
  }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      let headers = new HttpHeaders();
      let params = req.params;
      if (localStorage.getItem('token')) {
        headers = headers.append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + localStorage.getItem('token'));
      } else {
        headers = headers.append('Accept', 'application/json');
        // params = params.append('page', '1');
      }

      return next.handle(req.clone({headers, params})).pipe(catchError(error => {
        if (error.status === 401 || error.status === 423) {
          this._router.navigate(['/login']);
        }

        return throwError(error);
      }));
    }

    errors(error: HttpErrorResponse) {
      if (error.status === 4030 || error.status === 4040 || error.status === 4230) {
        this._router.navigate(['/login']);
      }
      return throwError(error);
    }
}

