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
import { ModalInstruccionesComponent } from "../../components/modal-instrucciones/modal-instrucciones.component";


@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    MenufooterComponent,
    RouterModule,
    CommonModule,
    NgClass,
    NgxPullToRefreshComponent,
    PwaNotifInstallerComponent,
    ModalInstruccionesComponent
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
   info = `
  <h2>¡Bienvenido!</h2>
  <p>Esta es tu <strong>Pantalla de Inicio</strong>, donde tendrás el control total de tu propiedad:</p>
  <ul>
    <li><strong>Notificaciones:</strong> El icono de la campana (superior derecha) te avisará con un indicador rojo sobre nuevos pagos procesados, avisos del condominio y alertas importantes.</li>
    <li><strong>Estatus Financiero:</strong> Un resumen rápido de tu situación administrativa actual.</li>
    <li><strong>Accesos Directos:</strong> Entra rápidamente a las secciones de <strong>'Mis Propiedades'</strong> y <strong>'Mis Pagos'</strong>.</li>
    <li><strong>Cartelera Digital:</strong> Mantente al día con los comunicados y avisos oficiales de la administración.</li>
  </ul>`;


  

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
    const USER = localStorage.getItem("user");
    try {
      this.user = USER ? JSON.parse(USER) : null;
    } catch (e) {
      console.warn('Invalid user data in localStorage:', e);
      this.user = null;
    }
    this.identityId = this.user?.uid ?? null;
    if (!this.identityId) {
      this.router.navigateByUrl('/my-account');
      return;
    }

    this.loadIdentity();
    this.obtenerMisComunicados();
    this.obetnerContadorPendiente();
    
  }
 

  obtenerMisComunicados() {
    this.comunicadosService.obtenerMisComunicados().subscribe({
      next: (res: any) => {
        // ERROR: this.comunicados = res; <--- Esto causa el error NG02200

        // CORRECTO: Extrae solo la lista
        this.listaComunicados = res.comunicados;
      }
    });
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

      if (this.identity === null) {
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
