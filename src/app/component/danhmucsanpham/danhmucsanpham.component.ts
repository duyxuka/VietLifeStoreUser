import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-danhmucsanpham',
  templateUrl: './danhmucsanpham.component.html',
  styleUrls: ['./danhmucsanpham.component.css']
})
export class DanhmucsanphamComponent implements OnInit {

  products: any[] = [];
  categories: any[] = [];

  total = 0;
  page = 1;
  pageSize = 12;
  totalPages = 0;

  keyword = '';
  sort = 'newest';

  // Không dùng null
  slug?: string;
  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;
  vouchers: any[] = [];
  savedVoucherIds: Set<string> = new Set();
  isLoggedIn = false;
  danhMucId: string | null = null;
  bannerUrl: string = 'assets/img/bg/breadcrumb_bg_01.jpg';
  currentCategoryName: string = 'Danh mục sản phẩm';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private cartService: CartService,
  ) { }

  // ================= INIT =================
  ngOnInit(): void {
    // Bước 1 — Load categories trước
    this.apiService.getDanhMucSPListAll().subscribe(res => {
      this.categories = res || [];

      // Bước 2 — Sau khi có categories, theo dõi route
      this.route.params.subscribe(params => {
        this.slug = params['slug'];
        this.page = 1;
        this.loadData();

        // Bước 3 — Tìm danhMucId từ slug
        if (this.slug) {
          const dm = this.categories.find(c => c.slug === this.slug);
          this.danhMucId = dm?.id || null;
          this.bannerUrl = dm?.anhBanner
            ? this.mediaBaseUrl + dm.anhBanner
            : 'assets/img/bg/breadcrumb_bg_01.jpg';
          this.currentCategoryName = dm?.ten || 'Danh mục sản phẩm';
        } else {
          this.danhMucId = null;
          this.bannerUrl = 'assets/img/bg/breadcrumb_bg_01.jpg';
        }

        // Bước 4 — Load profile rồi mới load voucher
        this.authService.getProfile().subscribe({
          next: (profile) => {
            this.isLoggedIn = !!profile;
            this.loadVouchers();
          },
          error: () => {
            this.isLoggedIn = false;
            this.loadVouchers();
          }
        });
      });
    });
  }

  loadVouchers(): void {
    const obs = this.danhMucId
      ? this.apiService.getVouchersByDanhMuc(this.danhMucId)
      : this.apiService.getListAllVouchers(1); // truyền phamVi=1 khi không có danh mục

    obs.subscribe({
      next: (res) => {
        this.vouchers = res || [];
        if (this.isLoggedIn) this.loadMyVouchers();
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

  // ================= LOAD SẢN PHẨM =================
  loadData(): void {
    this.apiService.getListFilterSanPham({
      keyword: this.keyword || undefined,
      sort: this.sort,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      danhMucSlug: this.slug   // undefined nếu không chọn
    }).subscribe(res => {
      this.products = res.items;
      this.total = res.totalCount;
      this.totalPages = Math.ceil(this.total / this.pageSize);
    });
  }

  // ================= CHECKBOX CHANGE =================
  onCategoryChange(selectedSlug: string): void {

    // Nếu click lại cái đang chọn → về tất cả
    if (this.slug === selectedSlug) {
      this.router.navigate(['/danhmucsanpham']);
    } else {
      this.router.navigate(['/danhmucsanpham', selectedSlug]);
    }
  }

  // ================= SORT =================
  onSortChange(event: Event): void {
    this.sort = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.loadData();
  }

  // ================= PAGING =================
  changePage(p: any): void {
    if (p === this.page) return;
    this.page = p;
    this.loadData();
  }

  get fromItem(): number {
    return (this.page - 1) * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];

    const maxVisible = 3;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, this.page - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    // Nếu chưa đủ 5 trang thì lùi lại
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Nếu có trang trước đó → thêm 1 + ...
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Các trang chính
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Nếu còn trang phía sau → thêm ... + trang cuối
    if (end < this.totalPages) {
      if (end < this.totalPages - 1) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }

    return pages;
  }
  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  addToCart(product: any): void {
    const productToAdd = {
      id: product.id,
      ten: product.ten,
      anh: product.anh,
      gia: product.gia,
      giaKhuyenMai: product.giaKhuyenMai,
      slug: product.slug,
      phanTramGiamGia: product.phanTramGiamGia,
      tenQuaTang: product.quaTangGia > 0 ? product.quaTangTen : null,
      giaQuaTang: product.quaTangGia > 0 ? product.quaTangGia : 0
    };

    this.cartService.addToCart(productToAdd);
  }
}
