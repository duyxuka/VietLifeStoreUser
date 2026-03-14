import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  userId!: string;
  token!: string;

  loading = false;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParamMap.get('userId')!;
    this.token = this.route.snapshot.queryParamMap.get('token')!;
  }

  submit() {
    if (this.form.invalid) return;

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.toastr.error("Mật khẩu không khớp", "Lỗi");
      return;
    }

    this.loading = true;

    this.authService.resetPassword({
      userId: this.userId,
      token: this.token,
      newPassword: this.form.value.newPassword
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.toastr.error(err.error?.error?.message || "Token không hợp lệ hoặc đã hết hạn", "Lỗi");
      }
    });
  }

  goLogin() {
    this.router.navigate(['/dangnhap']);
  }
}