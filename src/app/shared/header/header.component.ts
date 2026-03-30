import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

   private usuarioService = inject(UserService);
   private router = inject(Router);
  
  ngOnInit(){
    let USER = localStorage.getItem("user");
      if(!USER){
        this.router.navigateByUrl('/login')
      }
    
  }

  logout(){
    this.usuarioService.logout();
  }
}

