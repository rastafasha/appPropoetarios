import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { ToastrService } from 'ngx-toastr';
import { FacturacionService } from '../../services/facturacion.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusquedasService } from '../../services/busqueda.service';
import { PushNotificationService } from '../../services/push-notification.service';
declare var bootstrap: any;
@Component({
  selector: 'app-mis-facturas',
  imports: [CommonModule, HeaderComponent, MenufooterComponent,
    FormsModule, InfiniteScrollModule],
  templateUrl: './mis-facturas.component.html',
  styleUrl: './mis-facturas.component.scss'
})
export class MisFacturasComponent {

  facturas = signal<any[]>([]);
  loading = signal(false);
  hasMore = signal<boolean>(true);
  page = 1;
  userId!: string;
  facturaSeleccionada = signal<any>(null);
  toastVisible = signal(false);
  showToastFactura = signal(false);
isFilteringFactura = signal(false);

  // Variables para Facturas
  queryFactura: string = '';
  statusFactura: string = '';
  pageFactura: number = 1;
  hasMoreFacturas = signal(true);

  public toastr = inject(ToastrService);
  public facturaService = inject(FacturacionService);
  private router = inject(Router);
  private busquedasService = inject(BusquedasService);
  private route = inject(ActivatedRoute);
  private pollService = inject(PushNotificationService);

  ngOnInit() {
    window.scrollTo(0, 0);
    // 1. Marcamos como leídas en la DB
  this.pollService.marcarComoLeidas();
  
  // 2. Limpiamos cualquier Toastr que haya quedado abierto en pantalla
  this.toastr.clear(); 
  
    const USER = localStorage.getItem("user");
    this.userId = JSON.parse(USER || '{}').uid;

    // LEER PARÁMETROS DE LA URL
    this.route.queryParams.subscribe(params => {
      if (params['estado']) {
        // Asignamos 'POR PAGAR' o 'PENDIENTE' según envíes desde el Home
        this.statusFactura = params['estado']; 
        this.isFilteringFactura.set(true);
      }
      
      // Ahora ejecutamos la carga (que ya usa this.statusFactura)
      this.getFacturas();
    });

  }

  getMesNombre(mes: number): string {
    const nombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombres[mes - 1] || 'Mes';
  }

  onScroll(): void {
    if (this.loading()) return;

    // Si estás viendo facturas y no hay búsqueda por texto activa:
    if (this.queryFactura.trim() === '' && this.hasMoreFacturas()) {
      this.pageFactura++;
      this.getFacturas();
    }
  }

  getFacturas() {
  if (!this.hasMoreFacturas()) return;
  this.loading.set(true);

  this.facturaService.getFacturasByUser(this.userId, this.pageFactura).subscribe({
    next: (resp: any) => {
      
      // 1. EXTRAEMOS EL ARREGLO (Según tu JSON es resp.facturas)
      const newData = resp.facturas || [];

      if (newData.length === 0) {
        this.hasMoreFacturas.set(false);
        this.loading.set(false);
        return;
      }

      // 2. FILTRADO LOCAL (Ojo: Tu JSON usa "estado", no "status")
      let filteredData = newData;
      if (this.statusFactura) {
        filteredData = newData.filter((f: any) => f.estado === this.statusFactura);
      }

      // 3. ACTUALIZACIÓN DE LA SEÑAL
      this.facturas.update(current => {
        const ids = new Set(current.map(f => f._id));
        const unique = filteredData.filter((f: any) => !ids.has(f._id));
        return [...current, ...unique];
      });

      // 4. LÓGICA INSISTENTE
      // Si el filtro dejó pocos resultados pero hay más páginas en el API
      if (this.statusFactura && filteredData.length < 5 && resp.pages > this.pageFactura) {
        this.pageFactura++;
        this.getFacturas();
      } else {
        this.loading.set(false);
      }
    },
    error: () => this.loading.set(false)
  });
}



