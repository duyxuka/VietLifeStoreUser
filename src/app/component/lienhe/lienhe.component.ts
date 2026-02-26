import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lienhe',
  templateUrl: './lienhe.component.html',
  styleUrls: ['./lienhe.component.css']
})
export class LienheComponent {

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private lienHeService: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      hoTen: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      soDienThoai: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0[3|5|7|8|9])[0-9]{8}$/)
        ]
      ],
      noiDung: ['', Validators.required],
      daXuLy: [false]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.lienHeService.createLienHe(this.form.value).subscribe({
      next: () => {
        this.toastr.success('Gửi liên hệ thành công!');
        this.form.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.toastr.error('Có lỗi xảy ra, vui lòng thử lại.');
        this.isSubmitting = false;
      }
    });
  }
}