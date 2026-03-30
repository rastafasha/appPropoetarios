import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private usuarioService: UserService,
    private router: Router
  ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean  {

      if(this.usuarioService.role === 'ADMIN_ROLE' ) {
        return true;
      }if(this.usuarioService.role === 'SUPERADMIN_ROLE' ) {
        return true;
      }else {
        this.router.navigateByUrl('/dashboard');
        return false;
      }
  }

}
