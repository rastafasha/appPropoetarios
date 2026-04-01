import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { Local } from '../models/local';
import { Oficina } from '../models/oficina';
import { Residencia } from '../models/residencia';
import { Facturacion } from '../models/facturacion';
import { of } from 'rxjs';

import { Payment } from '../models/payment'; // Asegúrate de tener estos modelos creados
import { Transferencia } from '../models/transferencia';



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
  // Aquí podrías agregar lógica de fechas si tu modelo Facturacion la requiere
  return resultados; 
}
  private trasnformarPayments(resultados: any[]): Payment[] {
  // Aquí podrías agregar lógica de fechas si tu modelo Facturacion la requiere
  return resultados; 
}
  private trasnformarTransferencias(resultados: any[]): Transferencia[] {
  // Aquí podrías agregar lógica de fechas si tu modelo Facturacion la requiere
  return resultados; 
}
  

 buscar(
    tipo: 'usuarios' | 'oficinas' | 'locales' | 'residencias' | 'facturaciones' | 'payments' | 'transferencias', 
    termino: string = ''
  ) {
    // Si el término está vacío, podrías retornar un array vacío o manejarlo según tu UX
   if (!termino || termino.trim().length === 0) { 
        return of([]); 
    }

    const url = `${base_url}/todo/coleccion/${tipo}/${termino}`;
    
    return this.http.get<any>(url, this.headers).pipe(
      map((resp: any) => {
        switch (tipo) {
          case 'usuarios':
            return this.trasnformarUsuarios(resp.resultados);
          case 'locales':
            return this.trasnformarLocales(resp.resultados); // Puedes simplificar si no necesitas lógica extra
          case 'oficinas':
            return this.trasnformarOficinas(resp.resultados); 
          case 'residencias':
            return this.trasnformarResidencias(resp.resultados); 
          case 'facturaciones':
            return this.trasnformarFacturaciones(resp.resultados);
          case 'payments':
            return this.trasnformarPayments(resp.resultados);
          case 'transferencias':
            return this.trasnformarTransferencias(resp.resultados);
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
