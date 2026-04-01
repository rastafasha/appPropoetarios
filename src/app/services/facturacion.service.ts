import { Injectable } from '@angular/core';
import { Facturacion } from '../models/facturacion';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { Payment } from '../models/payment';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  public facturacion!: Facturacion;


  constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  get headers() {
    return {
      'x-token': this.token
    };
  }



  generarYDescargarFactura(datos: any) {
    // 1. Llamamos al endpoint que acabas de configurar
    this.http.post(`${baseUrl}/facturacion/individual`, datos, {
      responseType: 'blob', // <--- CRÍTICO: Indica que recibes un archivo
      headers: this.headers
    }).subscribe({
      next: (res: Blob) => {
        // 2. Creamos una URL temporal para el archivo recibido
        const url = window.URL.createObjectURL(res);

        // 3. Opción A: Abrir en pestaña nueva
        window.open(url);

        // 4. Opción B: Descarga automática con nombre (opcional)
        /*
        const link = document.createElement('a');
        link.href = url;
        link.download = `Factura_${datos.mes}_${datos.anio}.pdf`;
        link.click();
        */

        // Limpiamos la memoria
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el PDF', err);
      }
    });
  }

  descargarPDF(factura: any) {
  // Solo enviamos el ID o el objeto que el backend espera para generar el PDF
  return this.http.post(`${baseUrl}/facturacion/individual`, factura, {
    responseType: 'blob',
    headers: this.headers // Asegúrate de que el token vaya aquí
  });
}
 

  getFacturaciones() {
    const url = `${baseUrl}/facturacion`;

    return this.http.get<any>(url, { headers: this.headers })
      .pipe(
        map((resp: { ok: boolean, facturas: Facturacion }) => resp.facturas)
      )
  }

  getFactura(_id: string) {
    const url = `${baseUrl}/facturacion/${_id}`;
    return this.http.get<any>(url, { headers: this.headers }); 
  }

  getByStatus(status: string) {
    const url = `${baseUrl}/facturacion/status/${status}`;
    return this.http.get<any>(url, { headers: this.headers })
      .pipe(
        map((resp: { ok: boolean, facturas: Facturacion }) => resp.facturas)
      )
  }

  getByStatusFaturas() {
    const url = `${baseUrl}/facturacion/status/pagos`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getFacturasByUser(userId: string, page: number = 1) {
  const url = `${baseUrl}/facturacion/user/${userId}?page=${page}`;
  
  // CAMBIO CLAVE: Usa <any> o el objeto de respuesta, NO <any[]>
  return this.http.get<any>(url, { headers: this.headers }); 
}


}
