import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { CartService } from './cart.service';
import { environment } from './enviroments/enviroment';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BabyStore';
  danhMucsSP: any[] = [];
  danhMucsCN: any[] = [];
  cartItems: any[] = [];
  totalQuantity = 0;
  totalPrice = 0;
  mediaBaseUrl = environment.mediaUrl;
  isBrowser = false;
  currentUserName: string | null = null;

  constructor(private apiService: ApiService, private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.getCurrentUserFromToken();
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
        this.totalQuantity = items.length;
        this.totalPrice = items.reduce(
          (sum, item) =>
            sum +
            (item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia) *
            item.quantity,
          0
        );
      });
    }

    this.loadDanhMucSP();
    this.loadDanhMucCamNang();
  }
  loadDanhMucSP(): void {
    this.apiService.getDanhMucSPListAll().subscribe(res => {
      this.danhMucsSP = res || [];
    });
  }
  loadDanhMucCamNang(): void {
    this.apiService.getDanhMucCamNangListAll().subscribe(res => {
      this.danhMucsCN = res || [];
    });
  }
  getImageUrl(fileName: string): string {
    return fileName
      ? this.mediaBaseUrl + fileName
      : 'assets/img/no-image.png';
  }
  removeItem(id: string, bienTheId: string | null) {
    this.cartService.removeFromCart(id, bienTheId);
  }
  getCurrentUserFromToken() {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));

    // ưu tiên given_name, nếu không có thì lấy username
    this.currentUserName =
      payload.given_name || payload.preferred_username || null;
  }
  logout() {
    this.authService.logout();
    this.currentUserName = null; // nếu bạn đang hiển thị tên user
    this.router.navigate(['/dangnhap']);
  }
}
