import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-dangky',
  templateUrl: './dangky.component.html',
  styleUrl: './dangky.component.css'
})
export class DangkyComponent {

  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
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

    this.authService.register(registerData).pipe(
      switchMap(() =>
        this.authService.login(value.email, value.password)
      ),
      finalize(() => this.isLoading = false)
    )
      .subscribe({
        next: (res: any) => {

          // ✅ Dùng AuthService thay vì localStorage trực tiếp
          this.authService.saveTokens(
            res.access_token,
            res.refresh_token
          );

          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.error?.message ||
            'Đăng ký hoặc đăng nhập thất bại';
        }
      });
  }
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }
}