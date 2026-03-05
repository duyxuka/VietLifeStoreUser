import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../cart.service';
import { environment } from '../../enviroments/enviroment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-thanhtoan',
  templateUrl: './thanhtoan.component.html',
  styleUrls: ['./thanhtoan.component.css']
})
export class ThanhtoanComponent {

  isBrowser = false;
  cartItems: any[] = [];
  totalPrice = 0;
  discount = 0;
  checkoutForm!: FormGroup;
  paymentMethod = 'VNPAY';
  mediaBaseUrl = environment.mediaUrl;
  userId = this.aushService.getUserIdFromToken();
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService,
    private http: HttpClient,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private aushService: AuthService
  ) { }

  ngOnInit() {

    // Tạo form
    this.checkoutForm = this.fb.group({
      ten: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      soDienThoai: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      diaChi: ['', Validators.required],
      ghiChu: [''],
      voucherCode: ['']
    });

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
        this.totalPrice = this.cartService.getTotalPrice();
      });
    }
  }

  get finalTotal() {
    return this.totalPrice - this.discount;
  }

  applyVoucher() {

    const code = this.checkoutForm.get('voucherCode')?.value;

    if (!code) {
      this.toastr.warning("Vui lòng nhập mã voucher");
      return;
    }

    this.http.get<any[]>('/api/app/vouchers/get-list-all')
      .subscribe(res => {

        const voucher = res.find(v => v.maVoucher === code);

        if (!voucher) {
          this.toastr.error("Voucher không tồn tại");
          return;
        }

        if (this.totalPrice < voucher.donHangToiThieu) {
          this.toastr.error("Chưa đủ điều kiện áp dụng voucher");
          return;
        }

        this.discount = voucher.laPhanTram
          ? this.totalPrice * (voucher.giamGia / 100)
          : voucher.giamGia;

        this.toastr.success("Áp dụng voucher thành công");
      });
  }

  placeOrder() {

    if (this.checkoutForm.invalid) {
      this.toastr.error("Vui lòng nhập đầy đủ thông tin");
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cartItems.length === 0) {
      this.toastr.error("Giỏ hàng trống");
      return;
    }

    const formValue = this.checkoutForm.value;

    const order = {
      taiKhoanKhachHangId: this.userId,
      ten: formValue.ten,
      email: formValue.email,
      soDienThoai: formValue.soDienThoai,
      diaChi: formValue.diaChi,
      ghiChu: formValue.ghiChu,
      phuongThucThanhToan: this.paymentMethod,
      trangThai: 0,
      tongTien: this.finalTotal,
      chiTietDonHangs: this.cartItems.map(item => ({
        sanPhamId: item.id,
        sanPhamBienThe: JSON.stringify(item.thuocTinhDaChon) || '',
        quaTang: item.quaTangTen || '',
        soLuong: item.quantity,
        gia: item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia,
        giamGiaVoucher: this.discount / this.cartItems.length,
        trangThai: true
      }))
    };

    this.apiService.createDonHang(order)
      .subscribe({
        next: () => {
          this.toastr.success("Đặt hàng thành công");
          this.cartService.clearCart();
          this.checkoutForm.reset();
          this.discount = 0;
        },
        error: () => {
          this.toastr.error("Có lỗi xảy ra");
        }
      });
  }

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }
  get totalQuantity() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}