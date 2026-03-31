import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;
  @Input() columns = 5;
  @Input() template = '';

  get rowArray(): number[] {
    return Array(this.rows).fill(0).map((x, i) => i);
  }

  get columnArray(): number[] {
    return Array(this.columns).fill(0).map((x, i) => i);
  }

  getColumnWidth(index: number): string {
    if (!this.template) {
      return '1';
    }
    const templateArray = this.template.padEnd(this.columns, '1').split('');
    return templateArray[index] || '1';
  }
}
