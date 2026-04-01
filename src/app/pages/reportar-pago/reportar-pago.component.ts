import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BackButtonComponent } from '../../shared/back-button/back-button.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TasabcvService } from '../../services/tasabcv.service';


@Component({
  selector: 'app-reportar-pago',
  imports: [CommonModule, SkeletonLoaderComponent, BackButtonComponent,ReactiveFormsModule],
  templateUrl: './reportar-pago.component.html',
  styleUrl: './reportar-pago.component.scss'
})
export class ReportarPagoComponent {
  isLoading: boolean = false;
  title= 'Volver';

  // Signals
  factura = signal<any>(null); // Viene de la pantalla anterior
  tasa !:number;
  loading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private tasaBcvService = inject(TasabcvService);

  paymentForm: FormGroup = this.fb.group({
    metodo_pago: ['PAGO_MOVIL', Validators.required],
    bank_destino: ['', Validators.required],
    referencia: ['', [Validators.required, Validators.minLength(4)]],
    amount: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    // 1. Obtenemos el ID de la URL
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    
    // 2. Obtenemos los datos extendidos (monto, nroFactura) del historial
    const state = window.history.state;
   if (id) {
      // Guardamos el ID en nuestra señal de factura
      // Si el state existe, guardamos todo el objeto, si no, solo el ID
      this.factura.set(state.factura || { _id: id });

      // 3. Auto-completamos el monto si viene en el state
      if (state.factura && state.factura.totalPagar) {
        this.paymentForm.patchValue({ 
          amount: state.factura.totalPagar 
        });
      }
    }
    this.getTasadelDia();
  }

  getTasadelDia(){
    this.tasaBcvService.getUltimaTasa().subscribe((resp:any)=>{
      this.tasa = resp.precio_dia;
    })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  enviarPago() {
    this.loading.set(true);
    
    // IMPORTANTE: Para subir archivos se usa FormData
    const formData = new FormData();
    formData.append('amount', this.paymentForm.value.amount);
    formData.append('metodo_pago', this.paymentForm.value.metodo_pago);
    formData.append('referencia', this.paymentForm.value.referencia);
    formData.append('factura', this.factura()?._id);
    formData.append('tasaBCV', this.tasa.toString());
    if (this.selectedFile) formData.append('img', this.selectedFile);

    this.paymentService.createPayment(formData).subscribe({
      next: () => {
        // Redirigir a "Mis Pagos" con éxito
        this.router.navigate(['/mis-pagos'], { queryParams: { success: true } });
      },
      error: () => this.loading.set(false)
    });
  }

}
