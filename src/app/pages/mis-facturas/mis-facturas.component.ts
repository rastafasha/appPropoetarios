import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { ToastrService } from 'ngx-toastr';
import { FacturacionService } from '../../services/facturacion.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Router } from '@angular/router';
declare var bootstrap: any;
@Component({
  selector: 'app-mis-facturas',
  imports: [CommonModule, HeaderComponent, MenufooterComponent, InfiniteScrollModule],
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

  public toastr = inject(ToastrService);
  public facturaService = inject(FacturacionService);
  private router = inject(Router);

  ngOnInit() {
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.userId = JSON.parse(USER || '{}').uid;

    this.getFacturas();
  }

  getMesNombre(mes: number): string {
    const nombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombres[mes - 1] || 'Mes';
  }

  onScroll() {
    if (this.loading()) return;
    this.page++;
    this.getFacturas();
  }

  getFacturas() {
    this.loading.set(true);

    this.facturaService.getFacturasByUser(this.userId, this.page).subscribe({
      next: (resp) => {
        // Ahora 'resp' es el objeto que viene de tu API
        if (resp.ok) {
          // Actualizamos el signal con el array que viene dentro del objeto
          this.facturas.update(prev => [...prev, ...resp.facturas]);

          // Si no vienen más facturas o es la última página, detenemos el scroll
          if (resp.facturas.length < 10) {
            this.hasMore.set(false);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      }
    });
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


}
