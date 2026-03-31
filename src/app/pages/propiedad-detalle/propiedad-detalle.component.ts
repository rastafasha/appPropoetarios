import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { Location } from '@angular/common';
import { ProfileService } from '../../services/profile.service';

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
  imports: [CommonModule, SkeletonLoaderComponent],
  templateUrl: './propiedad-detalle.component.html',
  styleUrl: './propiedad-detalle.component.scss'
})
export class PropiedadDetalleComponent {
  isLoading: boolean = false;

   propiedad?: PropiedadUnificada; 
  tipo: string | null = '';

  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);
  private profileService = inject(ProfileService);

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

  if (!userId) {
    this.irAtras();
    return;
  }

  // 2. Consultamos al servicio
  this.profileService.getByUser(userId).subscribe({
    next: (resp: any) => {
      // Mapeamos los nombres que vienen de la URL a las propiedades del JSON
      const mapaTipos: { [key: string]: string } = {
        'residencia': 'residencia', // Si en la URL pasas 'residencia'
        'Apto': 'residencia',       // Por si acaso usas 'Apto'
        'Oficina': 'oficina',
        'Local': 'local'
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
    case 'residencia': 
    case 'Apto': return 'fas fa-home';
    case 'Oficina': return 'fas fa-briefcase';
    case 'Local': return 'fas fa-store';
    default: return 'fas fa-building';
  }
}
  irAtras() {
    this.location.back();
  }

  reportarPago(){}

}
