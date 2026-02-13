import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-danhsachsanpham',
  templateUrl: './danhsachsanpham.component.html',
  styleUrl: './danhsachsanpham.component.css'
})
export class DanhsachsanphamComponent implements OnInit {

  products: any[] = [];
  total = 0;

  page = 1;
  pageSize = 15;
  totalPages = 0;

  visiblePages: (number | '...')[] = [];

  keyword = '';
  sort = 'newest';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getListFilterSanPham({
      keyword: this.keyword,
      sort: this.sort,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize
    }).subscribe(res => {
      this.products = res.items;
      this.total = res.totalCount;

      this.totalPages = Math.ceil(this.total / this.pageSize);
      this.buildPages();
    });
  }

  onSortChange(event: Event) {
    this.sort = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.loadData();
  }

  buildPages() {
    const pages: (number | '...')[] = [];

    if (this.page > 3) {
      pages.push(1, '...');
    }

    for (let i = Math.max(1, this.page - 2); i <= Math.min(this.totalPages, this.page + 2); i++) {
      pages.push(i);
    }

    if (this.page < this.totalPages - 2) {
      pages.push('...', this.totalPages);
    }

    this.visiblePages = pages;
  }

  changePage(p: number | '...') {
    if (p === '...') return;
    if (p === this.page) return;

    this.page = p;
    this.loadData();
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  next() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
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

