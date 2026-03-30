import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Profile } from '../models/profile';
import { User } from '../models/user';
import { Observable } from 'rxjs';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  public profile!: Profile;
  public user!: User;


  constructor(private http: HttpClient) { }

  get token():string{
    return localStorage.getItem('token') || '';
  }


  get headers(){
    return{
      headers: {
        'x-token': this.token
      }
    }
  }


  getProfiles() {
    const url = `${baseUrl}/profile/all`;
    return this.http.get<any>(url,this.headers)
      .pipe(
        map((resp:{ok: boolean, profiles: Profile}) => resp.profiles)
      )
  }

  getProfile(_id: Profile) {
    const url = `${baseUrl}/profile/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, profile: Profile}) => resp.profile)
        );
  }

  getByUser(usuario:any) {
    const url = `${baseUrl}/profile/user_profile/${usuario}`;
    return this.http.get<any>(url,this.headers)
      .pipe(
        map((resp:{ok: boolean, profile: Profile}) => resp.profile)
      )
  }

  listarUsuario(id:any):Observable<any>{
    const url = `${baseUrl}/profile/user_profile/${id}`;
    return this.http.get<any>(url,this.headers)
    .pipe(
      map((resp:{ok: boolean, profile: Profile}) => resp.profile)
    )
  }
  estadoCuenta(id:string):Observable<any>{
    const url = `${baseUrl}/profile/estadocuenta/${id}`;
    return this.http.get<any>(url,this.headers)

  }


  createProfile(profile:Profile) {
    const url = `${baseUrl}/profile/crear`;
    return this.http.post(url, profile, this.headers);
  }

  updateProfile(profile:Profile) {
    const url = `${baseUrl}/profile/editar/${profile._id}`;
    return this.http.put(url, profile, this.headers);
  }

  deleteProfile(_id: string) {
    const url = `${baseUrl}/profiles/borrar/${_id}`;
    return this.http.delete(url, this.headers);
  }

}
