import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { NgClass, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
import { ImagenPipe } from '../../pipes/imagen.pipe';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgClass,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  public formSumitted = false;
  registerForm: FormGroup;

  public currentStep: number = 1;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UserService,
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      numdoc: ['', Validators.required],
      terminos: [false],

    }, {
      validators: this.passwordsIguales('password', 'password2')

    });
  }

  nextStep() {
    const username = this.registerForm.get('username');
    const numdoc = this.registerForm.get('numdoc');

    if (username?.invalid || numdoc?.invalid) {
      username?.markAsTouched();
      numdoc?.markAsTouched();
      return;
    }
    this.currentStep = 2;
  }

  prevStep() {
    this.currentStep = 1;
  }

  crearUsuario() {
  this.formSumitted = true;
  if (this.registerForm.invalid) return;

  this.usuarioService.crearUsuario(this.registerForm.value).subscribe({
    next: (resp: any) => {
      // 1. IMPORTANTE: Guarda los datos que vienen en la respuesta (ajusta según tu backend)
      // Normalmente el backend devuelve { ok: true, usuario, token }
      if (resp.token && resp.usuario) {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('user', JSON.stringify(resp.usuario));
      }

      // 2. Ahora sí actualizamos el estado del servicio
      this.usuarioService.getLocalStorage();

      // 3. Mostramos el Swal y redirigimos
      Swal.fire({
        title: '¡Gracias por Registrarte!',
        text: 'En breve te enviaremos a tu perfil para completar los datos requeridos',
        icon: 'success',
        timer: 3000, // Le damos 3 segundos para que lea el mensaje
        showConfirmButton: false
      }).then(() => {
        // Redirigimos después de que el Swal se cierre o pase el tiempo
        this.router.navigateByUrl('/my-account');
      });
    },
    error: (err) => {
      Swal.fire('Error', err.error.msg || 'No se pudo completar el registro', 'error');
    }
  });
}


  campoNoValido(campo: string): boolean {
    if (this.registerForm.get(campo)?.invalid && this.formSumitted) {
      return true;
    } else {
      return false;
    }

  }

  aceptaTerminos() {
    return !this.registerForm.get('terminos')?.value && this.formSumitted;
  }

  passwordNoValido() {
    const pass1 = this.registerForm.get('password')?.value;
    const pass2 = this.registerForm.get('password2')?.value;

    if ((pass1 !== pass2) && this.formSumitted) {
      return true;
    } else {
      return false;
    }
  }

  passwordsIguales(pass1Name: string, pass2Name: string) {
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.get(pass1Name);
      const pass2Control = formGroup.get(pass2Name);

      if (pass1Control?.value === pass2Control?.value) {
        pass2Control?.setErrors(null)
      } else {
        pass2Control?.setErrors({ noEsIgual: true });
      }
    }
  }

}
