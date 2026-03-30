
import { User } from "./user";
import { Local } from "./local";
import { Oficina } from "./oficina";
import { Residencia } from "./residencia";
import { environment } from "../../environments/environment";

const base_url = environment.mediaUrlRemoto;
export class Profile {
  constructor(

    public first_name: string,
    public last_name: string,
    public direccion: string,
    public telhome: string,
    public telmovil: string,
    public haveResidencia: boolean,
    public haveOficina: boolean,
    public haveLocal: boolean,
    public residencia: Residencia,
    public oficina: Oficina,
    public local: Local,
    public deudaTotalAcumulada: number,
    public statusFinanciero: 'AL_DIA'| 'MOROSO'| 'EN_REVISION',
    public createdAt: Date,
    public updatedAt: Date,
    public usuario?: User,
    public img?: string,
    public _id?: string

){
  this.statusFinanciero ='AL_DIA';
}


  get imagenUrl(){
    if(!this.img){
      return `${base_url}/profiles/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/profiles/${this.img}`;
    }else {
      return `${base_url}/no-image.jpg`;
      // return `./assets/img/no-image.jpg`;
    }
  }
}
