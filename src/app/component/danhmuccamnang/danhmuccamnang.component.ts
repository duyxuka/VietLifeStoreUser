import { Component, OnInit } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { ApiService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-danhmuccamnang',
  templateUrl: './danhmuccamnang.component.html',
  styleUrl: './danhmuccamnang.component.css'
})
export class DanhmuccamnangComponent implements OnInit {

  news: any[] = [];
  categories: any[] = [];

  total = 0;
  page = 1;
  pageSize = 5;
  totalPages = 0;

  keyword = '';

  // Không dùng null
  slug?: string;
  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  // ================= INIT =================
  ngOnInit(): void {

    // Load danh mục sidebar
    this.loadCategories();

    // Theo dõi slug trên URL
    this.route.params.subscribe(params => {
      this.slug = params['slug'];   // undefined nếu không có
      this.page = 1;
      this.loadData();
    });
  }

  // ================= LOAD DANH MỤC =================
  loadCategories(): void {
    this.apiService.getDanhMucCamNangListAll()
      .subscribe(res => {
        this.categories = res;
      });
  }

  // ================= LOAD SẢN PHẨM =================
  loadData(): void {
    this.apiService.getListFilterCamNang({
      keyword: this.keyword || undefined,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      danhMucSlug: this.slug   // undefined nếu không chọn
    }).subscribe(res => {
      this.news = res.items;
      this.total = res.totalCount;
      this.totalPages = Math.ceil(this.total / this.pageSize);
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadData();
  }

  // ================= CHECKBOX CHANGE =================
  onCategoryChange(selectedSlug: string): void {

    // Nếu click lại cái đang chọn → về tất cả
    if (this.slug === selectedSlug) {
      this.router.navigate(['/danhmuccamnang']);
    } else {
      this.router.navigate(['/danhmuccamnang', selectedSlug]);
    }
  }

  // ================= PAGING =================
  changePage(p: number): void {
    if (p === this.page) return;
    this.page = p;
    this.loadData();
  }

  get fromItem(): number {
    return (this.page - 1) * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  getTotalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName
      ? this.mediaBaseUrl + fileName
      : 'assets/img/no-image.png';
  }
}
