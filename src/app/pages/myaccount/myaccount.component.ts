
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { HeaderComponent } from "../../shared/header/header.component";
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-myaccount',
  imports: [
    RouterModule,
    NgIf,
    HeaderComponent,
    MenufooterComponent,
    LoadingComponent
],
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss'],
})
export class MyaccountComponent implements OnInit {

  identity!: Profile;
  imagenSerUrl = environment.mediaUrlRemoto;
  user!: any;
  user_id:any;
  identityId!: any;
  isLoading:boolean = false;

  constructor(
    public router: Router,
    public http: HttpClient,
    private profileService: ProfileService,
    private usuarioService: UserService,
    public activatedRoute: ActivatedRoute,
    handler: HttpBackend
  ) {
    this.http = new HttpClient(handler);
  }

  ngOnInit(): void {
    window.scrollTo(0,0);

    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.identityId = this.user.uid;

    if(USER){
      this.getUser()
    }else{
     this.router.navigateByUrl('/login');
    }
  }

  slir(){
    this.usuarioService.logout()
  }

   getUser(){
     this.isLoading = true;
    this.profileService.getByUser(this.identityId).subscribe((resp: any) => {
        this.identity = resp;
        console.log(this.identity)
        this.isLoading = false;
      })
  }





}
