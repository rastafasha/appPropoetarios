import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';

// declare const gapi: any;


@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // HeaderComponent,
    // FooterComponent,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public formSumitted = false;
  public auth2: any;

  loginForm: FormGroup;
  hidePassword = true; // Por defecto está oculta


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UserService,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit() {
    // this.renderButton();
    this.usuarioService.getLocalStorage();
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        remember: true
      });
    }
  }
togglePassword() {
  this.hidePassword = !this.hidePassword;
}

  login() {

    this.usuarioService.login(this.loginForm.value).subscribe(
      resp => {
        // console.log('Login response:', resp);
        // Set estaAutenticado always on success (for guard)
        localStorage.setItem('estaAutenticado', 'true');
        this.usuarioService.getLocalStorage();

        if (this.loginForm.get('remember')?.value) {
          localStorage.setItem('email', this.loginForm.get('email')?.value);
        } else {
          localStorage.removeItem('email');
        }

        this.router.navigateByUrl('/home');


        // this.router.navigateByUrl('/my-account');
      }, (err) => {
        Swal.fire('Error', err.error.msg, 'error');
      }
    )

  }



  // renderButton() {
  //   gapi.signin2.render('my-signin2', {
  //     'scope': 'profile email',
  //     'width': 240,
  //     'height': 50,
  //     'longtitle': true,
  //     'theme': 'dark',
  //   });
  //   this.startApp();
  // }

  async startApp() {
    // this.usuarioService.googleInit();
    this.auth2 = this.usuarioService.auth2;

    // this.attachSignin(document.getElementById('my-signin2'));
  }

  // attachSignin(element) {
  //   this.auth2.attachClickHandler(element, {},
  //       (googleUser) =>{
  //         const id_token = googleUser.getAuthResponse().id_token;

  //         this.usuarioService.loginGoogle(id_token).subscribe(
  //           resp=>{

  //             this.ngZone.run(()=>{
  //               this.router.navigateByUrl('/app/my-account');
  //             })
  //           }
  //         );


  //       }, (error) =>{
  //         alert(JSON.stringify(error, undefined, 2));
  //       });
  // }

}
