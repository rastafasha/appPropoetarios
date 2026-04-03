import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

const BackendApi = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  private http = inject(HttpClient);
  public toastr = inject(ToastrService);
  public router = inject(Router);
  // Este observable le dirá a cualquier componente si el usuario está suscrito
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);




  checkUnreadNotifications() {
    // 1. Preparamos los headers con el token
    const headers = {
      headers: { 'x-token': localStorage.getItem('token') || '' }
    };

    // 2. Agregamos los headers a la petición GET
    this.http.get<{ ok: boolean, notificaciones: any[] }>(
      `${BackendApi}/notificaciones/unread-count`,
      headers // <--- IMPORTANTE: Incluirlos aquí
    )
      .subscribe(res => {
        if (res.ok && res.notificaciones && res.notificaciones.length > 0) {

          res.notificaciones.forEach(notif => {
            let toast;
            const config = { timeOut: 10000, closeButton: true, tapToDismiss: true };

            switch (notif.tipo) {
              case 'PAGO_RECHAZADO':
                toast = this.toastr.error(notif.mensaje, '❌ Pago Rechazado', config);
                break;
              case 'PAGO_APROBADO':
                toast = this.toastr.success(notif.mensaje, '✅ Pago Aprobado', config);
                break;
              case 'NUEVA_FACTURA':
                toast = this.toastr.info(notif.mensaje, '📄 Nueva Factura', config);
                break;
              case 'COMUNICADO_ADMIN':
                toast = this.toastr.warning(notif.mensaje, '📢 Aviso Edificio', config);
                break;
              case 'MENSAJE_DIRECTO':
                toast = this.toastr.info(notif.mensaje, '✉️ Mensaje Admin', config);
                break;
              default:
                toast = this.toastr.info(notif.mensaje, '🔔 Aviso Nuevo', config);
            }

            toast.onTap.subscribe(() => {
              this.marcarComoLeidas();
              const ruta = (notif.tipo === 'NUEVA_FACTURA') ? '/mis-facturas' : '/mis-pagos';
              this.router.navigate([ruta]);
            });
          });
        }
      });
  }


 marcarComoLeidas() {
  const headers = { 
    headers: { 'x-token': localStorage.getItem('token') || '' } 
  };
  // AÑADIMOS 'headers' como tercer parámetro
  return this.http.put(`${BackendApi}/notificaciones/marcar-leidas`, {}, headers);
}

  marcarUnaComoLeida(id: string) {
    const headers = { 'x-token': localStorage.getItem('token') || '' };
    // Asegúrate de que esta ruta exista en tu Backend (router.put('/:id', ...))
    return this.http.put(`${BackendApi}/notificaciones/${id}`, {}, { headers });
  }

  // services/notificacion.service.ts
  obtenerHistorialCompleto(desde: number = 0) {
    const headers = { headers: { 'x-token': localStorage.getItem('token') || '' } };
    return this.http.get<{ ok: boolean, notificaciones: any[], proximo: number | null }>(
      `${BackendApi}/notificaciones/historial?desde=${desde}`,
      headers
    );
  }


  obtenerContadorPendientes() {
    const headers = { 'x-token': localStorage.getItem('token') || '' };
    // Esta ruta debe coincidir con tu router.get('/unread-count', ...) del backend
    return this.http.get<{ ok: boolean, count: number }>(
      `${BackendApi}/notificaciones/unread-count`,
      { headers }
    );
  }
}
