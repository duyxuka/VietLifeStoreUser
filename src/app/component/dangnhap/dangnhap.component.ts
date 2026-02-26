import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dangnhap',
  templateUrl: './dangnhap.component.html'
})
export class DangnhapComponent {

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  form = this.fb.group({
    emailorphone: ['', Validators.required],
    password: ['', Validators.required]
  });

  login() {

    if (this.form.invalid) return;

    const { emailorphone, password } = this.form.value;

    this.authService.login(emailorphone!, password!)
      .subscribe({
        next: (res) => {

          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);

          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          alert("Sai tài khoản hoặc mật khẩu");
        }
      });
  }

}