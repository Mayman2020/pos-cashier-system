import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ShiftService } from '../../../core/services/shift.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CustomerService } from '../../../core/services/customer.service';
import { TableService } from '../../../core/services/table.service';
import { ModifierService } from '../../../core/services/modifier.service';
import { ReceiptService } from '../../../core/services/receipt.service';
import { DiscountService } from '../../../core/services/discount.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductVariantService } from '../../../core/services/product-variant.service';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { Discount } from '../../../core/models/discount.model';
import {
  CreateOrderRequest,
  OrderItemRequest,
  OrderType,
  PaymentMethod,
  PosOrder,
  UpdateOrderRequest,
} from '../../../core/models/order.model';
import { SelectedModifier } from '../../../core/models/modifier.model';
import { Customer } from '../../../core/models/customer.model';
import { RestaurantTable } from '../../../core/models/table.model';
import { Shift } from '../../../core/models/shift.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModifierDialogComponent } from '../modifier-dialog/modifier-dialog.component';
import { VariantPickerDialogComponent } from '../variant-picker-dialog/variant-picker-dialog.component';
import { CloseShiftDialogComponent } from '../../shifts/close-shift-dialog/close-shift-dialog.component';
import { ReceiptDialogComponent } from '../receipt-dialog/receipt-dialog.component';
import { ProductVariant } from '../../../core/models/product-variant.model';
import { PosCartLine } from '../../../shared/pos/pos-cart.model';
import { PosProductCardComponent } from '../../../shared/pos/product-card/product-card.component';
import { PosCategoryTabsComponent } from '../../../shared/pos/category-tabs/category-tabs.component';
import { PosCartPanelComponent } from '../../../shared/pos/cart-panel/cart-panel.component';
import { PosQuickActionsBarComponent } from '../../../shared/pos/quick-actions-bar/quick-actions-bar.component';
import { PosNumericKeypadComponent } from '../../../shared/pos/numeric-keypad/numeric-keypad.component';
import { PosCheckoutModalComponent } from '../../../shared/pos/checkout-modal/checkout-modal.component';

type CartLine = PosCartLine;

