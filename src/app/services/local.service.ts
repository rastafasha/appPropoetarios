import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';

import { Local } from '../models/local';
const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  public local!: Local;

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

  getLocals() {
    const url = `${baseUrl}/locales`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, locales: Local }) => resp.locales)
      )
  }

  getLocal(_id: Local) {
    const url = `${baseUrl}/locales/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, local: Local }) => resp.local)
      );
  }

  createLocal(local: Local) {
    const url = `${baseUrl}/locales/crear`;
    return this.http.post(url, local, this.headers);
  }


  updateLocal(id: string, data: any) {
    const url = `${baseUrl}/locales/editar/${id}`;
    return this.http.put(url, data, this.headers);
  }

  deleteLocal(_id: string) {
    const url = `${baseUrl}/locales/borrar/${_id}`;
    return this.http.delete(url, this.headers);
  }
}
