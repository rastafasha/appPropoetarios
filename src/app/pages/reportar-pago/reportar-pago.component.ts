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
import { FileUploadService } from '../../services/file-upload.service';
import { TiposdepagoService } from '../../services/tiposdepago.service';
import { PaymentMethod } from '../../models/paymenthmethod.model';
import { Profile } from '../../models/profile';
import { ModalInstruccionesComponent } from '../../components/modal-instrucciones/modal-instrucciones.component';


@Component({
  selector: 'app-reportar-pago',
  imports: [CommonModule, SkeletonLoaderComponent, BackButtonComponent, ReactiveFormsModule,
    ModalInstruccionesComponent
  ],
  templateUrl: './reportar-pago.component.html',
  styleUrl: './reportar-pago.component.scss'
})
export class ReportarPagoComponent {
  isLoading: boolean = false;
  title = 'Volver';

  // Signals
  factura = signal<any>(null); // Viene de la pantalla anterior
  tasa = signal(0);
  loading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;
  userId!: string;
  paymentSelected!: PaymentMethod;
  paymentMethods: PaymentMethod[] = [];
  user!: Profile;

  info = `
  <h2>Sección: Reportar Pago</h2>
  <p><strong>Nota importante:</strong> Actualmente no utilizamos pasarelas de pago directo. Cualquier actualización sobre métodos de pago automatizados será informada oportunamente a través de la <strong>Cartelera</strong> o <strong>Notificaciones</strong>.</p>
  
  <p>Para reportar tu pago con éxito, sigue estas instrucciones:</p>
  <ul>
    <li><strong>Datos de Transferencia:</strong> Al seleccionar tu método de pago preferido, el sistema te mostrará automáticamente los datos bancarios del beneficiario para que realices la operación desde tu banca en línea.</li>
    <li><strong>Registro de Información:</strong> Completa los campos solicitados: Banco de destino y los números o códigos de la <strong>Referencia Bancaria</strong>.</li>
    <li><strong>Monto del Pago:</strong> El monto ya viene predeterminado según la factura que seleccionaste; no es necesario modificarlo.</li>
    <li><strong>Comprobante Digital (Obligatorio):</strong> Es indispensable adjuntar la imagen o captura de pantalla de tu pago. Esto nos permite validar tu reporte de manera mucho más eficiente.</li>
  </ul>`;

  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private paymenttiposService = inject(TiposdepagoService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private tasaBcvService = inject(TasabcvService);
  public toastr = inject(ToastrService);
  private facturaService = inject(FacturacionService);
  private fileUploadService = inject(FileUploadService);

  paymentForm: FormGroup = this.fb.group({
    metodo_pago: ['', Validators.required],
    bank_destino: ['', Validators.required],
    referencia: ['', [Validators.required, Validators.minLength(4)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],

  });



  ngOnInit() {
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.userId = JSON.parse(USER || '{}').uid;
    this.user = JSON.parse(USER || '{}');
    this.getTasadelDia();
    this.getPaymentsMethods();
    // 1. Obtenemos el ID de la URL
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    // 2. Obtenemos los datos extendidos (monto, nroFactura) del historial
    const state = window.history.state;
    if (id === 'deuda-total') {
      // Caso: Viene del Home con el monto acumulado
      if (state && state.factura) {
        this.factura.set(state.factura);
        this.paymentForm.patchValue({ amount: state.factura.totalPagar });
      }
    } else if (id && id !== 'nuevo') {
      // Caso: Viene de una factura específica
      if (state && state.factura) {
        this.factura.set(state.factura);
        this.paymentForm.patchValue({ amount: state.factura.totalPagar });
      } else {
        // Solo llamamos a la API si NO es 'deuda-total'
        this.facturaService.getFactura(id).subscribe(resp => {
          this.factura.set(resp.factura);
          this.paymentForm.patchValue({ amount: resp.factura.totalPagar });
        });
      }
    }
  }

  getPaymentsMethods() {
    this.paymenttiposService.getPaymentsActives().subscribe((resp: any) => {
      this.paymentMethods = resp;
    })
  }

  // metodo para el cambio del select 'tipo de transferencia'
  onChangePayment(event: Event) {
    const target = event.target as HTMLSelectElement; //obtengo el valor

    // guardo el metodo seleccionado en la variable de clase paymentSelected
    this.paymentSelected = this.paymentMethods.filter(method => method._id === target.value)[0]
  }

  getTasadelDia() {
    this.tasaBcvService.getUltimaTasa().subscribe((resp: any) => {
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
    const facturaData = this.factura();
    if (!facturaData || this.loading()) return;

    // Si es un pago de deuda total, el ID será 'DEUDA_TOTAL' o null según prefiera tu backend
    const facturaId = facturaData._id;

    this.loading.set(true);

    this.fileUploadService
      .actualizarFoto(this.selectedFile!, 'payments', facturaData._id)
      .then(imgUrl => {
        const payload = {
          factura: facturaId === 'DEUDA_TOTAL' ? null : facturaId, // Enviamos null si es abono general
          esPagoTotal: facturaId === 'DEUDA_TOTAL', // Flag útil para el backend
          cliente: this.userId,
          amount: this.paymentForm.get('amount')?.value,
          tasaBCV: this.tasa(),
          referencia: this.paymentForm.get('referencia')?.value,
          metodo_pago: this.paymentForm.get('metodo_pago')?.value,
          bank_destino: this.paymentForm.get('bank_destino')?.value,
          img: imgUrl
        };

        this.paymentService.createPayment(payload).subscribe({
          next: () => {
            this.toastr.success('¡Pago reportado con éxito!');
            this.router.navigate(['/mis-pagos']);
          },
          error: () => {
            this.loading.set(false);
            this.toastr.error('Error al registrar el pago');
          }
        });
      })
      .catch(err => {
        this.loading.set(false);
        this.toastr.error('Error al subir el comprobante');
      });
  }


}
