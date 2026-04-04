import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Comunicado } from '../models/comunicado';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ComunicadoService {

  comunicado!: Comunicado

  constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    };
  }

  // 1. Obtener Comunicados (Cartelera segmentada)
  obtenerMisComunicados(pagina: number = 1) {
    const url = `${base_url}/comunicados/mis-comunicados?page=${pagina}`;
    // Definimos la interfaz de la respuesta aquí:
    // return this.http.get<{ ok: boolean, comunicados: Comunicado[], proximo: number | null }>(url, this.headers);
    return this.http.get<any>(url,  this.headers); 
  }

  

  // 2. Obtener el número de notificaciones no leídas (Badge de la campana)
  obtenerContadorPendientes() {
    const url = `${base_url}/comunicados/contar-pendientes`;
    return this.http.get<{ ok: boolean, total: number }>(url, this.headers)
      .pipe(
        map(resp => resp.total)
      );
  }

  // 3. Marcar todas como leídas (Limpiar campana)
  marcarTodasComoLeidas() {
    const url = `${base_url}/comunicados/marcar-leidas-todas`;
    return this.http.put(url, {}, this.headers);
  }

  
}
