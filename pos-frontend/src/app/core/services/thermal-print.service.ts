import { Injectable } from '@angular/core';
import { Receipt } from '../models/receipt.model';

export interface ThermalReceiptLabels {
  title: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  thankYou: string;
  paymentLabel: (method: string) => string;
}

@Injectable({ providedIn: 'root' })
export class ThermalPrintService {
  printReceipt(
    receipt: Receipt,
    formatMoney: (v?: number) => string,
    labels: ThermalReceiptLabels
  ): void {
    const html = this.buildHtml(receipt, formatMoney, labels);
    const win = window.open('', '_blank', 'width=400,height=700');
    if (!win) {
      window.print();
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.onload = () => {
      win.print();
      win.onafterprint = () => win.close();
    };
  }

  private buildHtml(receipt: Receipt, fmt: (v?: number) => string, labels: ThermalReceiptLabels): string {
    const items = (receipt.order.items ?? [])
      .map(
        (item) =>
          `<tr><td>${this.escape(item.productName ?? '')} × ${item.quantity ?? 0}</td><td class="r">${fmt(item.lineTotal)}</td></tr>`
      )
      .join('');
    const payments = (receipt.payments ?? [])
      .map((p) => `<tr><td>${this.escape(labels.paymentLabel(p.paymentMethod))}</td><td class="r">${fmt(p.amount)}</td></tr>`)
      .join('');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${this.escape(labels.title)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: 72mm; margin: 0 auto; color: #000; }
  h1 { font-size: 14px; text-align: center; margin: 0 0 8px; }
  .meta { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; vertical-align: top; }
  .r { text-align: right; white-space: nowrap; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  .total td { font-weight: bold; font-size: 13px; padding-top: 4px; }
</style></head><body>
  <h1>${this.escape(labels.title)}</h1>
  <div class="meta">${this.escape(receipt.receiptNumber)}</div>
  <div class="meta">#${this.escape(receipt.order.orderNumber ?? '')}</div>
  <div class="meta">${this.escape(receipt.printedAt ?? '')}</div>
  <hr />
  <table>${items}</table>
  <hr />
  <table>
    <tr><td>${this.escape(labels.subtotal)}</td><td class="r">${fmt(receipt.order.subtotal)}</td></tr>
    <tr><td>${this.escape(labels.tax)}</td><td class="r">${fmt(receipt.order.taxAmount)}</td></tr>
    <tr><td>${this.escape(labels.discount)}</td><td class="r">-${fmt(receipt.order.discountAmount)}</td></tr>
    <tr class="total"><td>${this.escape(labels.total)}</td><td class="r">${fmt(receipt.order.totalAmount)}</td></tr>
  </table>
  <hr />
  <table>${payments}</table>
  <div style="text-align:center;margin-top:12px;">${this.escape(labels.thankYou)}</div>
</body></html>`;
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
