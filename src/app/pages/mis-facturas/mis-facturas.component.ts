import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mis-facturas',
  imports: [CommonModule, HeaderComponent, MenufooterComponent],
  templateUrl: './mis-facturas.component.html',
  styleUrl: './mis-facturas.component.scss'
})
export class MisFacturasComponent {
  
  public toastr = inject(ToastrService);

  descargarFactura(nombre: string) {
  // Simulación de descarga
  this.toastr.info(`Preparando documento: ${nombre}`, 'Descarga');
  
  setTimeout(() => {
    this.toastr.success('Factura descargada correctamente', 'Éxito');
    // Aquí iría la lógica de window.open(url_del_pdf)
  }, 1500);
}

}
