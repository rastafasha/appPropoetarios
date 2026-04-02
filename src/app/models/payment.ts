
import { environment } from '../../environments/environment';
import { Facturacion } from './facturacion';
import { User } from './user'; // Si tienes el modelo de usuario
const base_url = environment.mediaUrlRemoto;

export class Payment {
    _id?: string;
    cliente?: User;
    amount!: number;
    tasaBCV!: number;
    factura!: Facturacion;
    referencia!: string;
    bank_destino!: string;
    img!: string;
    usuario_validador!: User;
    observaciones!: string;
    
    metodo_pago?: 'TRANSFERENCIA'| 'PAGO_MOVIL'| 'EFECTIVO'| 'ZELLE';
    status?: 'PENDIENTE'| 'APROBADO'| 'RECHAZADO';
    fecha_pago?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    constructor() {
        this.status = 'PENDIENTE'; // Valor por defecto
    }

     get imagenUrl(){
    if(!this.img){
      return `${base_url}/payments/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/payments/${this.img}`;
    }else {
      return `${base_url}/no-image.jpg`;
      // return `./assets/img/no-image.jpg`;
    }
  }
}