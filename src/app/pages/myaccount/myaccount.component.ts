
import { AfterViewInit, Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { HeaderComponent } from "../../shared/header/header.component";
import { environment } from '../../../environments/environment';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectorUbicacionComponent } from '../../components/selector-ubicacion-component/selector-ubicacion.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { PushNotificationService } from '../../services/push-notification.service';
import { ImagenPipe } from '../../pipes/imagen.pipe';
import { ModalInstruccionesComponent } from '../../components/modal-instrucciones/modal-instrucciones.component';

declare var bootstrap: any;

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
  selector: 'app-myaccount',
  imports: [
    RouterModule,
    CommonModule,
    HeaderComponent,
    MenufooterComponent,
    SkeletonLoaderComponent,
    SelectorUbicacionComponent,
    ReactiveFormsModule,
    ImagenPipe,
    ModalInstruccionesComponent

  ],
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss'],
})
export class MyaccountComponent implements OnInit, AfterViewInit {

  identity!: Profile;
  imagenSerUrl = environment.mediaUrlRemoto;
  user!: any;
  user_id: any;
  identityId!: any;
  isLoading: boolean = false;
  modalInstance: any;


  // Listas que le pasaremos al componente hijo (Selector)
  public edificiosResidenciales = ['Catuche', 'Tajamar', 'Tacagua', 'San Martín', 'Mohedano', 'Caruata', 'El Tejar'];
  public TORRES = ['Torre Este', 'Torre Oeste'];
  public letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Listas dinámicas que cambiarán según el botón que Ana presione
  public listaEdificios: string[] = [];
  public listaPisos: string[] = [];

  // Definimos las constantes de pisos
  public PISOS_RESIDENCIALES = Array.from({ length: 19 }, (_, i) => `${i + 1}`);
  public PISOS_OFICINAS_TORRES = Array.from({ length: 40 }, (_, i) => `${i + 1}`);
  public NIVELES_EXTRAS = ['Mezanina', 'Nivel Lecuna', 'Nivel Bolívar', 'Oficina 1', 'Oficina 2'];

  tipoSeleccionado: 'residencia' | 'oficina' | 'local' = 'residencia';
  propiedadExtraForm!: FormGroup;

  public misPropiedades: PropiedadUnificada[] = [];

   info = `
  <h2>Sección: Mi Perfil</h2>
  <p><strong>Nota importante:</strong> Si tu perfil está incompleto, verás un aviso para finalizar tu registro y habilitar todas las funciones de la aplicación.</p>
  
  <p>En este apartado podrás:</p>
  <ul>
    <li><strong>Gestionar tus inmuebles:</strong> Visualiza todas tus propiedades registradas, ya sean Residencias, Oficinas o Locales.</li> 
    <li><strong>Actualizar datos:</strong> Edita tu información personal y mantén tu perfil al día.</li>
    <li><strong>Configurar Notificaciones:</strong> Te recomendamos activarlas para recibir alertas en tiempo real sobre pagos, avisos y el estatus de tu cuenta.</li>
    <li><strong>Registrar nuevas propiedades:</strong> Si posees inmuebles adicionales, puedes crearlos desde aquí. Ten en cuenta que, una vez creados, solo la <strong>Administración</strong> podrá editarlos si requieres algún cambio.</li>
  </ul>`;



