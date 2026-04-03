import { User } from "./user";

export class Comunicado{
    titulo?:string;
    mensaje?:string;
    tipo?: 'EVENTO'| 'MANTENIMIENTO'| 'REUNION' | 'URGENTE' | 'CARTELERA';
    alcance_residencia?: 'TODOS'|'CATUCHE'| 'TAJAMAR'| 'TACAGUA'| 'SAN_MARTIN'| 
            'MOHEDANO'| 'CARUATA'| 'EL_TEJAR'| 'MEZANINA';
    alcance_torre?: 'AMBAS'| 'TORRE_ESTE'| 'TORRE_OESTE';
    creado_por?:User;
    notificado_push?:boolean;
    createdAt?: Date;


    constructor() {
        this.tipo = 'CARTELERA'; // Valor por defecto
        this.alcance_residencia = 'TODOS'; // Valor por defecto
        this.alcance_torre = 'AMBAS'; // Valor por defecto
    }

}

