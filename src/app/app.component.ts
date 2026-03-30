import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { CartService } from './cart.service';
import { environment } from './enviroments/enviroment';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { TrackingService } from './core/tracking.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BabyStore';

  isMobileMenuOpen = false;
  isCartOpen = false;
  isInfoOpen = false;
  isProductMenuOpen = false;
  isCamNangMenuOpen = false;

  danhMucsSP: any[] = [];
  danhMucsCN: any[] = [];
  cartItems: any[] = [];
  totalQuantity = 0;
  totalPrice = 0;
  mediaBaseUrl = environment.mediaUrl;
  isBrowser = false;
  currentUserName: string | null = null;

  searchKeyword: string = '';
  searchResults: any[] = [];
  showDropdown = false;
  searchTimeout: any;

  isUserMenuOpen = false;

  constructor(private apiService: ApiService, private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService,
    private router: Router,private trackingService: TrackingService
  ) { }

  ngOnInit(): void {
    this.trackingService.startConnection();
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadCurrentUser();
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
  @HostListener('document:click')
  closeMenu() {
    this.isUserMenuOpen = false;
  }
  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
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
    return fileName ? this.mediaBaseUrl + fileName : '';
  }
  removeItem(id: string, bienTheId: string | null) {
    this.cartService.removeFromCart(id, bienTheId);
  }
  logout() {
    this.authService.logout();
    this.currentUserName = null; // nếu bạn đang hiển thị tên user
    this.router.navigate(['/dangnhap']);
  }
  onSearchChange() {
    clearTimeout(this.searchTimeout);

    if (!this.searchKeyword || this.searchKeyword.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.apiService.getListFilterSanPham({
        keyword: this.searchKeyword,
        skipCount: 0,
        maxResultCount: 5
      }).subscribe(res => {
        this.searchResults = res.items || [];
      });
    }, 400); // debounce 400ms
  }
  goToProduct() {
    this.showDropdown = false;
    this.searchKeyword = '';
    this.searchResults = [];
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  toggleInfo() {
    this.isInfoOpen = !this.isInfoOpen;
  }

  toggleProductMenu() {
    this.isProductMenuOpen = !this.isProductMenuOpen;
  }

  toggleCamNangMenu() {
    this.isCamNangMenuOpen = !this.isCamNangMenuOpen;
  }

  closeAllMenus() {
    this.isMobileMenuOpen = false;
    this.isCartOpen = false;
    this.isInfoOpen = false;
  }

  loadCurrentUser() {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.authService.getProfile().subscribe(res => {
      this.currentUserName = res?.name || null;
    });
  }
}
