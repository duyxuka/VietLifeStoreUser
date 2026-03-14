import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-thongtincanhan',
  templateUrl: './thongtincanhan.component.html',
  styleUrl: './thongtincanhan.component.css'
})
export class ThongtincanhanComponent implements OnInit {

  user: any;
  tab = 'account';
  orders: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalCount = 0;

  statusFilter: number | null = null;
  pages: number[] = [];
  password: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  selectedOrderId: string | null = null;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;


  constructor(private accountService: AuthService, private toastr: ToastrService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadProfile();
    this.getOrder();
  }

  loadProfile() {
    this.accountService.getProfile().subscribe(res => {
      this.user = res;
    });
  }

  updateProfile() {

    const data = {
      name: this.user.name,
      phoneNumber: this.user.phoneNumber
    };

    this.accountService.updateProfile(data).subscribe(() => {
      this.toastr.success("Cập nhật thành công", "Thành công");
      this.loadProfile();
    });

  }

  changePassword() {

    if (!this.password.oldPassword) {
      this.toastr.error("Nhập mật khẩu hiện tại");
      return;
    }

    if (this.password.newPassword.length < 6) {
      this.toastr.error("Mật khẩu phải tối thiểu 6 ký tự");
      return;
    }
    if (this.password.newPassword !== this.password.confirmPassword) {
      this.toastr.error("Mật khẩu xác nhận không đúng", "Lỗi");
      return;
    }

    this.accountService.changePassword({
      currentPassword: this.password.oldPassword,
      newPassword: this.password.newPassword
    }).subscribe(() => {
      this.toastr.success("Đổi mật khẩu thành công", "Thành công");
      this.password = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    });

  }

  getOrder() {
    const skip = (this.currentPage - 1) * this.pageSize;
    this.accountService.getOrderbyUserId(skip, this.pageSize, this.statusFilter ?? undefined).subscribe((res: any) => {

      this.orders = res.items;
      this.totalCount = res.totalCount;

      this.buildPages();

    });
  }
  buildPages() {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    const start = Math.max(this.currentPage - 1, 1);
    const end = Math.min(start + 2, totalPages);
    this.pages = [];
    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }
  filterStatus(event: any) {
    const value = event.target.value;
    this.statusFilter = value === "" ? null : Number(value);
    this.currentPage = 1;
    this.getOrder();

  }
  changePage(page: number) {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.getOrder();
  }

  toggleOrder(orderId: string) {
    if (this.selectedOrderId === orderId) {
      this.selectedOrderId = null;
    } else {
      this.selectedOrderId = orderId;
    }
  }
  cancelOrder(orderId: string) {

    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    this.apiService.cancelOrder(orderId).subscribe({
      next: () => {
        this.toastr.success("Hủy đơn hàng thành công");

        this.getOrder(); // reload danh sách
      },
      error: () => {
        this.toastr.error("Không thể hủy đơn hàng");
      }
    });

  }
  get totalSpent() {
    return this.orders
      .filter(o => o.trangThai === 3)
      .reduce((sum, o) => sum + o.tongTien, 0);
  }

  logout() {
    this.accountService.logout();
    location.href = "/dangnhap";
  }

}