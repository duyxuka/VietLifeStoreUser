import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-danhmucsanpham',
  templateUrl: './danhmucsanpham.component.html',
  styleUrls: ['./danhmucsanpham.component.css']
})
export class DanhmucsanphamComponent implements OnInit {

  products: any[] = [];
  categories: any[] = [];

  total = 0;
  page = 1;
  pageSize = 12;
  totalPages = 0;

  keyword = '';
  sort = 'newest';

  // Không dùng null
  slug?: string;

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
    this.apiService.getListAll()
      .subscribe(res => {
        this.categories = res;
      });
  }

  // ================= LOAD SẢN PHẨM =================
  loadData(): void {
    this.apiService.getListFilterSanPham({
      keyword: this.keyword || undefined,
      sort: this.sort,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      danhMucSlug: this.slug   // undefined nếu không chọn
    }).subscribe(res => {
      this.products = res.items;
      this.total = res.totalCount;
      this.totalPages = Math.ceil(this.total / this.pageSize);
    });
  }

  // ================= CHECKBOX CHANGE =================
  onCategoryChange(selectedSlug: string): void {

    // Nếu click lại cái đang chọn → về tất cả
    if (this.slug === selectedSlug) {
      this.router.navigate(['/danhmucsanpham']);
    } else {
      this.router.navigate(['/danhmucsanpham', selectedSlug]);
    }
  }

  // ================= SORT =================
  onSortChange(event: Event): void {
    this.sort = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.loadData();
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
}
