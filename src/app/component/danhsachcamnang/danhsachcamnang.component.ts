import { Component, OnInit } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-danhsachcamnang',
  templateUrl: './danhsachcamnang.component.html',
  styleUrl: './danhsachcamnang.component.css'
})
export class DanhsachcamnangComponent implements OnInit {

  news: any[] = [];
  total = 0;
  keyword = '';
  page = 1;
  pageSize = 15;
  totalPages = 0;
  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;

  constructor(private apiService: ApiService) { }
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getListFilterCamNang({
      keyword: this.keyword,
      skipCount: (this.page - 1) * this.pageSize,
      maxResultCount: this.pageSize
    }).subscribe(res => {

      this.news = res.items;

      this.total = res.totalCount;
      this.totalPages = Math.ceil(this.total / this.pageSize);
    });
  }
  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  // ================= PAGINATION =================

  changePage(p: number) {
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

  get visiblePages(): number[] {
    const pages: number[] = [];

    let start = Math.max(1, this.page - 1);
    let end = Math.min(this.totalPages, start + 2);

    if (end - start < 2) {
      start = Math.max(1, end - 2);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showLeftDots(): boolean {
    return this.visiblePages[0] > 1;
  }

  get showRightDots(): boolean {
    return this.visiblePages[this.visiblePages.length - 1] < this.totalPages;
  }
}
