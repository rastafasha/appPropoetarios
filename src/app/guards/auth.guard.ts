import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
          this.router.navigateByUrl('/login');
        }
      })
    );
  }



  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){

    return this.usuarioService.validarToken()
    .pipe(
      tap( estaAutenticado => {
        if(!estaAutenticado){
          this.router.navigateByUrl('/login');
        }
      })
    );
  }

}
