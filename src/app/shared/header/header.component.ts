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

   private router = inject(Router);
   user: any;
  
  ngOnInit(){
   let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
      if(!this.user){
        this.router.navigateByUrl('/login')
      } 
  }

  
}

