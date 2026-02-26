import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dangky',
  templateUrl: './dangky.component.html',
  styleUrl: './dangky.component.css'
})
export class DangkyComponent {

  form!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  register() {

    if (this.form.invalid) return;

    const value = this.form.value;

    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Mật khẩu không khớp';
      return;
    }

    this.isLoading = true;

    const registerData = {
      userName: value.email, // bạn có thể đổi logic nếu muốn
      email: value.email,
      password: value.password,
      name: value.fullName,
      phoneNumber: value.phoneNumber
    };

    this.authService.register(registerData).subscribe({
      next: () => {

        // 🔥 Đăng ký thành công → login luôn
        this.authService.login(value.email, value.password).subscribe({
          next: (res: any) => {

            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('refresh_token', res.refresh_token);

            this.router.navigate(['/']);
          },
          error: () => {
            this.errorMessage = 'Đăng nhập tự động thất bại';
          }
        });

      },
      error: (err) => {
        this.errorMessage = err.error?.error?.message || 'Đăng ký thất bại';
        this.isLoading = false;
      }
    });
  }
}