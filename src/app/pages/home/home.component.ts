import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile';
import { CommonModule, NgClass } from '@angular/common';
import { ImagenPipe } from '../../pipes/imagen.pipe';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { ConectividadService } from '../../services/conectividad.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    MenufooterComponent,
    RouterModule,
    CommonModule,
    ImagenPipe,
    SkeletonLoaderComponent,
    NgClass
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  identity!: Profile;
  userId!: string;
  identityId!: any;
  user!: any;
  isLoading = false;
  isOnline = navigator.onLine;

  private profileService = inject(ProfileService);
  public connectivity = inject(ConectividadService);
  public usuarioService = inject(UserService);
  public toastr = inject(ToastrService);

  ngOnInit() {

    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.identityId = this.user.uid;
    this.loadIdentity();
  }

  loadIdentity() {
    this.isLoading = true;
    this.profileService.getByUser(this.identityId).subscribe((resp: any) => {
      this.identity = resp;
      // this.identityId = this.identity.uid;
      this.isLoading = false;
    })
  }

  iraPagar(monto: number) {

    // Aquí iría tu servicio de integración con la pasarela de pagos
    this.toastr.info(`Procesando pago de Bs. ${monto}...`, 'Transacción');

    // Simulación de éxito
    setTimeout(() => {
      this.toastr.success('¡Pago realizado con éxito!', 'Confirmación');
    }, 2000);
  }


  logout() {
    this.usuarioService.logout();
  }



}
