import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../enviroments/enviroment';
import { CartService } from '../../cart.service';
import { ToastrService } from 'ngx-toastr';

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
  danhMucSlug: string;
  anh: string;                // base64
  anhPhu: string[];           // mảng base64
  thuTu: number;
  luotXem: number;
  luotMua: number;
  phanTramGiamGia?: number;
  trangThai: boolean;
  thuocTinhs: ThuocTinhDto[];
  bienThes: SanPhamBienTheDto[];
  quaTangTen : string;
  quaTangGia: number;
}

@Component({
  selector: 'app-chitietsanpham',
  templateUrl: './chitietsanpham.component.html',
  styleUrls: ['./chitietsanpham.component.css']
})
export class ChitietsanphamComponent implements OnInit {

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
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService
  ) { }

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
        // Xử lý ảnh
        this.mainImage = res.anh || '';

        // Gộp ảnh chính + ảnh phụ
        this.images = [];

        if (res.anh) {
          this.images.push(res.anh);
        }

        if (res.anhPhu?.length) {
          this.images.push(...res.anhPhu);
        }
        if (res.danhMucSlug) {
          this.apiService
            .getByDanhMucSP(res.danhMucSlug)
            .subscribe((related) => {
              this.relatedProducts = related;
            });
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
  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  addToCart(): void {
    if (!this.product) return;

    // Nếu có thuộc tính thì bắt buộc chọn biến thể
    if (this.product.thuocTinhs?.length > 0 && !this.selectedVariant) {
      this.toastr.info("Vui lòng chọn đầy đủ thuộc tính sản phẩm")
      return;
    }

    const isVariant = !!this.selectedVariant;

    const gia = isVariant
      ? this.selectedVariant!.gia
      : this.product.gia;

    const giaKhuyenMai = isVariant
      ? this.selectedVariant!.giaKhuyenMai
      : this.product.giaKhuyenMai;

    const cartItem = {
      id: this.product.id,
      bienTheId: this.selectedVariant?.id || null,
      ten: this.product.ten,
      slug: this.product.slug,
      anh: this.mainImage,
      gia: gia,
      giaKhuyenMai: giaKhuyenMai,
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
}