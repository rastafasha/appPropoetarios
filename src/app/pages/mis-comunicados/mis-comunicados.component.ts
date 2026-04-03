import { Component, inject, OnInit } from '@angular/core';
import { ComunicadoService } from '../../services/comunicado.service';
import { CommonModule } from '@angular/common';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { BackButtonComponent } from '../../shared/back-button/back-button.component';
import { Comunicado } from '../../models/comunicado';
declare var bootstrap: any;

@Component({
  selector: 'app-mis-comunicados',
  imports: [CommonModule, BackButtonComponent, MenufooterComponent],
  templateUrl: './mis-comunicados.component.html',
  styleUrl: './mis-comunicados.component.scss'
})
export class MisComunicadosComponent implements OnInit{
  title = 'Cartelera Digital';
  cargando:boolean = false;
  comunicados!:Comunicado[];
  public avisoSeleccionado: any;

  public comunicadosService = inject(ComunicadoService);

  ngOnInit(){
    window.scrollTo(0, 0);
    this.comunicadosService.obtenerMisComunicados().subscribe((resp:any)=>{
      this.comunicados = resp
    })
  }

  verDetalle(aviso: any) {
    this.avisoSeleccionado = aviso;
    // Abrimos el offcanvas manualmente
    const element = document.getElementById('offcanvasAviso');
    const bsOffcanvas = new bootstrap.Offcanvas(element);
    bsOffcanvas.show();
  }

}
