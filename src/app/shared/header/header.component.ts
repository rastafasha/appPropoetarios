import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ComunicadoService } from '../../services/comunicado.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  user: any;
  

  notificacionesPendientes!:number;
   private router = inject(Router);
   public usuarioService = inject(UserService);
   public comunicadosService = inject(ComunicadoService);
  
  ngOnInit(){
   let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
      if(!this.user){
        this.router.navigateByUrl('/login')
      } 

      this.comunicadosService.obtenerContadorPendientes().subscribe(total => this.notificacionesPendientes = total);
  }

  
  logout() {
    this.usuarioService.logout();
  }

  
}

