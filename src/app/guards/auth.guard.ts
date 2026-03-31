import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private usuarioService: UserService,
    private router: Router){}

  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    return this.usuarioService.validarToken()
    .pipe(
      tap( estaAutenticado => {
        if(!estaAutenticado){
          // Fallback to localStorage
          const localAuth = localStorage.getItem('estaAutenticado') === 'true';
          if (!localAuth) {
            this.router.navigateByUrl('/login');
          }
        }
      }),
      catchError(() => {
        const localAuth = localStorage.getItem('estaAutenticado') === 'true';
        if (localAuth) {
          return of(true);
        }
        this.router.navigateByUrl('/login');
        return of(false);
      })
    );
  }



 canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> {

  return this.usuarioService.validarToken().pipe(
    map((autenticado: boolean) => { // Cambiamos el nombre aquí para evitar confusiones
      
      // 1. Si el servicio confirma que el token es válido
      if (autenticado) {
        return true;
      }

      // 2. Si falló el token, chequeamos el localStorage
      const localAuth = localStorage.getItem('estaAutenticado') === 'true';
      
      if (localAuth) {
        return true;
      } else {
        // 3. Si nada es true, mandamos al login
        return this.router.createUrlTree(['/login']);
      }
    }),
    catchError(() => {
      // En caso de error de red, intentamos el plan B con localStorage
      const localAuth = localStorage.getItem('estaAutenticado') === 'true';
      return of(localAuth ? true : this.router.createUrlTree(['/login']));
    })
  );
}

}
