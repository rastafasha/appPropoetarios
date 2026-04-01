import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-back-button',
  imports: [],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class BackButtonComponent {
    private location = inject(Location);

    @Input()title!:string;

    irAtras() {
    this.location.back();
  }
}
