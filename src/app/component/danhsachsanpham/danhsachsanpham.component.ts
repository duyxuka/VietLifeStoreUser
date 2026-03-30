import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';
import { CartService } from '../../cart.service';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danhsachsanpham',
  templateUrl: './danhsachsanpham.component.html',
  styleUrls: ['./danhsachsanpham.component.css']
})
export class DanhsachsanphamComponent implements OnInit {

  products: any[] = [];
  total = 0;

  page = 1;
  pageSize = 10;
  totalPages = 0;

  keyword = '';
  sort = 'newest';

  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;
  vouchers: any[] = [];
  savedVoucherIds: Set<string> = new Set();
  isLoggedIn = false;


  constructor(private apiService: ApiService, private cartService: CartService, private authService: AuthService, private toastr: ToastrService,) { }

  ngOnInit() {
    this.loadData();
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

  loadData() {
    this.apiService.getListFilterSanPham({
      keyword: this.keyword,
      sort: this.sort,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize
    }).subscribe(res => {

      this.products = res.items;
      this.total = res.totalCount;
      this.totalPages = Math.ceil(this.total / this.pageSize);
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

  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  // ================= SORT =================

  onSortChange(event: Event) {
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