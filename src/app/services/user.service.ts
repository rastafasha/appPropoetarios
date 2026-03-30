import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment';

import { RegisterForm } from '../auth/interfaces/register-form.interface';
import { LoginForm } from '../auth/interfaces/login-form.interface';
import { CargarUsuario } from '../auth/interfaces/cargar-usuarios.interface';

import {tap, map, catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user';

// declare const gapi: any;

const base_url = environment.apiUrl;
const userGoogle = environment.clientGoogle

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public auth2: any;
  public usuario!: User;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
    ) {
      // this.googleInit();
  }

  get token():string{
    return localStorage.getItem('token') || '';
  }

  get role(): 'SUPERADMIN_ROLE' | 'ADMIN_ROLE'  | 'USER_ROLE'  {
    return this.usuario.role ?? 'USER_ROLE';
  }

  get uid():string{
    return this.usuario.uid || '';
  }

  get headers(){
    return{
      headers: {
        'x-token': this.token
      }
    }
  }



  guardarLocalStorage(token: string, user: any){
    localStorage.setItem('token', token);
    // localStorage.setItem('user', user);
    localStorage.setItem('user', JSON.stringify(user));
  }


    getLocalStorage(){
      if(localStorage.getItem('token') && localStorage.getItem('user')){
        let USER = localStorage.getItem('user');
        this.usuario = JSON.parse(USER ? USER: '');
        // this.router.navigateByUrl('/start-meet');
      }
    }


  // googleInit(){

  //   return new Promise<void>((resolve) =>{

  //     gapi.load('auth2', () =>{
  //       this.auth2 = gapi.auth2.init({
  //         client_id: userGoogle,
  //         cookiepolicy: 'single_host_origin',
  //       });
  //       resolve();
  //     });
  //   });


  // }


  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');

    // this.auth2.signOut().then(()=>{
    //   this.ngZone.run(()=>{
    //     this.router.navigateByUrl('/login');
    //   })
    // })
  }

  validarToken(): Observable<boolean>{

    return this.http.get(`${base_url}/auth/renew`, {
      headers: {
        'x-token': this.token
      }
    }).pipe(
      map((resp: any) => {
        const { username, email, google, role,  uid} = resp.usuario;

        this.usuario = new User(username, email, google, role, uid);

        this.guardarLocalStorage(resp.token, resp.user);
        return true;
      }),
      catchError(error => of(false))
    );
  }

  crearUsuario(formData: RegisterForm){
    return this.http.post(`${base_url}/usuarios/crear`, formData)
    .pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.user);
      })
    )
  }

  crearEditor(formData: RegisterForm){
    return this.http.post(`${base_url}/usuarios/crearEditor`, formData)
    .pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.user);
      })
    )
  }

  actualizarPerfil(data: {email: string, nombre: string, role: string}){

    // data = {
    //   ...data,
    //   role: this.usuario.role
    // }

    // return this.http.put(`${base_url}/usuarios/editar/${this.uid}`, data, this.headers);
  }

  update(user: User){
    return this.http.put(`${base_url}/usuarios/editar/${user}`,this.headers);
  }

  login(formData:any){
    return this.http.post(`${base_url}/auth/login`, formData)
    .pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.user);
      })
    )
  }

  loginGoogle(token:string){
    return this.http.post(`${base_url}/auth/google`, {token})
    .pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.user);
      })
    )
  }

  cargarUsuarios(desde: number = 0){

    const url = `${base_url}/usuarios?desde=${desde}`;
    return this.http.get<CargarUsuario>(url, this.headers)
      .pipe(
        map( resp =>{
          const usuarios = resp.usuarios.map(
            user => new User(
              user.username,
              user.email,
              user.terminos,
              '',
              user.numdoc,
              user.google,
              user.role,
              user.uid
            ));

          return {
            total: resp.total,
            usuarios

          }
        })
      )
  }

  getUserById(_id: any)  {
    const url = `${base_url}/usuarios/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, usuario: User}) => resp.usuario)
        );
  }
  getUsuarios()  {
    const url = `${base_url}/usuarios/all`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, usuarios: User}) => resp.usuarios)
      )
  }
  getRecientes()  {
    const url = `${base_url}/usuarios/recientes`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, usuarios: User}) => resp.usuarios)
      )
  }

  getAllEditors()  {
    const url = `${base_url}/usuarios/editores`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, editores: User}) => resp.editores)
      )
  }


  deleteById(usuario: User){
    const url = `${base_url}/usuarios/delete/${usuario}`;
    return this.http.delete(url, this.headers)
  }


  editarRole(usuario: User){
    return this.http.put(`${base_url}/usuarios/editarRole/${usuario.uid}`, usuario, this.headers);
  }


  closeMenu(){
    var menuLateral = document.getElementsByClassName("sidebar");
      for (var i = 0; i<menuLateral.length; i++) {
         menuLateral[i].classList.remove("active");

      }
  }


  set_recovery_token(email:string):Observable<any>{

    const url = `${base_url}/usuarios/user_token/set/${email}`;
    return this.http.get<any>(url, this.headers)
  }


  verify_token(email:string,codigo:string):Observable<any>{
    const url = `${base_url}/usuarios/user_verify/token/${email}/${codigo}`;
    return this.http.get<any>(url, this.headers)
  }

  change_password(email:any,data:any):Observable<any>{
    const url = `${base_url}/usuarios/user_password/change/${email}/${data}`;
    return this.http.put<any>(url, this.headers)
  }
  forgotPassword(data:string):Observable<any>{
    const url = `${base_url}/usuarios/user_password/change/${data}`;
    return this.http.put<any>(url, this.headers)
  }

}