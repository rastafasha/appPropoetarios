import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Residencia } from '../models/residencia';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ResidenciaService {

  public residencia!: Residencia;
  
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
  
    getResidencias() {
      const url = `${baseUrl}/residencias`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp: { ok: boolean, residencias: Residencia }) => resp.residencias)
        )
    }
  
    getResidencia(_id: Residencia) {
      const url = `${baseUrl}/residencias/${_id}`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp: { ok: boolean, residencia: Residencia }) => resp.residencia)
        );
    }
  
    createResidencia(residencia: Residencia) {
      const url = `${baseUrl}/residencias/crear`;
      return this.http.post(url, residencia, this.headers);
    }
  
  
    updateResidencia(id: string, data: any) {
      const url = `${baseUrl}/residencias/editar/${id}`;
      return this.http.put(url, data, this.headers);
    }
  
    deleteResidencia(_id: string) {
      const url = `${baseUrl}/residencias/borrar/${_id}`;
      return this.http.delete(url, this.headers);
    }
}
