import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../api.service';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {

  vnp_ResponseCode: string | null = '';
  vnp_TxnRef: string | null = '';
  vnp_TransactionNo: string | null = '';
  vnp_Amount: string | null = '';
  vnp_BankCode: string | null = '';
  vnp_TmnCode: string | null = '';
  vnp_OrderInfo: string | null = '';
  vnp_TransactionStatus: string | null = '';

  statusMessage = '';
  isSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {

      this.vnp_ResponseCode = params.get('vnp_ResponseCode');
      this.vnp_TxnRef = params.get('vnp_TxnRef');
      this.vnp_TransactionNo = params.get('vnp_TransactionNo');
      this.vnp_Amount = params.get('vnp_Amount');
      this.vnp_BankCode = params.get('vnp_BankCode');
      this.vnp_TmnCode = params.get('vnp_TmnCode');
      this.vnp_OrderInfo = params.get('vnp_OrderInfo');
      this.vnp_TransactionStatus = params.get('vnp_TransactionStatus');

      if (this.vnp_ResponseCode === '00') {
        this.isSuccess = true;
        this.statusMessage = 'Thanh toán thành công';
      } 
      else if (this.vnp_ResponseCode === '24') {
        this.isSuccess = false;
        this.statusMessage = 'Bạn đã hủy giao dịch';
      }
      else {
        this.isSuccess = false;
        this.statusMessage = 'Thanh toán thất bại';
      }

      this.savePayment();
    });
  }

  savePayment() {

    const paymentData = {
      amount: this.vnp_Amount,
      transactionId: this.vnp_TransactionNo,
      paymentCode: this.vnp_TxnRef,
      paymentInfor: this.vnp_OrderInfo,
      status: this.vnp_ResponseCode
    };

    this.apiService.postPayment(paymentData).subscribe({
      next: () => {
        this.cartService.clearCart();
      },
      error: err => {
        console.error("Lỗi lưu payment:", err);
      }
    });
  }

  goHome(){
    this.router.navigate(['/danhsachsanpham']);
  }
}