import { Injectable } from '@angular/core';
import { Transferencia } from '../models/transferencia';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {

  trasnferencia!: Transferencia;

  
  constructor(
    private http: HttpClient
  ) { }

  get token():string{
    return localStorage.getItem('token') || '';
  }


  get headers(){
    return{
      headers: {
        'x-token': this.token
      }
    }
  }

  // registrar transferencia que hizo el usuario
  createTransfer(transfer:any){
    return this.http.post<any>(`${base_url}/transferencias/store`,transfer);
  }


  getTransferencias(){

    const url = `${base_url}/transferencias/`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, transferencias: Transferencia[]}) => resp.transferencias)
      )

  }


  getTransferenciaById(_id: string){
    const url = `${base_url}/transferencias/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, trasnferencia: Transferencia}) => resp.trasnferencia)
        );

  }
 getByStatus(status: string) {
     const url = `${base_url}/transferencias/status/${status}`;
     return this.http.get<any>(url, this.headers)
       .pipe(
         map((resp: { ok: boolean, trasnferencias: Transferencia[] }) => resp.trasnferencias)
       )
   }

  actualizarTransferencia(trasnferencia: Transferencia){
    const url = `${base_url}/transferencias/update/${trasnferencia._id}`;
    return this.http.put(url, trasnferencia, this.headers);
  }

  borrarTransferencia(_id:string){
    const url = `${base_url}/transferencias/remove/${_id}`;
    return this.http.delete(url, this.headers);
  }

  updateStatus(trasnferencia: any){
    const url = `${base_url}/transferencias/statusupdate/${trasnferencia._id}`;
    return this.http.put(url, trasnferencia, this.headers);
  }


}
