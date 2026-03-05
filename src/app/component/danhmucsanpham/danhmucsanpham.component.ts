import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';

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
  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
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
    this.apiService.getDanhMucSPListAll()
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
  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  addToCart(product: any): void {
     if (!isPlatformBrowser(this.platformId)) return;
    const productToAdd = {
      id: product.id,
      name: product.ten,
      image: product.anh,
      price: product.gia,
      salePrice: product.giaKhuyenMai,
      quantity: 1,
      priceOrder: product.giaKhuyenMai > 0 ? product.giaKhuyenMai : product.gia,
      slug: product.slug
    };
    // 🔥 Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingIndex = cart.findIndex((item: any) => item.id === productToAdd.id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(productToAdd);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Đã thêm vào giỏ hàng');
  }
}
