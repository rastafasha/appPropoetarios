import { User } from "./user"

export interface DetalleFactura {
    origen: 'RESIDENCIA' | 'LOCAL' | 'OFICINA' | 'EXTRA';
    propiedadId: string;
    montoBase: number;
    descripcion: string;
    ivaPorcentaje: number;
    montoIva: number;
}

export class Facturacion {
    _id?: string;
    usuario?: User;
    nroFactura?: string;
    mes?: number;
    anio?: number;
    tasaBCV?: number; // <--- VITAL guardar la tasa del día del lote

    detalles: DetalleFactura[];

    // --- Campos de Impuestos ---
    porcentajeIva: number;
    aplicaRetencion: boolean;
    montoRetencion: number;
    otrosCargos: number;

    // --- Calculado (Virtual en el Backend) ---
    totalPagar?: number; // Lo marcamos opcional porque viene del backend

    estado: 'PENDIENTE' | 'PAGADO' | 'ANULADO';
    createdAt?: Date;
    updatedAt?: Date;

    constructor() {
        this.estado = 'PENDIENTE';
        this.detalles = [];
        this.aplicaRetencion = false;
        this.porcentajeIva = 16;
        this.otrosCargos = 0;
        this.montoRetencion = 0;
    }
}  