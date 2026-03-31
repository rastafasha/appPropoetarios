import { Component, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';


@Component({
  selector: 'app-menufooter',
  imports: [ RouterModule, RouterLinkActive],
  templateUrl: './menufooter.component.html',
  styleUrl: './menufooter.component.css'
})
export class MenufooterComponent {

  identity!:User;
    isLoading= false;
  
    private usuarioService = inject(UserService);
    private router = inject(Router);
    
    ngOnInit(){
       setTimeout(() => {
      }, 500);
      this.loadIdentity();
    }
  
    loadIdentity(){
      let USER = localStorage.getItem("user");
      if(!USER){
        this.router.navigateByUrl('/login')
      }
      if(USER){
        let user = JSON.parse(USER);
        this.usuarioService.getUserById(user.uid).subscribe((resp:any)=>{
          this.identity = resp.usuario;
        })
      }
    }

}
