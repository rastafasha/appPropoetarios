import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { Router, RouterModule } from '@angular/router';

import { LoadingComponent } from '../../shared/loading/loading.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile';
@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    MenufooterComponent,
    RouterModule,
    // LoadingComponent,
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  identity!: Profile;
  userId!: string;
  identityId!: any;
  user!: any;
  isLoading = false;

  private usuarioService = inject(UserService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  ngOnInit() {

    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.identityId = this.user.uid;
    console.log(this.identityId)
    this.loadIdentity();
  }

  loadIdentity() {
    this.isLoading = true;
    this.profileService.getByUser(this.identityId).subscribe((resp: any) => {
        this.identity = resp;
        console.log(this.identity)
        // this.identityId = this.identity.uid;
        this.isLoading = false;
      })
  }



}
