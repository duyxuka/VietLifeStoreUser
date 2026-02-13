import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Định nghĩa các interface (có thể tách ra file riêng models/san-pham-dto.ts)
interface ThuocTinhDto {
  ten: string;
  giaTris: string[];
}

interface SanPhamBienTheDto {
  id: string;           // hoặc number tùy backend trả về
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
  anh: string;                // base64
  anhPhu: string[];           // mảng base64
  thuTu: number;
  luotXem: number;
  luotMua: number;
  phanTramGiamGia?: number;
  trangThai: boolean;
  thuocTinhs: ThuocTinhDto[];
  bienThes: SanPhamBienTheDto[];
}

@Component({
  selector: 'app-chitietsanpham',
  templateUrl: './chitietsanpham.component.html',
  styleUrls: ['./chitietsanpham.component.css']
})
export class ChitietsanphamComponent implements OnInit {

  slug?: string;
  product: SanPhamDto | null = null;

  images: string[] = [];
  mainImage: string = '';

  selectedOptions: { [key: string]: string } = {};
  selectedVariant: SanPhamBienTheDto | null = null;

  quantity: number = 1;

  loading = false;
  errorMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    if (!this.slug) return;

    this.loading = true;
    this.errorMessage = null;

    this.apiService.getSanPhamBySlug(this.slug).subscribe({
      next: (res: any) => {
        this.product = res;

        // Xử lý ảnh
        this.mainImage = res.anh || '';
        this.images = res.anhPhu?.length ? res.anhPhu : [];

        // Nếu không có ảnh phụ, dùng ảnh chính làm ảnh phụ duy nhất
        if (this.images.length === 0 && this.mainImage) {
          this.images = [this.mainImage];
        }

        this.loading = false;

        // Reset lựa chọn khi load sản phẩm mới
        this.selectedOptions = {};
        this.selectedVariant = null;
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

    // Kiểm tra xem đã chọn đủ số lượng thuộc tính chưa
    if (Object.keys(this.selectedOptions).length !== this.product.thuocTinhs.length) {
      this.selectedVariant = null;
      return;
    }

    const selectedValues = Object.values(this.selectedOptions);

    // Tìm biến thể khớp với tất cả giá trị đã chọn
    // Cách này giả định tên biến thể chứa các giá trị thuộc tính (cách phổ biến)
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

  addToCart(): void {
    if (!this.product) return;

    // Kiểm tra nếu sản phẩm có thuộc tính thì phải chọn biến thể
    if (this.product.thuocTinhs?.length > 0 && !this.selectedVariant) {
      alert('Vui lòng chọn đầy đủ thuộc tính sản phẩm');
      return;
    }

    const cartItem = {
      sanPhamId: this.product.id,
      bienTheId: this.selectedVariant?.id || null,
      quantity: this.quantity,
      tenSanPham: this.product.ten,
      anh: this.mainImage,
      gia: this.displayPrice,
      // có thể thêm các field khác nếu cần
    };

    console.log('Thêm vào giỏ hàng:', cartItem);

    // TODO: Gọi service để thêm vào giỏ hàng thực tế
    // this.cartService.addToCart(cartItem);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  }

  increaseQty(): void {
    this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Helper: kiểm tra trạng thái nút "Thêm vào giỏ"
  get canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.product.thuocTinhs?.length > 0) {
      return !!this.selectedVariant;
    }
    return true;
  }
}