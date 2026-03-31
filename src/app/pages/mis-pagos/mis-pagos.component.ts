import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { PaymentService } from '../../services/payment.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
@Component({
  selector: 'app-mis-pagos',
  imports: [CommonModule, HeaderComponent, MenufooterComponent, InfiniteScrollModule],
  templateUrl: './mis-pagos.component.html',
  styleUrl: './mis-pagos.component.scss'
})
export class MisPagosComponent implements OnInit{
  
  payments = signal<any[]>([]);
  loading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  page = 1;
  userId!: string;

  private paymentService = inject(PaymentService);

  ngOnInit() {
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.userId = JSON.parse(USER || '{}').uid;

    this.getPagosUsuario();
  }

  onScroll() {
    // IMPORTANTE: Bloqueo de seguridad para no duplicar peticiones
    if (this.loading() || !this.hasMore()) return;
    
    this.page++;
    this.getPagosUsuario();
  }

  getPagosUsuario() {
    this.loading.set(true);
    
    // PASAMOS LA PÁGINA: Antes no la enviabas al servicio
    this.paymentService.getByUser(this.userId, this.page).subscribe({
      next: (newData: any[]) => {
        if (newData.length === 0) {
          this.hasMore.set(false);
        } else {
          // Filtro de seguridad para evitar duplicados visuales por el track de Angular
          this.payments.update(current => {
            const ids = new Set(current.map(p => p._id));
            const unique = newData.filter(p => !ids.has(p._id));
            return [...current, ...unique];
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
  

}
