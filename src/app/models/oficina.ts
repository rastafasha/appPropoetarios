import { User } from "./user";

export class Oficina {
    public _id?: string;
    public edificio!: string;
    public letra!: string;
    public piso!: string;
    public montoMensual!: number;
    public usuario?: User;
}