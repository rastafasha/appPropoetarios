import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile';
import { CommonModule, NgClass } from '@angular/common';
import { ConectividadService } from '../../services/conectividad.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPullToRefreshComponent } from 'ngx-pull-to-refresh';
import { lastValueFrom } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';
import { PwaNotifInstallerComponent } from "../../shared/pwa-notif-installer/pwa-notif-installer.component";
import { ComunicadoService } from '../../services/comunicado.service';
import { Comunicado } from '../../models/comunicado';
import { NotificacionService } from '../../services/notificacion.service';


@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    MenufooterComponent,
    RouterModule,
    CommonModule,
    NgClass,
    NgxPullToRefreshComponent,
    PwaNotifInstallerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  identity!: Profile;
  userId!: string;
  identityId!: any;
  user!: any;
  isLoading = false;
  isOnline = navigator.onLine;
  swPush: boolean = false;
  listaComunicados!: Comunicado[]
  totalPendientes: any;

  private profileService = inject(ProfileService);
  public connectivity = inject(ConectividadService);
  public usuarioService = inject(UserService);
  public toastr = inject(ToastrService);
  public router = inject(Router);
  public pushService = inject(PushNotificationService);
  public notificacionService = inject(NotificacionService);
  public comunicadosService = inject(ComunicadoService);

  estaSuscrito$ = this.pushService.isSubscribed$;

  ngOnInit() {
    window.scrollTo(0, 0);
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.identityId = this.user.uid;

    this.loadIdentity();
    this.obtenerMisComunicados();
    this.obetnerContadorPendiente();
  }

  obtenerMisComunicados() {
    this.comunicadosService.obtenerMisComunicados().subscribe(
      comunicados => this.listaComunicados = comunicados
    );
  }
  
  obetnerContadorPendiente() {
    this.notificacionService.obtenerContadorPendientes().subscribe({
      next: (res) => {
        this.totalPendientes = res.count; // Aquí guardas el número para el badge
      },
      error: (err) => console.error('Error al obtener conteo', err)
    });
  }
  btnActivarPush() {
    this.pushService.subscribeToNotifications();
  }

  // Función que dispara el refresco
  async myRefreshEvent(event: any) {
    // Solo intentamos vibrar si es un móvil (evita el error en Chrome Desktop)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) { /* Silencio */ }
    }

    // Lógica de carga
    try {
      await this.loadIdentity();
    } finally {
      // Si event.complete() no funciona, forzamos con un pequeño retraso
      setTimeout(() => {
        if (event && typeof event.complete === 'function') {
          event.complete();
        }
      }, 100);
    }
  }



  async loadIdentity() {
    this.isLoading = true;
    try {
      // Usamos lastValueFrom para esperar la respuesta de la API
      const resp: any = await lastValueFrom(this.profileService.getByUser(this.identityId));

      this.identity = resp;

      if (this.identity.telhome === null) {
        this.router.navigateByUrl('/my-account');
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      this.isLoading = false; // Se apaga el skeleton (si lo vuelves a poner)
    }
  }


  iraPagar(monto: number) {
    if (monto > 0) {
      this.router.navigate(['/mis-facturas'], {
        queryParams: { estado: 'PENDIENTE' }
      });
    }
  }


  logout() {
    this.usuarioService.logout();
  }

  verpropiedades() {
    this.router.navigateByUrl('/my-account')
  }



}