  constructor(
    public router: Router,
    public http: HttpClient,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private usuarioService: UserService,
    public activatedRoute: ActivatedRoute,
    handler: HttpBackend,
    public toastr: ToastrService,
    public pushService: PushNotificationService,
  ) {
    this.http = new HttpClient(handler);
    this.initForm();
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.identityId = this.user.uid;

    if (USER) {
      this.getUser()
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  slir() {
    this.usuarioService.logout()
  }

  ngAfterViewInit() {
    // Vinculamos la instancia al ID que pusiste en el HTML
    const modalElement = document.getElementById('modalPropiedad');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
    }
  }


  getUser() {
    this.isLoading = true;
    this.profileService.getByUser(this.identityId).subscribe({
      next: (resp: any) => {
        // 'resp' ya es el objeto profile (Ana, Martinez, residencia, etc.)
        this.identity = resp;

        if (resp) {
          this.misPropiedades = [
            ...(resp.residencia || []).map((r: any) => ({
              ...r, tipo: 'residencia', icono: 'fas fa-home text-primary'
            })),
            ...(resp.oficina || []).map((o: any) => ({
              ...o, tipo: 'oficina', icono: 'fas fa-briefcase text-info'
            })),
            ...(resp.local || []).map((l: any) => ({
              ...l, tipo: 'local', icono: 'fas fa-store text-warning'
            }))
          ];
        }
        this.isLoading = false; // Mueve esto aquí adentro
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  mostrarAvisoToastr() {
    this.toastr.warning(
      'Debes completar tu perfil (especialmente el teléfono) antes de registrar propiedades.',
      'Acceso Restringido',
      { timeOut: 4000, progressBar: true }
    );
  }

  initForm() {
    this.propiedadExtraForm = this.fb.group({
      edificio: ['', Validators.required],
      piso: ['', Validators.required],
      letra: ['', Validators.required]
    });
  }

  get resumenExtra(): string {
    // Verificamos que el formulario exista para evitar errores de carga
    if (!this.propiedadExtraForm) return 'Complete los datos para previsualizar';

    const f = this.propiedadExtraForm.value;

    // Si falta algún dato, devolvemos el mensaje por defecto
    if (!f.edificio || !f.piso || !f.letra) {
      return 'Complete los datos para previsualizar';
    }

    // Lógica de prefijo (Piso/Nivel)
    const nivelesEspeciales = ['Mezanina', 'Oficina', 'Nivel', 'Sotano'];
    const esEspecial = nivelesEspeciales.some(esp => f.piso.includes(esp));
    const prefijoNivel = esEspecial ? '' : 'Piso ';

    // Retorna el string formateado que el componente hijo espera
    return `${f.edificio}, ${prefijoNivel}${f.piso}, ${this.tipoSeleccionado} ${f.letra}`;
  }

  abrirModalPropiedad(tipo: 'residencia' | 'oficina' | 'local') {
    this.tipoSeleccionado = tipo;

    // Configuramos las listas según el tipo de propiedad que Ana quiere agregar
    if (tipo === 'residencia') {
      this.listaEdificios = this.edificiosResidenciales;
      this.listaPisos = this.PISOS_RESIDENCIALES;
    } else if (tipo === 'oficina') {
      this.listaEdificios = [...this.edificiosResidenciales, ...this.TORRES];
      this.listaPisos = [...this.NIVELES_EXTRAS, ...this.PISOS_OFICINAS_TORRES];
    } else { // Local
      this.listaEdificios = [...this.edificiosResidenciales, ...this.TORRES];
      this.listaPisos = ['Sotano 1', 'Mezanina', 'Nivel Lecuna', 'Nivel Bolívar'];
    }

    this.propiedadExtraForm.reset({ edificio: '', piso: '', letra: '' });
    if (this.modalInstance) {
      this.modalInstance.show();
    } else {
      console.error("No se encontró el elemento del modal en el DOM");
    }
  }

  guardarPropiedadExtra() {
    // Mapeamos el nombre visual al nombre de la colección del backend
    let tipoBackend = '';

    if (this.tipoSeleccionado === 'residencia') {
      tipoBackend = 'residencia';
    } else {
      tipoBackend = this.tipoSeleccionado.toLowerCase(); // 'oficina' o 'local'
    }

    const payload = {
      tipo: tipoBackend, // Ahora enviará 'residencia', 'oficina' o 'local'
      datos: this.propiedadExtraForm.value
    };

    this.profileService.agregarPropiedadExtra(payload).subscribe({
      next: (resp) => {
        this.toastr.success('Propiedad agregada correctamente', '¡Éxito!');
        this.modalInstance.hide();
        this.getUser(); // Recargamos para que Ana vea su nueva propiedad
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al guardar');
      }
    });
  }

  verDetalle(tipo: string, id: string) {
    // Navegamos pasando el tipo (residencia, Oficina, Local) y el ID
    this.router.navigate(['/propiedad-detalle', tipo, id]);
  }

  async togglePush() {
    this.pushService.isProcessing$.next(true); // Activa el cargando

    try {
      const estaSuscrito = this.pushService.isSubscribed$.value;
      if (estaSuscrito) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          // Llamada opcional a tu backend para limpiar
          this.pushService.setSubscriptionStatus(false);
        }
      } else {
        await this.pushService.subscribeToNotifications();
      }
    } finally {
      this.pushService.isProcessing$.next(false); // Desactiva el cargando
    }
  }






}
