import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Oficina } from '../models/oficina';
const baseUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class OficinaService {

  public oficina!: Oficina;

  constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  getOficinas() {
    const url = `${baseUrl}/oficinas`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, oficinas: Oficina }) => resp.oficinas)
      )
  }

  getOficina(_id: Oficina) {
    const url = `${baseUrl}/oficinas/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, oficina: Oficina }) => resp.oficina)
      );
  }

  createOficina(local: Oficina) {
    const url = `${baseUrl}/oficinas/crear`;
    return this.http.post(url, local, this.headers);
  }


  updateOficina(id: string, data: any) {
    const url = `${baseUrl}/oficinas/editar/${id}`;
    return this.http.put(url, data, this.headers);
  }

  deleteOficina(_id: string) {
    const url = `${baseUrl}/oficinas/borrar/${_id}`;
    return this.http.delete(url, this.headers);
  }
}
