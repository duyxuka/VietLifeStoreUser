import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dangnhap',
  templateUrl: './dangnhap.component.html'
})
export class DangnhapComponent {

  showForgot = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  form = this.fb.group({
    emailorphone: ['', Validators.required],
    password: ['', Validators.required],
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
          alert("Sai tài khoản hoặc mật khẩu");
        }
      });
  }
  toggleForgot() {
    this.showForgot = !this.showForgot;
  }

  sendReset() {

    const email = this.form.get('forgotEmail')?.value;

    if (!email) {
      alert("Vui lòng nhập email");
      return;
    }

    this.authService.forgotPassword(email.trim())
      .subscribe({
        next: () => {
          alert("Vui lòng kiểm tra email để đặt lại mật khẩu");
          this.showForgot = false;
          this.form.patchValue({ forgotEmail: '' });
        },
        error: err => {
          console.log(err);
          alert(err.error?.error?.message || "Có lỗi xảy ra");
        }
      });
  }
}