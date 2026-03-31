import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-selector-ubicacion',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './selector-ubicacion.component.html',
  styleUrl: './selector-ubicacion.component.scss'
})
export class SelectorUbicacionComponent{

 @Input() parentForm!: FormGroup;
  @Input() tipoLabel: string = '';
  @Input() formEdif: string = '';
  @Input() formPiso: string = '';
  @Input() formLetra: string = '';
  @Input() listaEdificios: string[] = [];
  @Input() listaPisos: string[] = [];
  @Input() letras: string[] = []; // <--- Importante añadir esta
  @Input() resumen: string = '';

}
