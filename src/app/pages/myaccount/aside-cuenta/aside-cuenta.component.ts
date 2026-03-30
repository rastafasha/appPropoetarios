import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-aside-cuenta',
  imports:[
    CommonModule,
    RouterModule
  ],
  templateUrl: './aside-cuenta.component.html',
  styleUrls: ['./aside-cuenta.component.scss']
})
export class AsideCuentaComponent implements OnInit {

  @Input() isNotvisible:boolean =false;
  public url!:string;
  public identity!: User;

  constructor(
    private usuarioService: UserService,
    
  ) {
    let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }
   }

  ngOnInit(): void {
  }

  slir(){
    this.usuarioService.logout()
  }
}
