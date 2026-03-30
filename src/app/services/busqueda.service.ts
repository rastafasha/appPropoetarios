import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { Local } from '../models/local';
import { Oficina } from '../models/oficina';
import { Residencia } from '../models/residencia';
import { Facturacion } from '../models/facturacion';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class BusquedasService {
  constructor(private http: HttpClient) {}

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token,
      },
    };
  }

  private trasnformarUsuarios(resultados: any[]): User[] {
    return resultados.map(
      (user) =>
        new User(
          user.username,
          user.email,
          false, // terminos
          user.numdoc || '',
          undefined, // password
          user.google || false,
          user.role,
          user.uid,
          user.createdAt ? new Date(user.createdAt) : undefined,
          user.updatedAt ? new Date(user.updatedAt) : undefined
        )
    );
  }

  
  private trasnformarLocales(resultados: any[]): Local[] {
    return resultados;
  }
  private trasnformarOficinas(resultados: any[]): Oficina[] {
    return resultados;
  }
  
  private trasnformarResidencias(resultados: any[]): Residencia[] {
    return resultados;
  }
  
  private trasnformarFacturaciones(resultados: any[]): Facturacion[] {
    return resultados;
  }
  

  buscar(tipo: 'usuarios' | 'oficinas' | 'locales'| 'residencias'|'facturaciones', termino: string) {
    const url = `${base_url}/todo/coleccion/${tipo}/${termino}`;
    return this.http.get<any[]>(url, this.headers).pipe(
      map((resp: any) => {
        switch (tipo) {
          case 'usuarios':
            return this.trasnformarUsuarios(resp.resultados);

          case 'locales':
            return this.trasnformarLocales(resp.resultados);
          case 'oficinas':
            return this.trasnformarOficinas(resp.resultados);
          case 'residencias':
            return this.trasnformarResidencias(resp.resultados);
          case 'facturaciones':
            return this.trasnformarFacturaciones(resp.resultados);

          default:
            return [];
        }
      })
    );
  }

  searchGlobal(termino: string) {
    const url = `${base_url}/todo/${termino}`;
    return this.http.get<any[]>(url, this.headers);
  }

 
    
}
