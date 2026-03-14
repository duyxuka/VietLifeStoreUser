import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../enviroments/enviroment';
import { CartService } from '../../cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';

interface ThuocTinhDto {
  ten: string;
  giaTris: string[];
}

interface SanPhamBienTheDto {
  id: string;
  ten: string;
  gia: number;
  giaKhuyenMai: number;
}

interface SanPhamDto {
  id: string;
  ten: string;
  slug: string;
  moTaNgan?: string;
  moTa?: string;
  huongDanSuDung?: string;
  thongSoKyThuat?: string;
  gia: number;
  giaKhuyenMai: number;
  danhMucId: string;
  danhMucSlug: string;
  anh: string;
  anhPhu: string[];
  thuTu: number;
  luotXem: number;
  luotMua: number;
  phanTramGiamGia?: number;
  trangThai: boolean;
  thuocTinhs: ThuocTinhDto[];
  bienThes: SanPhamBienTheDto[];
  quaTangTen: string;
  quaTangGia: number;
}

interface SanPhamReviewDto {
  id: string;
  sanPhamId: string;
  userId: string;
  tenNguoiDung: string;
  email: string;
  noiDung: string;
  soSao: number;
  creationTime: string;
}

@Component({
  selector: 'app-chitietsanpham',
  templateUrl: './chitietsanpham.component.html',
  styleUrls: ['./chitietsanpham.component.css']
})
export class ChitietsanphamComponent implements OnInit {

  // ===================== PRODUCT =====================
  slug?: string;
  product: SanPhamDto | null = null;
  relatedProducts: any[] = [];
  images: string[] = [];
  mainImage: string = '';

  selectedOptions: { [key: string]: string } = {};
  selectedVariant: SanPhamBienTheDto | null = null;
  quantity: number = 1;

  loading = false;
  errorMessage: string | null = null;
  mediaBaseUrl = environment.mediaUrl;

  // ===================== REVIEWS =====================
  reviews: SanPhamReviewDto[] = [];
  avgRating = 0;
  showReviews = true;

  // Phân trang
  currentPage = 1;
  readonly PAGE_SIZE = 5;

  // Form đánh giá
  review = {
    soSao: 0,
    tenNguoiDung: '',
    email: '',
    noiDung: ''
  };

