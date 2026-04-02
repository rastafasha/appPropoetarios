import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConectividadService } from './services/conectividad.service';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'appPropietarios';
  private swPush = inject(SwPush);
  private router = inject(Router);
  private connectivity = inject(ConectividadService);

 ngOnInit() {
  // 1. Escuchar el CLICK en la notificación
  this.swPush.notificationClicks.subscribe(({ notification }) => {
    console.log('Notificación clickeada:', notification);

    // Extraemos la URL del objeto 'data' que viene de Node.js
    const targetUrl = notification.data?.url;

    // Ejecutamos la navegación AQUÍ ADENTRO, donde la variable existe
    if (targetUrl) {
      this.router.navigateByUrl(targetUrl);
    } else {
      this.router.navigate(['/home']);
    }
  });

  // 2. Escuchar cuando llega una notificación con la APP ABIERTA
  this.swPush.messages.subscribe(msg => {
    console.log('Mensaje recibido con la app abierta:', msg);
  });

  
}


}
