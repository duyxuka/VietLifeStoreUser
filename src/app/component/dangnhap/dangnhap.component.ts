import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dangnhap',
  templateUrl: './dangnhap.component.html',
  styleUrls: ['./dangnhap.component.css']
})
export class DangnhapComponent {

  showForgot = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  form = this.fb.group({
    emailorphone: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    forgotEmail: ['']
  });

  login() {

    if (this.form.invalid) return;

    const { emailorphone, password } = this.form.value;

    this.authService.login(emailorphone!, password!)
      .subscribe({
        next: (res) => {

          this.authService.saveTokens(
            res.access_token,
            res.refresh_token
          );

          if (isPlatformBrowser(this.platformId)) {
            window.location.href = '/';
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error("Sai tài khoản hoặc mật khẩu", "Lỗi");
        }
      });
  }
  toggleForgot() {
    this.showForgot = !this.showForgot;
  }

  sendReset() {

    const email = this.form.get('forgotEmail')?.value;

    if (!email) {
      this.toastr.error("Vui lòng nhập email", "Lỗi");
      return;
    }

    this.authService.forgotPassword(email.trim())
      .subscribe({
        next: () => {
          this.toastr.success("Vui lòng kiểm tra email để đặt lại mật khẩu", "Thành công");
          this.showForgot = false;
          this.form.patchValue({ forgotEmail: '' });
        },
        error: err => {
          console.log(err);
          this.toastr.error("Có lỗi xảy ra", "Lỗi");
        }
      });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}