import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../../services/file-upload.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AsideCuentaComponent } from '../aside-cuenta/aside-cuenta.component';
import { environment } from '../../../../environments/environment';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { ImagenPipe } from '../../../pipes/imagen.pipe';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../models/profile';

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
    AsideCuentaComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe,
    LoadingComponent

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


  public perfilForm!: FormGroup;
  public imagenSubir!: File;
  public imgTemp: string | ArrayBuffer | null = null;
  public FILE_AVATAR!: HTMLInputElement;
  public IMAGE_PREVISUALIZA: string | null = null;
  text_validation: any = null;


  //DATA
  public new_password = '';
  public comfirm_password = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UserService,
    private profileService: ProfileService,
    private _router: Router,
    private _route: ActivatedRoute,
    private http: HttpClient,
    private fileUploadService: FileUploadService
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
      console.log(this.usuarioSeleccionado)
      if (!this.usuarioSeleccionado) {
        this._router.navigate(['/']);
      }
      // First initialize the form
      this.validarFormulario();
      // Then set the values
      this.perfilForm.setValue({
        _id: this.usuarioSeleccionado._id,
        first_name: this.usuarioSeleccionado.first_name,
        last_name: this.usuarioSeleccionado.last_name,
        telmovil: this.usuarioSeleccionado.telmovil || null,
        telhome: this.usuarioSeleccionado.telhome || null,
        img: this.usuarioSeleccionado.img || null,
      });
      this.isLoading = false;

    })
  }

  validarFormulario() {
    this.perfilForm = this.fb.group({
      _id: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      telmovil: ['', Validators.required],
      telhome: ['', Validators.required],
      img: [''],
    });

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

    this.isLoading = true;

    if (this.usuarioSeleccionado) {
      //actualizar
      const data = {
        ...this.perfilForm.value,
        _id: this.usuarioSeleccionado._id,
      };
      this.profileService.updateProfile(data).subscribe(
        resp => {
          Swal.fire('Actualizado', `Actualizado correctamente`, 'success');
          this.isLoading = false;
          this.getUser()
        }
      );
    } else {
      //crear
      const data = {
        ...this.perfilForm.value,
      };
      this.profileService.createProfile(data)
        .subscribe((resp: any) => {
          Swal.fire('Creado', `Creado correctamente`, 'success');
          this.isLoading = false;
          this.getUser()
          // this.router.navigateByUrl(`/dashboard/producto`);
        });
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
    this.isLoading = true;
    this.fileUploadService
      .actualizarFoto(this.imagenSubir, 'profiles', this.usuarioSeleccionado._id || '')
      .then(img => {
        this.usuarioSeleccionado.img = img;
        Swal.fire('Guardado', 'La imagen fue actualizada', 'success');
        this.isLoading = false;
        this.ngOnInit()
      }).catch(err => {
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
        this.isLoading = false;
        this.ngOnInit()
      })
  }

}
