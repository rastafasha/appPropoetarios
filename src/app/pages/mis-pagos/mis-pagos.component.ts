import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';

@Component({
  selector: 'app-mis-pagos',
  imports: [CommonModule, HeaderComponent, MenufooterComponent],
  templateUrl: './mis-pagos.component.html',
  styleUrl: './mis-pagos.component.scss'
})
export class MisPagosComponent {

}