  searchFacturas(): void {
    this.pageFactura = 1;
    this.hasMoreFacturas.set(true);
    this.facturas.set([]); // Limpiar lista actual

    // Si hay búsqueda por texto, usamos el buscador global
    if (this.queryFactura.trim() !== '') {
      this.busquedasService.buscar('facturaciones', this.queryFactura).subscribe((res: any[]) => {
        let filtered = res;
        if (this.statusFactura) {
          filtered = res.filter(f => f.status === this.statusFactura);
        }
        this.facturas.set(filtered);
      });
    } else {
      // Si no hay texto, usamos la carga paginada con filtro local
      this.getFacturas();
    }
  }

 clearFacturaFilters(): void {
  if (navigator.vibrate) navigator.vibrate(50);
  
  this.queryFactura = '';
  this.statusFactura = '';
  this.isFilteringFactura.set(false);
  this.pageFactura = 1;
  this.hasMoreFacturas.set(true);
  this.facturas.set([]); 
  
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Disparar el Toast
  this.showToastFactura.set(true);
  setTimeout(() => this.showToastFactura.set(false), 2500);

  this.getFacturas();
}

  descargarFactura(nombre: string) {
    // Simulación de descarga
    this.toastr.info(`Preparando documento: ${nombre}`, 'Descarga');

    setTimeout(() => {
      this.toastr.success('Factura descargada correctamente', 'Éxito');
      // Aquí iría la lógica de window.open(url_del_pdf)
    }, 1500);
  }

  verDetalle(id: string) {
    // Buscamos la factura en el array que ya tenemos cargado
    const encontrada = this.facturas().find(f => f._id === id);

    if (encontrada) {
      this.facturaSeleccionada.set(encontrada);

      // 4. Código para abrir el Offcanvas de Bootstrap
      const el = document.getElementById('offcanvasDetalle');
      const bsOffcanvas = new bootstrap.Offcanvas(el);
      bsOffcanvas.show();
    }
  }

  // Calcula la suma de todos los montosBase de los detalles
  getSubtotal(): number {
    const factura = this.facturaSeleccionada();
    if (!factura || !factura.detalles) return 0;
    return factura.detalles.reduce((acc: number, item: any) => acc + item.montoBase, 0);
  }

  // Calcula la suma de todos los montosIva de los detalles
  getTotalIva(): number {
    const factura = this.facturaSeleccionada();
    if (!factura || !factura.detalles) return 0;
    return factura.detalles.reduce((acc: number, item: any) => acc + (item.montoIva || 0), 0);
  }

  reportarPago(id: string) {
    // 1. Obtenemos la factura completa del Signal
    const facturaCompleta = this.facturaSeleccionada();

    if (!facturaCompleta) {
      this.toastr.error('Error al recuperar los datos de la factura');
      return;
    }

    // 2. Cerramos el Offcanvas (Bootstrap)
    const element = document.getElementById('offcanvasDetalle');
    if (element) {
      const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(element);
      if (bsOffcanvas) bsOffcanvas.hide();
    }

    // 3. ¡ESTA ES LA PARTE CLAVE! Enviamos el ID y el STATE
    this.router.navigate(['/reportar-pago', id], {
      state: { factura: facturaCompleta } // <--- Aquí viaja el monto, nroFactura, etc.
    });
  }


  // Importa el portapapeles si usas Angular CDK o usa la versión nativa:
  copiarMonto(monto: number, tasa: number) {
    const montoBs = (monto * tasa).toFixed(2);

    navigator.clipboard.writeText(montoBs).then(() => {
      // Usamos Toastr para dar el feedback visual
      this.toastr.success(`Monto de Bs. ${montoBs} copiado`, 'Portapapeles', {
        timeOut: 2000,
        progressBar: true,
        positionClass: 'toast-bottom-center' // Lo ponemos abajo tipo móvil
      });
    }).catch(err => {
      this.toastr.error('No se pudo copiar el monto', 'Error');
    });
  }

  bajarFactura(factura: any) {
    this.loading.set(true); // Para mostrar un spinner si quieres

    this.facturaService.descargarPDF(factura).subscribe({
      next: (res: Blob) => {
        const url = window.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Factura_${factura.mes}_${factura.anio}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading.set(false);
        this.toastr.success('Descarga iniciada');
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('No se pudo generar el PDF');
      }
    });
  }


}
