import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

interface PropiedadUnificada {
  _id: string;
  edificio?: string;
  letra?: string;
  piso?: string;
  montoMensual?: number;
  tipo: 'residencia' | 'oficina' | 'local';
  icono: string; // La hacemos obligatoria para el HTML
}

@Component({
  selector: 'app-propiedad-detalle',
  imports: [CommonModule, SkeletonLoaderComponent, BackButtonComponent],
  templateUrl: './propiedad-detalle.component.html',
  styleUrl: './propiedad-detalle.component.scss'
})
export class PropiedadDetalleComponent {
  isLoading: boolean = false;
  title= 'Detalle de Propiedad';

   propiedad?: PropiedadUnificada; 
  tipo: string | null = '';

  private activatedRoute = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  ngOnInit() {
   const id = this.activatedRoute.snapshot.paramMap.get('id');
    // Guardamos el tipo que viene de la URL
    this.tipo = this.activatedRoute.snapshot.paramMap.get('tipo');
    console.log(this.tipo)

    if (id) {
      this.cargarPropiedad(id);
    }
  }

 cargarPropiedad(id: string) {
  this.isLoading = true;

  // 1. Obtenemos el ID del usuario del localStorage
  const userJson = localStorage.getItem('user');
  const userId = userJson ? JSON.parse(userJson).uid : null;


  // 2. Consultamos al servicio
  this.profileService.getByUser(userId).subscribe({
    next: (resp: any) => {
      // Mapeamos los nombres que vienen de la URL a las propiedades del JSON
      const mapaTipos: { [key: string]: string } = {
        'residencia': 'residencia', // Si en la URL pasas 'residencia'
        'oficina': 'oficina',
        'local': 'local'
      };

      const nombreColeccion = mapaTipos[this.tipo || ''] || 'residencia';
      const lista = resp[nombreColeccion] || [];

      // 3. Buscamos la propiedad específica por su ID
      const encontrada = lista.find((p: any) => p._id === id);

      if (encontrada) {
        this.propiedad = {
          ...encontrada,
          tipo: this.tipo as any,
          icono: this.obtenerIcono(this.tipo)
        };
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error al cargar detalle:', err);
      this.isLoading = false;
    }
  });
}

  obtenerIcono(tipo: string | null): string {
  switch(tipo) {
    case 'residencia': return 'fas fa-home';
    case 'oficina': return 'fas fa-briefcase';
    case 'local': return 'fas fa-store';
    default: return 'fas fa-building';
  }
}
  
  reportarPago(payment: any) {
  // Verificamos si el objeto tiene el ID de la factura
  const facturaId = payment.factura?._id || payment.factura; 

  if (facturaId) {
    this.router.navigate(['/reportar-pago', facturaId]);
  } else {
    // Si no hay factura (pago huérfano), podrías mandarlo a una ruta general
    console.warn('Este pago no tiene una factura asociada');
    this.router.navigate(['/reportar-pago', 'nuevo']); 
  }
}
  verHistorial() {
    // Navegamos pasando el tipo (residencia, Oficina, Local) y el ID
    this.router.navigate(['/mis-facturas' ]);
  }

}
