import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConectividadService } from './services/conectividad.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'appPropietarios';
  constructor(private connectivity: ConectividadService) {
  }
}
