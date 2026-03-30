import { Component, HostListener, OnInit } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';
import { CartService } from '../../cart.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trangchu',
  templateUrl: './trangchu.component.html',
  styleUrls: ['./trangchu.component.css']
})
export class TrangchuComponent implements OnInit {

  banners: any[] = [];
  danhMucs: any[] = [];
  sanPhams: any[] = [];
  sanPhamsbanchay: any[] = [];
  camNangMoiNhat: any[] = [];
  tiktokVideos: any[] = [];
  total = 0;

  page = 1;
  pageSize = 6;
  totalPages = 0;
  selectedDanhMuc: any = null;
  thumbnailLeft: string | null = null;

  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;
  isBrowser = false;
  isMobile = false;

  customOptions: OwlOptions = {
    loop: true,
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    nav: true,
    dots: false,
    navSpeed: 700,
    lazyLoad: true,
    navText: ['', ''],
    responsive: {
      0: { items: 1, nav: false, dots: true },
      576: { items: 1, nav: false, dots: true },
      768: { items: 1, nav: true, dots: false },
      1024: { items: 1, nav: true, dots: false }
    }
  };
  videoOptions: OwlOptions = {
    loop: true,
    autoplay: false,
    margin: 20,
    nav: true,
    dots: false,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1200: { items: 3 }
    }
  };

  vouchers: any[] = [];
  savedVoucherIds: Set<string> = new Set();
  isLoggedIn = false;

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private cartService: CartService, @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService, private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768;
    }
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
    this.loadDanhMuc();
    this.loadBanner();
    this.selectSanPhamBanChay();
    this.selectCamNangMoiNhat();
    this.loadTikTokVideos();
  }

  // ================= LOAD DATA =================

  loadBanner(): void {
    this.apiService.getAllBanner().subscribe(res => {
      this.banners = res || [];
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

  loadDanhMuc(): void {
    this.apiService.getDanhMucSPListAll().subscribe(res => {
      this.danhMucs = res || [];

      if (this.danhMucs.length > 0) {
        this.selectDanhMuc(this.danhMucs[0]);
      }
    });
  }
  loadSanPham(): void {

    if (!this.selectedDanhMuc) return;

    this.apiService.getListFilterSanPham({
      danhMucSlug: this.selectedDanhMuc.slug,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize
    }).subscribe(res => {

      this.sanPhams = res.items;
      this.total = res.totalCount;
      this.totalPages = Math.ceil(this.total / this.pageSize);

    });

  }
  selectDanhMuc(dm: any): void {

    if (!dm) return;

    this.selectedDanhMuc = dm;

    // reset page khi đổi danh mục
    this.page = 1;

    this.thumbnailLeft = dm.anhThumbnail
      ? this.getImageUrl(dm.anhThumbnail)
      : null;

    this.loadSanPham();
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;

    this.isMobile = window.innerWidth <= 768;
  }

  getBannerImage(banner: any): string {
    return this.isMobile && banner.anhMobile ? banner.anhMobile : banner.anh;
  }

  // ================= PAGING =================
  changePage(p: any): void {
    if (p === this.page) return;
    this.page = p;
    this.loadSanPham();
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

  selectSanPhamBanChay(): void {
    this.apiService.getSanPhamBanChay().subscribe(res => {
      this.sanPhamsbanchay = res || [];
    });
  }

  selectCamNangMoiNhat(): void {
    this.apiService.getCamNangHomeMoiNhat().subscribe(res => {
      this.camNangMoiNhat = res || [];
    });
  }

  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }
  getTikTokUrl(id: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.tiktok.com/player/v1/${id}`
    );
  }
  loadTikTokVideos(): void {
    this.apiService.getTikTokVideos('HomePage')
      .subscribe(res => {
        this.tiktokVideos = res || [];
      });
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