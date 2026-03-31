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
    SkeletonLoaderComponent

  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  public url;
  public paises: any;
  // public file !:File; // unused
  // public imgSelect !: String | ArrayBuffer; // unused
  public data_paises: any = [];
  public msm_error = false;
  public msm_success = false;
  public pass_error = false;

  public user!: User;
  public identity!: User;
  identityId!: any;

  public isLoading = false;

  public usuarioSeleccionado!: Profile;
  listaResidencias:any;

  public perfilForm!: FormGroup;
  public imagenSubir!: File;
  public imgTemp: string | ArrayBuffer | null = null;
  public FILE_AVATAR!: HTMLInputElement;
  public IMAGE_PREVISUALIZA: string | null = null;
  text_validation: any = null;

  public edificiosResidenciales = [
    'Catuche', 'Tajamar', 'Tacagua', 'San Martín', 'Mohedano', 'Caruata', 'El Tejar'
  ];
  // Genera arreglo [1, 2, ..., 19]
  public niveles = Array.from({ length: 19 }, (_, i) => i + 1);

  // Genera arreglo ['A', 'B', ..., 'Z']
  public letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  public pisoOficinas =[
    'Oficina 1', 'Oficina 2', 'Mezanina', 'Nivel Lecuna', 'Nivel Bolívar'
  ]
  public pisoLocales =[
    'Nivel Lecuna', 'Nivel Bolívar', 'Mezanina', 'Sotano 1' 
  ]

  public edificiosOficinas = [
    'Catuche', 'Tajamar', 'Tacagua', 'San Martín', 'Mohedano', 'Caruata', 'El Tejar', 'Torre Este', 'Torre Oeste'
  ];
  public edificiosLocales = [
    'Catuche', 'Tajamar', 'Tacagua', 'San Martín', 'Mohedano', 'Caruata', 'El Tejar', 'Torre Este', 'Torre Oeste'
  ];


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
  }


  getUser() {
    this.isLoading = true;
    this.profileService.getByUser(this.identityId).subscribe((resp: any) => {
      this.usuarioSeleccionado = resp;
      if (!this.usuarioSeleccionado) {
        this._router.navigate(['/']);
      }
      // First initialize the form
      this.validarFormulario();
      // Then set the values (using patchValue for partial updates)
      this.perfilForm.patchValue({
        _id: this.usuarioSeleccionado._id || '',
        first_name: this.usuarioSeleccionado.first_name || '',
        last_name: this.usuarioSeleccionado.last_name || '',
        telmovil: this.usuarioSeleccionado.telmovil || '',
        telhome: this.usuarioSeleccionado.telhome || '',
        img: this.usuarioSeleccionado.img || '',
        haveResidencia: !!this.usuarioSeleccionado?.haveResidencia,
        haveOficina: !!this.usuarioSeleccionado?.haveOficina,
        haveLocal: !!this.usuarioSeleccionado?.haveLocal,
        residencia: this.usuarioSeleccionado.residencia?.edificio || '',
        pisoResidencia: this.usuarioSeleccionado.residencia?.piso || '',
        letraResidencia: this.usuarioSeleccionado.residencia?.letra || '',
        oficina: this.usuarioSeleccionado.oficina?.edificio || '',
        pisoOficina: this.usuarioSeleccionado.oficina?.piso || '',
        letraOficina: this.usuarioSeleccionado.oficina?.letra || '',
        local: this.usuarioSeleccionado.local?.edificio || '',
        pisoLocal: this.usuarioSeleccionado.local?.piso || '',
        letraLocal: this.usuarioSeleccionado.local?.letra || ''
      });
      this.isLoading = false;

    })
  }

  validarFormulario() {
    this.perfilForm = this.fb.group({
      _id: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      telmovil: ['', [Validators.required, Validators.pattern(/^[0-9+()\- ]*$/) ]],
      telhome: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9+()\- ]*$/) 
      ]],
      img: [''],
      haveResidencia: [''],
      haveOficina: [''],
      haveLocal: [''],
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

  get resumenResidencia(): string {
    const edif = this.perfilForm.get('residencia')?.value;
    const piso = this.perfilForm.get('pisoResidencia')?.value;
    const letra = this.perfilForm.get('letraResidencia')?.value;

    if (edif && piso && letra) {
      return `${edif}, Piso ${piso}, Apto ${letra}`;
    }
    return 'Seleccione todos los campos...';
  }
  get resumenOficina(): string {
    const edif = this.perfilForm.get('oficina')?.value;
    const piso = this.perfilForm.get('pisoOficina')?.value;
    const letra = this.perfilForm.get('letraOficina')?.value;

    if (edif && piso && letra) {
      return `${edif}, Piso ${piso}, Oficina ${letra}`;
    }
    return 'Seleccione todos los campos...';
  }
  get resumenLocal(): string {
    const edif = this.perfilForm.get('local')?.value;
    const piso = this.perfilForm.get('pisoLocal')?.value;
    const letra = this.perfilForm.get('letraLocal')?.value;

    if (edif && piso && letra) {
      return `${edif}, Nivel ${piso}, Local ${letra}`;
    }
    return 'Seleccione todos los campos...';
  }


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

  close_alert() {
    this.msm_success = false;
    this.msm_error = false;
  }

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

    if (this.usuarioSeleccionado) {
      //actualizar
      // Transform flat form to nested structure for backend
      const formData = this.perfilForm.value;
      const data: any = {
        ...formData,
        _id: this.usuarioSeleccionado._id,
        residencia: formData.haveResidencia ? {
          edificio: formData.residencia,
          piso: formData.pisoResidencia,
          letra: formData.letraResidencia
        } : null,
        oficina: formData.haveOficina ? {
          edificio: formData.oficina,
          piso: formData.pisoOficina,
          letra: formData.letraOficina
        } : null,
        local: formData.haveLocal ? {
          edificio: formData.local,
          piso: formData.pisoLocal,
          letra: formData.letraLocal
        } : null,
      };
      this.profileService.updateProfile(data).subscribe({
        next: (res) =>{
          this.toastr.success('Tus datos han sido actualizados con éxito.', '¡Excelente!');
          this.isLoading = false;
          this.getUser()
        },
         error: (err) => {
          this.isLoading = false;
          this.toastr.error('Hubo un problema al guardar los cambios.', 'Error de Servidor');
        }

      })
      
    } else {
      //crear
      // Transform flat form to nested structure for backend
      const formData = this.perfilForm.value;
      const data: any = {
        ...formData,
        residencia: formData.haveResidencia ? {
          edificio: formData.residencia,
          piso: formData.pisoResidencia,
          letra: formData.letraResidencia
        } : null,
        oficina: formData.haveOficina ? {
          edificio: formData.oficina,
          piso: formData.pisoOficina,
          letra: formData.letraOficina
        } : null,
        local: formData.haveLocal ? {
          edificio: formData.local,
          piso: formData.pisoLocal,
          letra: formData.letraLocal
        } : null,
      };
      this.profileService.createProfile(data).subscribe({
        next: (res) =>{
          this.toastr.success('Tus datos han sido creado con éxito.', '¡Excelente!');
          this.isLoading = false;
          this.getUser()
        },
         error: (err) => {
          this.isLoading = false;
          this.toastr.error('Hubo un problema al guardar los cambios.', 'Error de Servidor');
        }
       })
    }
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

  irAtras(){
    this.location.back();
  }

}
