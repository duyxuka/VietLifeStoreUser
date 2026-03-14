import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-danhsachsanpham',
  templateUrl: './danhsachsanpham.component.html',
  styleUrls: ['./danhsachsanpham.component.css']
})
export class DanhsachsanphamComponent implements OnInit {

  products: any[] = [];
  total = 0;

  page = 1;
  pageSize = 10;
  totalPages = 0;

  keyword = '';
  sort = 'newest';

  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;

  constructor(private apiService: ApiService,private cartService: CartService) { }

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
    });
  }

  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  // ================= SORT =================

  onSortChange(event: Event) {
    this.sort = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.loadData();
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
    return Math.ceil(this.total / this.pageSize);
  }

  getTotalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  addToCart(product: any): void {

    const productToAdd = {
      id: product.id,
      ten: product.ten,
      anh: product.anh,
      gia: product.gia,
      giaKhuyenMai: product.giaKhuyenMai,
      slug: product.slug,
      phanTramGiamGia: product.phanTramGiamGia,
      tenQuaTang: product.quaTangGia > 0 ? product.quaTangTen : null,
      giaQuaTang: product.quaTangGia > 0 ? product.quaTangGia : 0
    };

    this.cartService.addToCart(productToAdd);
  }
}