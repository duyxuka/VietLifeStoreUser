import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../cart.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { environment } from '../../enviroments/enviroment';

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
  vouchers: any[] = [];
  selectedVoucher: any = null;
  checkoutForm!: FormGroup;
  user: any;
  mediaBaseUrl = environment.mediaUrl;
  isSubmitting = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService,
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
      voucherCode: [''],
      paymentMethod: ['VNPAY']
    });

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
        this.totalPrice = this.cartService.getTotalPrice();
        this.discount = 0;
        this.selectedVoucher = null;
        this.loadVouchers();
      });
    }
    this.loadProfile();
  }

  get finalTotal() {
    return this.totalPrice - this.discount;
  }
  loadVouchers() {
    this.apiService.getMyVouchersWithStatus(this.totalPrice).subscribe({
      next: (vouchers: any) => {
        this.vouchers = vouchers;
      },
      error: (err: any) => {
        console.error("Lỗi tải vouchers:", err);
      }
    });
  }
  loadProfile() {
    this.aushService.getProfile().subscribe(res => {
      this.user = res;
      console.log("User profile:", res);

      this.checkoutForm.patchValue({
        ten: res.name,
        email: res.email,
        soDienThoai: res.phoneNumber
      });
    });
  }
  applyVoucher(voucher: any) {

    if (this.selectedVoucher) {
      this.toastr.warning("Chỉ được áp dụng 1 voucher cho mỗi đơn hàng");
      return;
    }

    if (!voucher.duDieuKien) {
      this.toastr.warning(voucher.lyDoKhongDuDieuKien || "Voucher không đủ điều kiện");
      return;
    }

    let discount = 0;
    if (voucher.laPhanTram) {
      discount = this.totalPrice * voucher.giamGia / 100;
      if (voucher.giamToiDa && discount > voucher.giamToiDa) {
        discount = voucher.giamToiDa;
      }
    } else {
      discount = voucher.giamGia;
    }

    if (discount > this.totalPrice) discount = this.totalPrice;

    this.discount = discount;
    this.selectedVoucher = voucher;
    this.checkoutForm.patchValue({ voucherCode: voucher.maVoucher });
    this.toastr.success("Áp dụng voucher thành công");
  }

  applyVoucherByCode() {

    if (this.selectedVoucher) {
      this.toastr.warning("Bạn đã áp dụng voucher rồi");
      return;
    }

    const code = this.checkoutForm.get('voucherCode')?.value;

    if (!code) {
      this.toastr.warning("Nhập mã voucher");
      return;
    }

    this.apiService.validateVoucher(code, this.totalPrice)
      .subscribe({
        next: (voucher: any) => {
          this.applyVoucher(voucher);
        },
        error: () => {
          this.toastr.error("Voucher không hợp lệ");
        }
      });
  }

  removeVoucher() {
    this.selectedVoucher = null;
    this.discount = 0;
    this.checkoutForm.patchValue({
      voucherCode: ''
    });
  }

  placeOrder() {
    if (!this.user || !this.user.id) {
      this.toastr.warning("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    if (this.isSubmitting) return;
    if (this.checkoutForm.invalid) {
      this.toastr.error("Vui lòng nhập đầy đủ thông tin");
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cartItems.length === 0) {
      this.toastr.error("Giỏ hàng trống");
      return;
    }
    this.isSubmitting = true;
    const formValue = this.checkoutForm.value;

    const order = {
      taiKhoanKhachHangId: this.user.id,
      ten: formValue.ten,
      email: formValue.email,
      soDienThoai: formValue.soDienThoai,
      diaChi: formValue.diaChi,
      ghiChu: formValue.ghiChu,
      phuongThucThanhToan: formValue.paymentMethod,
      trangThai: 0,
      tongTien: this.finalTotal,
      giamGiaVoucher: this.discount,
      voucherId: this.selectedVoucher?.id,
      chiTietDonHangs: this.cartItems.map(item => ({
        sanPhamId: item.id,
        sanPhamBienThe: JSON.stringify(item.thuocTinhDaChon) || '',
        quaTang: item.quaTangTen || '',
        soLuong: item.quantity,
        gia: item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia,
        trangThai: true
      }))
    };

    this.apiService.createDonHang(order)
      .subscribe({
        next: (res: any) => {
          const orderId = res.id;

          if (formValue.paymentMethod === 'VNPAY') {

            this.apiService.createPayment(orderId)
              .subscribe({
                next: (paymentUrl: any) => {
                  console.log("Payment URL:", paymentUrl);
                  if (this.isBrowser) {
                    window.location.href = paymentUrl;
                  }
                },
                error: (err: any) => {
                  this.isSubmitting = false;
                  console.error("Error creating payment:", err);
                  this.toastr.error("Có lỗi xảy ra khi tạo đơn hàng");
                }
              });

          } else {
            if (this.isBrowser) {
              window.location.href = "/dathangthanhcong?orderId=" + orderId;
            }
            this.cartService.clearCart();
          }
        },
        error: () => {
          this.isSubmitting = false;
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