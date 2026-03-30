
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {

  tiendaNameSelected!:string;


  ngOnInit(){
   
  }

  ngOnDestroy() {
   
  }
}