  // Avatar palette: bg + text color tương phản
  private avatarPalette = [
    { bg: '#fde8f0', color: '#9d174d' },
    { bg: '#e0f2fe', color: '#0c4a6e' },
    { bg: '#dcfce7', color: '#14532d' },
    { bg: '#fef3c7', color: '#78350f' },
    { bg: '#ede9fe', color: '#4c1d95' },
    { bg: '#fee2e2', color: '#7f1d1d' },
    { bg: '#d1fae5', color: '#064e3b' },
    { bg: '#fce7f3', color: '#831843' },
  ];
  hasReviewed = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  // ===================== LIFECYCLE =====================

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.loadProduct();
      }
    });
  }

  // ===================== PRODUCT METHODS =====================

  loadProduct(): void {
    if (!this.slug) return;

    this.loading = true;
    this.errorMessage = null;

    this.apiService.getSanPhamBySlug(this.slug).subscribe({
      next: (res: any) => {
        this.product = res;

        // Xử lý ảnh chính + ảnh phụ
        this.mainImage = res.anh || '';
        this.images = [];
        if (res.anh) this.images.push(res.anh);
        if (res.anhPhu?.length) this.images.push(...res.anhPhu);

        // Load sản phẩm liên quan
        if (res.danhMucSlug) {
          this.apiService.getByDanhMucSP(res.danhMucSlug).subscribe((related) => {
            this.relatedProducts = related;
          });
        }

        // Load đánh giá
        this.loadReviews(res.id);

        // Reset lựa chọn biến thể
        this.selectedOptions = {};
        this.selectedVariant = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm:', err);
        this.errorMessage = 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.';
        this.loading = false;
      }
    });
  }

  changeImage(img: string): void {
    this.mainImage = img;
  }

  selectOption(attributeName: string, value: string): void {
    this.selectedOptions[attributeName] = value;
    this.findVariant();
  }

  isSelected(attributeName: string, value: string): boolean {
    return this.selectedOptions[attributeName] === value;
  }

  findVariant(): void {
    if (!this.product?.bienThes?.length || !this.product?.thuocTinhs?.length) {
      this.selectedVariant = null;
      return;
    }

    if (Object.keys(this.selectedOptions).length !== this.product.thuocTinhs.length) {
      this.selectedVariant = null;
      return;
    }

    const selectedValues = Object.values(this.selectedOptions);
    this.selectedVariant = this.product.bienThes.find(variant =>
      selectedValues.every(val => variant.ten.includes(val))
    ) || null;
  }

  get displayPrice(): number {
    if (this.selectedVariant) {
      return this.selectedVariant.giaKhuyenMai > 0
        ? this.selectedVariant.giaKhuyenMai
        : this.selectedVariant.gia;
    }
    if (!this.product) return 0;
    return this.product.giaKhuyenMai > 0
      ? this.product.giaKhuyenMai
      : this.product.gia;
  }

  get originalPrice(): number | null {
    if (this.selectedVariant) {
      return this.selectedVariant.giaKhuyenMai > 0
        ? this.selectedVariant.gia
        : null;
    }
    if (!this.product) return null;
    return this.product.giaKhuyenMai > 0
      ? this.product.gia
      : null;
  }

  get canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.product.thuocTinhs?.length > 0) return !!this.selectedVariant;
    return true;
  }

  increaseQty(): void {
    this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  addToCart(): void {
    if (!this.product) return;

    if (this.product.thuocTinhs?.length > 0 && !this.selectedVariant) {
      this.toastr.info('Vui lòng chọn đầy đủ thuộc tính sản phẩm');
      return;
    }

    const isVariant = !!this.selectedVariant;
    const gia = isVariant ? this.selectedVariant!.gia : this.product.gia;
    const giaKhuyenMai = isVariant ? this.selectedVariant!.giaKhuyenMai : this.product.giaKhuyenMai;

    const cartItem = {
      id: this.product.id,
      bienTheId: this.selectedVariant?.id || null,
      ten: this.product.ten,
      slug: this.product.slug,
      anh: this.mainImage,
      gia,
      giaKhuyenMai,
      quantity: this.quantity,
      thuocTinhDaChon: { ...this.selectedOptions },
      quaTangTen: this.product.quaTangTen,
      quaTangGia: this.product.quaTangGia
    };

    this.cartService.addToCart(cartItem);
  }

  addToCartProduct(product: any): void {
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

  // ===================== REVIEW METHODS =====================

  loadReviews(productId: string): void {
    this.apiService.getReviewsByProduct(productId).subscribe((res: SanPhamReviewDto[]) => {
      this.reviews = res;
      this.currentPage = 1;

      if (this.reviews.length > 0) {
        const total = this.reviews.reduce((a, b) => a + b.soSao, 0);
        this.avgRating = total / this.reviews.length;
      } else {
        this.avgRating = 0;
      }

      this.checkUserReviewed();
    });
  }

  setRating(star: number): void {
    this.review.soSao = star;
  }

  submitReview(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Bạn cần đăng nhập để bình luận');
      return;
    }
    if (!this.product) return;

    if (this.review.soSao < 1) {
      this.toastr.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!this.review.noiDung || this.review.noiDung.trim().length < 10) {
      this.toastr.warning('Nội dung đánh giá phải từ 10 ký tự trở lên');
      return;
    }

    const payload = {
      sanPhamId: this.product.id,
      soSao: this.review.soSao,
      tenNguoiDung: this.review.tenNguoiDung,
      email: this.review.email,
      noiDung: this.review.noiDung
    };

    this.apiService.createReview(payload).subscribe({
      next: () => {
        this.toastr.success('Đánh giá thành công');
        this.review = { soSao: 0, tenNguoiDung: '', email: '', noiDung: '' };
        this.loadReviews(this.product!.id); // loadReviews sẽ gọi checkUserReviewed() bên trong
      },
      error: (err) => {
        const msg = err?.error?.error?.message || 'Gửi đánh giá thất bại';
        this.toastr.error(msg);
      }
    });
  }

  toggleReviews(): void {
    this.showReviews = !this.showReviews;
  }
  checkUserReviewed(): void {
    if (!this.authService.isLoggedIn()) {
      this.hasReviewed = false;
      return;
    }

    const currentUserId = this.authService.getUserIdFromToken();
    if (!currentUserId) {
      this.hasReviewed = false;
      return;
    }

    this.hasReviewed = this.reviews.some(
      r => r.userId === currentUserId
    );
  }

  // ===================== PAGINATION =====================

  get pagedReviews(): SanPhamReviewDto[] {
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    return this.reviews.slice(start, start + this.PAGE_SIZE);
  }

  get totalPages(): number {
    return Math.ceil(this.reviews.length / this.PAGE_SIZE);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    // Cuộn lên đầu danh sách đánh giá
    document.querySelector('.rv-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===================== AVATAR & STAR HELPERS =====================

  getInitial(name: string): string {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  }

  getAvatarStyle(name: string): { [key: string]: string } {
    if (!name) return { background: this.avatarPalette[0].bg, color: this.avatarPalette[0].color };
    let hash = 0;
    for (const c of name) hash += c.charCodeAt(0);
    const palette = this.avatarPalette[hash % this.avatarPalette.length];
    return { background: palette.bg, color: palette.color };
  }

  getStarCount(star: number): number {
    return this.reviews.filter(r => r.soSao === star).length;
  }

  getStarPercent(star: number): number {
    if (!this.reviews.length) return 0;
    return (this.getStarCount(star) / this.reviews.length) * 100;
  }

  // Trả về mảng [1..5] để dùng *ngFor render sao
  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}