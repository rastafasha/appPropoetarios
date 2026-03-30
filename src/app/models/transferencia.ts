import { environment } from "../../environments/environment";

const base_url = environment.mediaUrlRemoto;
export class Transferencia{
  constructor(

        public user: string,
        public bankName: string,
        public metodo_pago: string,
        public amount: number,
        public tasaBCV: number,
        public referencia: string,
        public factura: string,
        public paymentday: Date,
        public status: 'PENDING'| 'APPROVED'| 'REJECTED',
        public createdAt: Date,
        public updatedAt: Date,
        public _id?: string,
        public img?: string
      
  ){
    this.status = 'PENDING'; // Valor por defecto
  }


  get imagenUrl(){
    if(!this.img){
      return `${base_url}/trasferencias/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/trasferencias/${this.img}`;
    }else {
      return `${base_url}/no-image.jpg`;
      // return `./assets/img/no-image.jpg`;
    }
  }

   

}
