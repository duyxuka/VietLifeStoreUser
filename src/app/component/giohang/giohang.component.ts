import { Component, OnInit } from '@angular/core';
import { CartService } from '../../cart.service';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from '../../auth.service';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-giohang',
  templateUrl: './giohang.component.html',
  styleUrl: './giohang.component.css'
})
export class GiohangComponent implements OnInit {

  cartItems: any[] = [];
  totalPrice = 0;
  mediaBaseUrl = environment.mediaUrl;

  vouchers: any[] = [];
  savedVoucherIds: Set<string> = new Set();
  isLoggedIn = false;

  constructor(private cartService: CartService, private authService: AuthService, private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.isLoggedIn = !!res;
        this.loadVouchers();
      },
      error: () => {
        this.isLoggedIn = false;
        this.loadVouchers();
      }
    });
  }


  loadVouchers(): void {
    this.apiService.getListAllVouchers(1).subscribe({
      next: (res) => {
        this.vouchers = res || [];
        if (this.isLoggedIn) {
          this.loadMyVouchers();
        }
      },
      error: () => this.vouchers = []
    });
  }

  loadMyVouchers(): void {
    this.apiService.getMyVouchers().subscribe({
      next: (res: any[]) => {
        this.savedVoucherIds = new Set(res.map(v => v.id));
      },
      error: () => {
        this.savedVoucherIds = new Set();
      }
    });
  }

  saveVoucher(voucherId: string): void {
    if (!this.isLoggedIn) {
      this.toastr.warning("Bạn cần đăng nhập để lưu voucher")
      return;
    }
    if (this.savedVoucherIds.has(voucherId)) return;

    this.apiService.nhanVoucher(voucherId).subscribe({
      next: () => {
        this.savedVoucherIds.add(voucherId);
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

  isSaved(voucherId: string): boolean {
    return this.savedVoucherIds.has(voucherId);
  }

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  removeItem(id: string, bienTheId: string | null) {
    this.cartService.removeFromCart(id, bienTheId);
  }

  increase(item: any) {
    item.quantity++;
    this.cartService.updateQuantity(item.id, item.bienTheId, item.quantity);
  }

  decrease(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartService.updateQuantity(item.id, item.bienTheId, item.quantity);
    }
  }
}