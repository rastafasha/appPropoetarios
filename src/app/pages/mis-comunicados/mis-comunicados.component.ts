import { Component, inject, OnInit, signal } from '@angular/core';
import { ComunicadoService } from '../../services/comunicado.service';
import { CommonModule } from '@angular/common';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ModalInstruccionesComponent } from '../../components/modal-instrucciones/modal-instrucciones.component';
declare var bootstrap: any;

@Component({
  selector: 'app-mis-comunicados',
  imports: [CommonModule,  MenufooterComponent,
    ModalInstruccionesComponent,
     InfiniteScrollModule],
  templateUrl: './mis-comunicados.component.html',
  styleUrl: './mis-comunicados.component.scss'
})
export class MisComunicadosComponent implements OnInit {
  title = 'Cartelera Digital';
  public comunicados = signal<any[]>([]);
  public loading = signal(false);
  public hasMore = signal(true);
  public page = 1;
  public avisoSeleccionado: any;

  info = `
  <h2>Sección: Cartelera Digital</h2>
  <p>Mantente al día con las comunicaciones oficiales de tu comunidad:</p>
  <ul>
    <li><strong>Avisos Segmentados:</strong> Visualiza información específica según tu tipo de propiedad (Residencias, Locales u Oficinas).</li> 
    <li><strong>Comunicados Generales:</strong> Accede a las noticias y alertas globales del <strong>Complejo Parque Central</strong>.</li> 
    <li><strong>Vista Previa:</strong> Cada anuncio muestra inicialmente un resumen rápido junto con su fecha de emisión.</li> 
    <li><strong>Lectura Completa:</strong> Haz clic en el <strong>botón azul</strong> de cada tarjeta para desplegar el detalle completo de la información.</li>
  </ul>`;


  public comunicadosService = inject(ComunicadoService);

  ngOnInit() {
    window.scrollTo(0, 0);
    this.cargarComunicados();
  }

  cargarComunicados() {
    if (this.loading() || !this.hasMore()) return;

    this.loading.set(true);
    this.comunicadosService.obtenerMisComunicados(this.page).subscribe({
      next: (resp: any) => {
        const newData = resp.comunicados || [];
        // Unimos y evitamos duplicados
        this.comunicados.update(current => {
          const ids = new Set(current.map(c => c._id));
          const unique = resp.comunicados.filter((c: any) => !ids.has(c._id));
          return [...current, ...unique];
        });

        // Gestionamos el fin de la lista (PH/Sótano)
        this.hasMore.set(resp.proximo !== null);
        if (resp.proximo) this.page = resp.proximo;

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onScroll() {
    this.cargarComunicados();
  }
  verDetalle(aviso: any) {
    this.avisoSeleccionado = aviso;
    // Abrimos el offcanvas manualmente
    const element = document.getElementById('offcanvasAviso');
    const bsOffcanvas = new bootstrap.Offcanvas(element);
    bsOffcanvas.show();
  }

}
