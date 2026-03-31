import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../../services/file-upload.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AsideCuentaComponent } from '../aside-cuenta/aside-cuenta.component';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { ImagenPipe } from '../../../pipes/imagen.pipe';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../models/profile';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader.component';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { SelectorUbicacionComponent } from '../../../components/selector-ubicacion-component/selector-ubicacion.component';
declare var jQuery: any;
declare var $: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-perfil',
  imports: [
    CommonModule,
    HeaderComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe,
    SkeletonLoaderComponent,
    SelectorUbicacionComponent

  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  public url;
  public paises: any;
  // public file !:File; // unused
  // public imgSelect !: String | ArrayBuffer; // unused
  public msm_error = false;
  public msm_success = false;
  public pass_error = false;

  public user!: User;
  public identity!: User;
  identityId!: any;

  public isLoading = false;

  public usuarioSeleccionado!: Profile;
  listaResidencias: any;

  public perfilForm!: FormGroup;
  public imagenSubir!: File;
  public imgTemp: string | ArrayBuffer | null = null;
  public FILE_AVATAR!: HTMLInputElement;
  public IMAGE_PREVISUALIZA: string | null = null;
  text_validation: any = null;
  // 1. RESIDENCIAS (Apartamentos)
  public edificiosResidenciales = ['Catuche', 'Tajamar', 'Tacagua', 'San Martín', 'Mohedano', 'Caruata', 'El Tejar'];
  public PISOS_RESIDENCIALES = Array.from({ length: 19 }, (_, i) => ` ${i + 1}`);

  // 2. OFICINAS (Torres 1-40 + Niveles especiales)
  public TORRES = ['Torre Este', 'Torre Oeste'];
  public PISOS_OFICINAS_TORRES = Array.from({ length: 40 }, (_, i) => `${i + 1}`);
  public NIVELES_EXTRAS_OFICINAS = ['Sotano 1', 'Mezanina', 'Lecuna', 'Bolívar', 'Oficina 1', 'Oficina 2'];
  // Combinamos todos los posibles niveles de oficina
  public TODOS_NIVELES_OFICINA = [...this.NIVELES_EXTRAS_OFICINAS, ...this.PISOS_OFICINAS_TORRES];

  // 3. LOCALES (Solo niveles comerciales)
  public NIVELES_LOCALES = ['Sotano 1', 'Mezanina', 'Lecuna', 'Bolívar'];

  // Lista global de edificios para Oficinas y Locales
  public todosLosEdificios = [...this.edificiosResidenciales, ...this.TORRES];

  // Abecedario
  public letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


  //DATA
  public new_password = '';
  public comfirm_password = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private _router: Router,
    private fileUploadService: FileUploadService,
    private toastr: ToastrService,
    private location: Location

  ) {
    // this.usuario = usuarioService.usuario;

    this.url = environment.apiUrl;

    // Initialize empty FormGroup to prevent template binding errors
    this.perfilForm = this.fb.group({
      _id: [''],
      first_name: [''],
      last_name: [''],
      telmovil: [''],
      telhome: [''],
      img: [''],
      haveResidencia: [false],
      haveOficina: [false],
      haveLocal: [false],
      residencia: [''],
      pisoResidencia: [''],
      letraResidencia: [''],
      oficina: [[]],
      pisoOficina: [''],
      letraOficina: [''],
      local: [[]],
      pisoLocal: [''],
      letraLocal: ['']
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.identityId = this.user.uid;
    // console.log(this.user);
    this.getUser();
    this.escucharSwitches();
  }


  getUser() {
    this.isLoading = true;
    this.profileService.getByUser(this.identityId).subscribe((resp: any) => {
      this.usuarioSeleccionado = resp;
      if (!this.usuarioSeleccionado) {
        this._router.navigate(['/']);
        return;
      }

      this.validarFormulario();

      // 1. Extraemos el objeto completo [0] para mostrar el texto en los selectores
      // Para Residencia
      const resData = (this.usuarioSeleccionado.residencia as unknown as any[])?.[0];
      const resId = resData?._id;

      // Para Oficina
      const ofiData = (this.usuarioSeleccionado.oficina as unknown as any[])?.[0];
      const ofiId = ofiData?._id;

      // Para Local
      const locData = (this.usuarioSeleccionado.local as unknown as any[])?.[0];
      const locId = locData?._id;

      // 2. Mapeamos al formulario
      this.perfilForm.patchValue({
        _id: this.usuarioSeleccionado._id,
        first_name: this.usuarioSeleccionado.first_name,
        last_name: this.usuarioSeleccionado.last_name,
        telmovil: this.usuarioSeleccionado.telmovil,
        telhome: this.usuarioSeleccionado.telhome,
        img: this.usuarioSeleccionado.img,

        // Banderas de visibilidad
        haveResidencia: !!this.usuarioSeleccionado.haveResidencia,
        haveOficina: !!this.usuarioSeleccionado.haveOficina,
        haveLocal: !!this.usuarioSeleccionado.haveLocal,

        // Mostramos el TEXTO en los selectores del hijo
        residencia: resData?.edificio || '',
        pisoResidencia: resData?.piso || '',
        letraResidencia: resData?.letra || '',

        oficina: ofiData?.edificio || '',
        pisoOficina: ofiData?.piso || '',
        letraOficina: ofiData?.letra || '',

        local: locData?.edificio || '',
        pisoLocal: locData?.piso || '',
        letraLocal: locData?.letra || ''
      });

      this.isLoading = false;
    });
  }

  validarFormulario() {
    this.perfilForm = this.fb.group({
      _id: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      telmovil: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,20}$/)]],
      telhome: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9\s\-]{7,20}$/)
      ]],
      img: [''],
      haveResidencia: [false], // Cambiado de '' a false
      haveOficina: [false],
      haveLocal: [false],
      residencia: [''],
      pisoResidencia: [''],
      letraResidencia: [''],
      oficina: [''],
      pisoOficina: [''],
      letraOficina: [''],
      local: [''],
      pisoLocal: [''],
      letraLocal: ['']
    });

  }
  // Logica edificios, locales, oficinas y residencias
  private generarResumen(edif: string, nivel: string, identificador: string, tipo: 'Apto' | 'Oficina' | 'Local'): string {
    if (!edif || !nivel || !identificador) return 'Complete los datos para previsualizar';

    // Si el nivel ya es descriptivo (Mezanina, Oficina 1, Nivel Lecuna), no le ponemos "Piso"
    const nivelesEspeciales = ['Mezanina', 'Oficina', 'Nivel', 'Sotano'];
    const esEspecial = nivelesEspeciales.some(esp => nivel.includes(esp));

    const prefijoNivel = esEspecial ? '' : 'Piso ';

    // Retorna: "Catuche, Piso 5, Apto B" o "Torre Este, Mezanina, Oficina 10"
    return `${edif}, ${prefijoNivel}${nivel}, ${tipo} ${identificador}`;
  }

  get resumenResidencia(): string {
    const f = this.perfilForm.value;
    return this.generarResumen(f.residencia, f.pisoResidencia, f.letraResidencia, 'Apto');
  }

  get resumenOficina(): string {
    const f = this.perfilForm.value;
    return this.generarResumen(f.oficina, f.pisoOficina, f.letraOficina, 'Oficina');
  }

  get resumenLocal(): string {
    const f = this.perfilForm.value;
    return this.generarResumen(f.local, f.pisoLocal, f.letraLocal, 'Local');
  }
  // Logica edificios, locales, oficinas y residencias

  //selector
  onCheckChange(tipo: 'residencia' | 'oficina' | 'local') {

    // 1. Obtenemos el valor actual del booleano (true o false)
    // Nota: Usamos los nombres exactos de tu Schema: haveResidencia, haveOficina, haveLocal
    const fieldName = 'have' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const estaActivado = this.perfilForm.get(fieldName)?.value;

    if (estaActivado) {
      console.log(`activó: ${tipo}. Mostrando campos adicionales...`);
      // Aquí podrías cargar una lista de edificios desde tu API si fuera necesario
    } else {
      console.log(`desactivó: ${tipo}. Limpiando selección...`);
      // Si lo apaga, es buena práctica limpiar el ID seleccionado para no enviar basura al backend
      this.perfilForm.get(tipo)?.setValue([]);
    }
  }

  escucharSwitches() {
    // Resetear RESIDENCIA si se apaga el switch
    this.perfilForm.get('haveResidencia')?.valueChanges.subscribe(value => {
      if (!value) {
        this.perfilForm.patchValue({
          residencia: '',
          pisoResidencia: '',
          letraResidencia: ''
        });
      }
    });

    // Resetear OFICINA si se apaga el switch
    this.perfilForm.get('haveOficina')?.valueChanges.subscribe(value => {
      if (!value) {
        this.perfilForm.patchValue({
          oficina: '',
          pisoOficina: '',
          letraOficina: ''
        });
      }
    });

    // Resetear LOCAL si se apaga el switch
    this.perfilForm.get('haveLocal')?.valueChanges.subscribe(value => {
      if (!value) {
        this.perfilForm.patchValue({
          local: '',
          pisoLocal: '',
          letraLocal: ''
        });
      }
    });
  }
  //selector




  view_password() {
    let type = $('#password').attr('type');

    if (type == 'text') {
      $('#password').attr('type', 'password');

    } else if (type == 'password') {
      $('#password').attr('type', 'text');
    }
  }

  view_password2() {
    let type = $('#password_dos').attr('type');

    if (type == 'text') {
      $('#password_dos').attr('type', 'password');

    } else if (type == 'password') {
      $('#password_dos').attr('type', 'text');
    }
  }

  onUserSave() {

    if (this.perfilForm.invalid) {
      // Marcamos los campos para que se vean los errores en rojo si los hay
      this.perfilForm.markAllAsTouched();
      this.toastr.warning(
        'Asegúrate de que los teléfonos tengan el formato correcto (+58 ...)',
        'Formato Inválido',
        { positionClass: 'toast-bottom-right' }
      );
      this.toastr.error('Por favor, completa los campos requeridos correctamente.', 'Formulario Incompleto');
      return;
    }

    this.isLoading = true;
    const f = this.perfilForm.value;

    // 1. Extraemos solo lo que NO es de ubicación para no duplicar datos en el envío
    // Usamos destructuring para sacar los campos que vamos a reestructurar
    const { residencia, pisoResidencia, letraResidencia, oficina, pisoOficina, letraOficina, local, pisoLocal, letraLocal, ...resto } = f;

    // Extraemos los IDs originales del objeto que cargamos en getUser
    // Para Residencia

    const resOriginal = (this.usuarioSeleccionado.residencia as unknown as any[])?.[0];
    const resId = resOriginal?._id;

    // Para Oficina

    const ofciOriginal = (this.usuarioSeleccionado.oficina as unknown as any[])?.[0];
    const oficId = ofciOriginal?._id;


    // Para Local
    const localOriginal = (this.usuarioSeleccionado.local as unknown as any[])?.[0];
    const localId = localOriginal?._id;

    const locData = (this.usuarioSeleccionado.local as unknown as any[])?.[0];
    const locId = locData?._id;

    // 2. Construimos el objeto final limpio
    const data: any = {
      ...resto,
      _id: this.usuarioSeleccionado._id,
      // Enviamos el array de IDs que Mongoose espera
     residencia: f.haveResidencia && resOriginal ? [{ 
      _id: resOriginal._id, // EL ID ES CLAVE PARA EL CONTROLADOR DE NODE
      edificio: f.residencia, 
      piso: f.pisoResidencia, 
      letra: f.letraResidencia 
      }] : [],
       oficina: f.haveOficina && ofciOriginal ? [{ 
      _id: ofciOriginal._id, // EL ID ES CLAVE PARA EL CONTROLADOR DE NODE
      edificio: f.oficina, 
      piso: f.pisoOficina, 
      letra: f.letraOficina 
      }] : [],
       local: f.haveLocal && localOriginal ? [{ 
      _id: localOriginal._id, // EL ID ES CLAVE PARA EL CONTROLADOR DE NODE
      edificio: f.local, 
      piso: f.pisoLocal, 
      letra: f.letraLocal 
      }] : [],

      
    };

    // 3. Añadimos el ID si es actualización
    if (this.usuarioSeleccionado) {
      data._id = this.usuarioSeleccionado._id;
    }

    // 4. Llamada al servicio (unificada)
    const peticion = this.usuarioSeleccionado
      ? this.profileService.updateProfile(data)
      : this.profileService.createProfile(data);

    peticion.subscribe({
      next: () => {
        this.toastr.success(`Datos ${this.usuarioSeleccionado ? 'actualizados' : 'creados'} con éxito.`, '¡Excelente!');
        this.isLoading = false;
        this.getUser();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Hubo un problema al guardar los cambios.', 'Error de Servidor');
      }
    });
  }


  cambiarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.imagenSubir = file;
    this.FILE_AVATAR = input;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.IMAGE_PREVISUALIZA = reader.result as string;
      this.imgTemp = reader.result;
    };
  }

  subirImagen() {
    if (!this.FILE_AVATAR) {
      this.toastr.info('Selecciona una imagen primero.', 'Aviso');
      return;
    }

    this.isLoading = true;
    this.fileUploadService
      .actualizarFoto(this.imagenSubir, 'profiles', this.usuarioSeleccionado._id || '')
      .then(img => {
        this.usuarioSeleccionado.img = img;
        this.toastr.success('Foto de perfil actualizada.', 'Imagen Guardada'),
          this.isLoading = false;
        this.ngOnInit()
      }).catch(err => {
        this.toastr.error('No se pudo subir la imagen.', 'Error')
        this.isLoading = false;
        this.ngOnInit()
      })
  }

  irAtras() {
    this.location.back();
  }

}