@Component({
  selector: 'app-pos-cashier',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, FormsModule, TranslateModule,
    MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    LoadingSpinnerComponent,
    PosProductCardComponent, PosCategoryTabsComponent, PosCartPanelComponent,
    PosQuickActionsBarComponent, PosNumericKeypadComponent, PosCheckoutModalComponent,
  ],
  templateUrl: './pos-cashier.component.html',
  styleUrl: './pos-cashier.component.scss',
})
export class PosCashierComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  loading = true;
  processing = false;
  gridView = true;
  mobileView: 'products' | 'cart' = 'products';
  keypadValue = 0;
  categories: Category[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  tables: RestaurantTable[] = [];
  discounts: Discount[] = [];
  selectedCategoryId: number | null = null;
  search = '';
  cart: CartLine[] = [];
  currentOrder: PosOrder | null = null;
  heldOrders: PosOrder[] = [];
  paymentMethod: PaymentMethod = 'CASH';
  showPayment = false;
  cashAmount = 0;
  cardAmount = 0;
  amountTendered = 0;
  orderDiscount = 0;
  selectedDiscountCode: string | null = null;
  manualDiscount = false;
  orderType: OrderType = 'RETAIL';
  customerId: number | null = null;
  tableId: number | null = null;
  openShift: Shift | null = null;
  showShiftPanel = false;
  openingCash = 200;
  restaurantMode = false;
  supermarketMode = true;
  taxInclusive = false;
  allowManualDiscount = true;
  stockMap = new Map<number, number>();
  loyaltyRedeem = 0;
  orderNote = '';
  keypadTarget: 'discount' | 'payment' = 'discount';
  private pendingResumeId: number | null = null;
  private branchSub?: Subscription;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly shiftService: ShiftService,
    private readonly settingsService: SettingsService,
    private readonly customerService: CustomerService,
    private readonly tableService: TableService,
    private readonly modifierService: ModifierService,
    private readonly receiptService: ReceiptService,
    private readonly discountService: DiscountService,
    private readonly branchContext: BranchContextService,
    private readonly inventoryService: InventoryService,
    private readonly variantService: ProductVariantService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadShift();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => {
      this.loadShift();
      this.loadProducts();
      this.tableService.list(this.branchId).subscribe({ next: (t) => (this.tables = t) });
      this.loadHeldOrders();
    });
    this.route.queryParams.subscribe((params) => {
      const resumeId = Number(params['resume']);
      if (resumeId) {
        this.pendingResumeId = resumeId;
        this.tryResumePending();
      }
    });
    this.settingsService.getPos().subscribe({
      next: (s) => {
        this.restaurantMode = s.settings?.['restaurant_mode'] === 'true';
        this.supermarketMode = s.settings?.['supermarket_mode'] === 'true';
        this.taxInclusive = s.settings?.['tax_inclusive'] === 'true';
        this.allowManualDiscount = s.settings?.['allow_manual_discount'] !== 'false';
        if (this.restaurantMode && !this.supermarketMode) {
          this.orderType = 'DINE_IN';
        }
      },
    });
    this.discountService.list().subscribe({
      next: (rows) => (this.discounts = rows.filter((d) => d.active !== false)),
    });
    this.categoryService.list(0, 100).subscribe({
      next: (page) => {
        this.categories = page.content.filter((c) => c.active !== false);
        this.loadProducts();
      },
      error: () => (this.loading = false),
    });
    this.customerService.list(0, 100).subscribe({ next: (p) => (this.customers = p.content) });
    this.tableService.list(this.branchId).subscribe({ next: (t) => (this.tables = t) });
    this.loadHeldOrders();
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  lineUnitPrice(line: CartLine): number {
    const base = Number(line.variant?.sellingPrice ?? line.product.sellingPrice);
    const modAdj = line.modifiers.reduce((m, x) => m + Number(x.priceAdjustment), 0);
    return base + modAdj;
  }

  get branchId(): number {
    return this.branchContext.getBranchId();
  }

  get selectedCustomer(): Customer | null {
    if (!this.customerId) return null;
    return this.customers.find((c) => c.id === this.customerId) ?? null;
  }

  onCustomerChange(): void {
    this.loyaltyRedeem = 0;
  }

  stockFor(productId: number): number | null {
    return this.stockMap.has(productId) ? this.stockMap.get(productId)! : null;
  }

  isOutOfStock(product: Product): boolean {
    if (product.trackStock === false) return false;
    const qty = this.stockFor(product.id);
    return qty !== null && qty <= 0;
  }

  cartQtyForProduct(productId: number): number {
    return this.cart
      .filter((l) => l.product.id === productId)
      .reduce((sum, l) => sum + l.quantity, 0);
  }

  wouldExceedStock(product: Product, extraQty = 1, line?: CartLine, newLineQty?: number): boolean {
    if (product.trackStock === false) return false;
    const available = this.stockFor(product.id);
    if (available === null) return false;
    let needed = this.cartQtyForProduct(product.id);
    if (line != null && newLineQty != null) {
      needed = needed - line.quantity + newLineQty;
    } else {
      needed += extraQty;
    }
    return needed > available;
  }

  get filteredProducts(): Product[] {
    let list = this.products.filter((p) => p.active !== false);
    if (this.selectedCategoryId != null) {
      list = list.filter((p) => p.categoryId === this.selectedCategoryId);
    }
    const q = this.search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  get cartCount(): number {
    return this.cart.reduce((sum, line) => sum + line.quantity, 0);
  }

  get cartSubtotal(): number {
    return this.cart.reduce((sum, line) => sum + line.quantity * this.lineUnitPrice(line), 0);
  }

  get previewTax(): number {
    if (this.currentOrder?.taxAmount != null) {
      return Number(this.currentOrder.taxAmount);
    }
    const subtotal = this.cartSubtotal;
    const discount = this.orderDiscount;
    const net = Math.max(0, subtotal - discount);
    let tax = this.cart.reduce((sum, line) => {
      const lineSub = line.quantity * this.lineUnitPrice(line);
      const rate = Number(line.product.taxRate ?? 0);
      if (rate <= 0) return sum;
      if (this.taxInclusive) {
        return sum + (lineSub - lineSub / (1 + rate / 100));
      }
      return sum + (lineSub * rate) / 100;
    }, 0);
    if (subtotal > 0 && discount > 0) {
      tax = Math.round(tax * (net / subtotal) * 100) / 100;
    }
    return tax;
  }

  get displaySubtotal(): number {
    return Number(this.currentOrder?.subtotal ?? this.cartSubtotal);
  }

  get displayTax(): number {
    return this.previewTax;
  }

  get displayDiscount(): number {
    return Number(this.currentOrder?.discountAmount ?? this.orderDiscount);
  }

  get displayTotal(): number {
    if (this.currentOrder?.totalAmount != null) {
      return Number(this.currentOrder.totalAmount);
    }
    const net = Math.max(0, this.cartSubtotal - this.orderDiscount);
    return this.taxInclusive ? net : net + this.previewTax;
  }

  get canManageProducts(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  get canManageCustomers(): boolean {
    return true;
  }

  get changeDue(): number {
    if (this.paymentMethod !== 'CASH') return 0;
    return Math.max(0, this.amountTendered - this.displayTotal);
  }

  get posBlocked(): boolean {
    return !this.openShift;
  }

  get showKitchenBadge(): boolean {
    return this.restaurantMode && !!this.currentOrder?.kitchenStatus;
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = id;
  }

  tableLabel(t: RestaurantTable): string {
    return `${t.tableNumber} (${this.i18n.instant(`TABLES.${t.status}`)})`;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    const code = this.search.trim();
    if (!code) return;
    const exact = this.products.find((p) => p.barcode === code || p.sku === code);
    if (exact) {
      this.promptAddToCart(exact);
      this.search = '';
    }
  }

  onDiscountCodeChange(code: string | null): void {
    this.selectedDiscountCode = code;
    this.manualDiscount = !code;
    if (!code) {
      this.orderDiscount = 0;
    } else {
      this.applyCatalogDiscount(code);
    }
    this.currentOrder = null;
  }

  onManualDiscountChange(value?: number): void {
    if (value != null) this.orderDiscount = value;
    this.selectedDiscountCode = null;
    this.manualDiscount = true;
    this.currentOrder = null;
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }
    if (this.dialog.openDialogs.length > 0 && !this.showPayment) {
      return;
    }
    if (event.key === 'F9') {
      event.preventDefault();
      if (this.showPayment) {
        this.confirmPayment();
      } else {
        this.checkout();
      }
    } else if (event.key === 'F8' && !this.showPayment) {
      event.preventDefault();
      this.holdOrder();
    } else if (event.key === 'F4') {
      event.preventDefault();
      this.openCashDrawer();
    } else if (event.key === 'F11') {
      event.preventDefault();
      this.toggleFullscreen();
    }
  }

  focusSearch(): void {
    this.searchInput?.nativeElement.focus();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  }

  openCashDrawer(): void {
    this.snack.success(this.i18n.instant('POS.DRAWER_OPENED'));
  }

  goNewCustomer(): void {
    this.router.navigate(['/admin/customers']);
  }

  goNewProduct(): void {
    this.router.navigate(['/admin/products']);
  }

  goRefund(): void {
    this.router.navigate(['/admin/orders']);
  }

  onKeypadChange(value: number): void {
    this.keypadValue = value;
    if (this.showPayment || this.keypadTarget === 'payment') {
      this.amountTendered = value;
    } else if (this.allowManualDiscount) {
      this.onManualDiscountChange(value);
    }
  }

  onKeypadEnter(): void {
    if (this.showPayment) {
      this.confirmPayment();
    } else {
      this.checkout();
    }
  }

  get userName(): string {
    const u = this.auth.getCurrentUser();
    return u?.fullName || u?.username || '';
  }

  get roleKey(): string {
    const role = this.auth.getRole();
    return role ? `ROLE.${role}` : '';
  }

  addProductClick(product: Product): void {
    this.promptAddToCart(product);
  }

  changeQty(line: CartLine, delta: number): void {
    const nextQty = line.quantity + delta;
    if (delta > 0 && this.wouldExceedStock(line.product, 0, line, nextQty)) {
      this.snack.error(this.i18n.instant('POS.OUT_OF_STOCK'));
      return;
    }
    line.quantity += delta;
    if (line.quantity <= 0) {
      this.cart = this.cart.filter((l) => l !== line);
    }
    this.recalculateCatalogDiscount();
    this.currentOrder = null;
  }

  clearCart(): void {
    this.cart = [];
    this.currentOrder = null;
    this.orderDiscount = 0;
    this.selectedDiscountCode = null;
    this.manualDiscount = false;
    this.orderNote = '';
    this.customerId = null;
    this.tableId = null;
  }

  checkout(): void {
    if (!this.cart.length || this.posBlocked) return;
    this.syncOrder().subscribe({
      next: (order) => {
        this.currentOrder = order;
        this.amountTendered = this.displayTotal;
        this.keypadTarget = 'payment';
        this.keypadValue = this.displayTotal;
        if (this.paymentMethod === 'MIXED') {
          this.cashAmount = Math.round((this.displayTotal / 2) * 100) / 100;
          this.cardAmount = this.displayTotal - this.cashAmount;
        }
        this.showPayment = true;
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  confirmPayment(): void {
    if (!this.currentOrder?.id) return;
    const total = this.displayTotal;
    let payAmount = total;
    let cash: number | undefined;
    let card: number | undefined;

    if (this.paymentMethod === 'MIXED') {
      cash = this.cashAmount;
      card = this.cardAmount;
      payAmount = cash + card;
      if (Math.abs(payAmount - total) > 0.01) {
        this.snack.error(this.i18n.instant('POS.MIXED_MISMATCH'));
        return;
      }
    } else if (this.paymentMethod === 'CASH') {
      if (this.amountTendered < total) {
        this.snack.error(this.i18n.instant('POS.INSUFFICIENT_CASH'));
        return;
      }
    }

    this.processing = true;
    this.orderService
      .pay(this.currentOrder.id, {
        paymentMethod: this.paymentMethod,
        amount: payAmount,
        cashAmount: cash,
        cardAmount: card,
      })
      .subscribe({
        next: (order) => {
          this.processing = false;
          this.showPayment = false;
          this.keypadTarget = 'discount';
          this.receiptService.get(order.id).subscribe({
            next: (receipt) => {
              this.dialog.open(ReceiptDialogComponent, {
                panelClass: 'app-dialog-panel',
                width: '480px',
                data: receipt,
              });
            },
          });
          this.snack.success(this.i18n.instant('POS.PAYMENT_SUCCESS'));
          this.clearCart();
          this.loadHeldOrders();
        },
        error: (e: Error) => {
          this.processing = false;
          this.snack.errorFrom(e);
        },
      });
  }

  holdOrder(): void {
    if (!this.cart.length || this.posBlocked) return;
    this.syncOrder().pipe(switchMap((order) => this.orderService.hold(order.id))).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('POS.HELD'));
        this.clearCart();
        this.loadHeldOrders();
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  resumeOrder(order: PosOrder): void {
    this.orderService.resume(order.id).subscribe({
      next: (o) => {
        this.currentOrder = o;
        this.orderDiscount = Number(o.discountAmount ?? 0);
        this.orderType = o.orderType ?? 'RETAIL';
        this.customerId = o.customerId ?? null;
        this.tableId = o.tableId ?? null;
        this.cart = (o.items ?? []).map((item) => ({
          product: this.products.find((p) => p.id === item.productId) ?? {
            id: item.productId,
            sku: '',
            name: item.productName || `#${item.productId}`,
            costPrice: 0,
            sellingPrice: item.unitPrice ?? 0,
          },
          variantId: item.variantId,
          quantity: Number(item.quantity),
          discountAmount: Number(item.discountAmount ?? 0),
          notes: item.notes,
          modifiers: [],
          modifiersJson: item.modifiersJson,
        }));
        this.loadHeldOrders();
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  cancelOrder(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog-panel',
      data: {
        title: 'POS.CANCEL_TITLE',
        message: 'POS.CANCEL_MSG',
        danger: true,
        confirmLabel: 'ACTIONS.CONFIRM',
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (!ok) return;
      if (this.currentOrder?.id) {
        this.orderService.cancel(this.currentOrder.id).subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('POS.CANCELLED'));
            this.clearCart();
            this.loadHeldOrders();
          },
          error: (e: Error) => this.snack.errorFrom(e),
        });
      } else {
        this.clearCart();
      }
    });
  }

  openShiftNow(): void {
    this.shiftService.open({ branchId: this.branchId, openingCash: this.openingCash }).subscribe({
      next: (shift) => {
        this.openShift = shift;
        this.showShiftPanel = false;
        this.snack.success(this.i18n.instant('SHIFTS.OPENED_MSG'));
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  closeShiftNow(): void {
    if (!this.openShift) return;
    this.shiftService.getById(this.openShift.id).subscribe({
      next: (fresh) => {
        const ref = this.dialog.open(CloseShiftDialogComponent, {
          panelClass: 'app-dialog-panel',
          width: '760px',
          data: { shift: fresh },
        });
        ref.afterClosed().subscribe((result) => {
          if (!result) return;
          this.shiftService.close(fresh.id, result).subscribe({
            next: () => {
              this.openShift = null;
              this.showShiftPanel = true;
              this.snack.success(this.i18n.instant('SHIFTS.CLOSED'));
            },
            error: (e: Error) => this.snack.errorFrom(e),
          });
        });
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  fmtMoney(v: number): string {
    return this.i18n.formatCurrency(v);
  }

  modifierLabel(line: CartLine): string {
    return line.modifiers.map((m) => m.name).join(', ');
  }

  orderTypeLabel(type?: string): string {
    if (!type) return '';
    return this.i18n.instant(`POS.TYPE_${type}`);
  }

  readonly Number = Number;

  private loadShift(): void {
    this.shiftService.getCurrentOpen().subscribe({
      next: (shift) => {
        this.openShift = shift;
        this.showShiftPanel = !shift;
      },
    });
  }

  private loadProducts(): void {
    this.productService.list(0, 500).subscribe({
      next: (page) => {
        this.products = page.content;
        this.products.filter((p) => p.trackStock !== false).forEach((p) => {
          this.inventoryService.availability(this.branchId, p.id).subscribe({
            next: (a) => this.stockMap.set(p.id, a.available),
          });
        });
        this.loading = false;
        this.tryResumePending();
      },
      error: () => (this.loading = false),
    });
  }

  private promptAddToCart(product: Product): void {
    if (this.posBlocked) {
      this.snack.error(this.i18n.instant('POS.SHIFT_REQUIRED'));
      return;
    }
    if (this.isOutOfStock(product)) {
      this.snack.error(this.i18n.instant('POS.OUT_OF_STOCK'));
      return;
    }
    if (this.wouldExceedStock(product, 1)) {
      this.snack.error(this.i18n.instant('POS.INSUFFICIENT_STOCK'));
      return;
    }
    this.variantService.list(product.id).subscribe({
      next: (variants) => {
        const active = variants.filter((v) => v.active !== false);
        if (active.length) {
          this.dialog
            .open(VariantPickerDialogComponent, {
              panelClass: 'app-dialog-panel',
              width: '400px',
              data: { productName: product.name, variants: active },
            })
            .afterClosed()
            .subscribe((variant: ProductVariant | undefined) => {
              if (!variant) return;
              this.continueAddToCart(product, variant);
            });
          return;
        }
        this.continueAddToCart(product);
      },
      error: () => this.continueAddToCart(product),
    });
  }

  private continueAddToCart(product: Product, variant?: ProductVariant): void {
    this.modifierService.list(product.id).subscribe({
      next: (modifiers) => {
        const active = modifiers.filter((m) => m.active !== false);
        if (!active.length) {
          this.addToCart(product, [], variant);
          return;
        }
        this.dialog
          .open(ModifierDialogComponent, {
            panelClass: 'app-dialog-panel',
            width: '420px',
            data: { productName: product.name, modifiers: active },
          })
          .afterClosed()
          .subscribe((picked: SelectedModifier[] | undefined) => {
            if (picked === undefined) return;
            this.addToCart(product, picked, variant);
          });
      },
      error: () => this.addToCart(product, [], variant),
    });
  }

  private addToCart(product: Product, modifiers: SelectedModifier[], variant?: ProductVariant): void {
    const variantKey = variant ? `v${variant.id}` : '';
    const key = `${product.id}-${variantKey}-${modifiers.map((m) => m.id).join(',')}`;
    const existing = this.cart.find(
      (l) => `${l.product.id}-${l.variantId ? `v${l.variantId}` : ''}-${l.modifiers.map((m) => m.id).join(',')}` === key
    );
    if (existing) {
      if (this.wouldExceedStock(product, 0, existing, existing.quantity + 1)) {
        this.snack.error(this.i18n.instant('POS.INSUFFICIENT_STOCK'));
        return;
      }
      existing.quantity += 1;
    } else {
      this.cart.push({
        product,
        variantId: variant?.id,
        variant,
        quantity: 1,
        modifiers,
        modifiersJson: modifiers.length ? JSON.stringify(modifiers) : undefined,
      });
    }
    this.recalculateCatalogDiscount();
    this.currentOrder = null;
  }

  private buildItems(): OrderItemRequest[] {
    return this.cart.map((l) => ({
      productId: l.product.id,
      variantId: l.variantId,
      quantity: l.quantity,
      discountAmount: l.discountAmount,
      notes: l.notes,
      modifiersJson: l.modifiersJson,
    }));
  }

  private syncOrder(): Observable<PosOrder> {
    const payload: UpdateOrderRequest = {
      customerId: this.customerId ?? undefined,
      tableId: this.orderType === 'DINE_IN' ? this.tableId ?? undefined : undefined,
      orderType: this.orderType,
      discountAmount: this.manualDiscount ? this.orderDiscount || undefined : undefined,
      discountCode: this.selectedDiscountCode ?? undefined,
      loyaltyPointsRedeemed: this.loyaltyRedeem || undefined,
      notes: this.orderNote || undefined,
      orderNotes: this.orderNote.trim()
        ? [{ note: this.orderNote.trim() }]
        : undefined,
      items: this.buildItems(),
    };
    if (this.currentOrder?.id) {
      return this.orderService.update(this.currentOrder.id, payload);
    }
    const createPayload: CreateOrderRequest = { branchId: this.branchId, ...payload };
    return this.orderService.create(createPayload);
  }

  private tryResumePending(): void {
    if (!this.pendingResumeId || !this.products.length) return;
    const id = this.pendingResumeId;
    this.pendingResumeId = null;
    this.orderService.getById(id).subscribe({
      next: (o) => this.resumeOrder(o),
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  private loadHeldOrders(): void {
    this.orderService.list(0, 20, this.branchId, 'HELD').subscribe({
      next: (page) => (this.heldOrders = page.content),
    });
  }

  private applyCatalogDiscount(code: string): void {
    const d = this.discounts.find((x) => x.code === code);
    if (!d) return;
    if (d.discountType === 'PERCENT') {
      this.orderDiscount = Math.round(((this.cartSubtotal * d.value) / 100) * 100) / 100;
    } else {
      this.orderDiscount = Math.min(d.value, this.cartSubtotal);
    }
  }

  private recalculateCatalogDiscount(): void {
    if (this.selectedDiscountCode) {
      this.applyCatalogDiscount(this.selectedDiscountCode);
    }
  }
}
