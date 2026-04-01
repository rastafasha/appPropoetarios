import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BackButtonComponent } from '../../shared/back-button/back-button.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TasabcvService } from '../../services/tasabcv.service';
import { ToastrService } from 'ngx-toastr';
import { FacturacionService } from '../../services/facturacion.service';


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
  tasa = signal(0);
  loading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;
  userId!:string

  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private tasaBcvService = inject(TasabcvService);
  public toastr = inject(ToastrService);
  private facturaService = inject(FacturacionService); 

  paymentForm: FormGroup = this.fb.group({
    metodo_pago: ['PAGO_MOVIL', Validators.required],
    bank_destino: ['', Validators.required],
    referencia: ['', [Validators.required, Validators.minLength(4)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    
  });

  

  ngOnInit() {
    const USER = localStorage.getItem("user");
    this.userId = JSON.parse(USER || '{}').uid;
    this.getTasadelDia();
    // 1. Obtenemos el ID de la URL
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    
    // 2. Obtenemos los datos extendidos (monto, nroFactura) del historial
    const state = window.history.state;
   if (id) {
        // Si venimos de la lista de facturas, los datos están en el 'state'
        if (state && state.factura) {
            this.factura.set(state.factura);
            this.paymentForm.patchValue({ amount: state.factura.totalPagar });
        } else {
            // RESPALDO: Si el usuario refrescó la página (F5), buscamos la factura por API
            this.facturaService.getFactura(id).subscribe(resp => {
                this.factura.set(resp.factura);
                this.paymentForm.patchValue({ amount: resp.factura.totalPagar });
            });
        }
    }
    
  }

  getTasadelDia(){
    this.tasaBcvService.getUltimaTasa().subscribe((resp:any)=>{
      this.tasa.set(resp.precio_dia);
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
  if (this.paymentForm.invalid || this.loading()) return;

  this.loading.set(true);
  const formData = new FormData();

  // 1. Campos del Formulario
  formData.append('amount', this.paymentForm.get('amount')?.value);
  formData.append('metodo_pago', this.paymentForm.get('metodo_pago')?.value);
  formData.append('bank_destino', this.paymentForm.get('bank_destino')?.value);
  formData.append('referencia', this.paymentForm.get('referencia')?.value);

  // 2. Datos de Contexto (Asegúrate de que tengan valor real)
  // Usamos el ID de la factura del signal o del state
  const facturaId = this.factura()?._id || this.factura();
  if (facturaId) {
    formData.append('factura', facturaId);
  }

  // IMPORTANTE: Estos dos campos te daban error en el backend
  formData.append('cliente', this.userId); // Asegúrate que this.userId no sea null
  formData.append('tasaBCV', this.tasa().toString());

  // 3. Imagen
  if (this.selectedFile) {
    formData.append('img', this.selectedFile);
  }

  this.paymentService.createPayment(formData).subscribe({
    next: (resp) => {
      this.toastr.success('¡Pago reportado con éxito!', 'Completado');
      this.router.navigate(['/mis-pagos']);
    },
    error: (err) => {
      console.error('Error al enviar:', err);
      this.loading.set(false);
      this.toastr.error('Error al procesar el pago. Verifique los datos.', 'Error');
    }
  });
}

}
