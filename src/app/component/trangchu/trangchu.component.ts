import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';
import { DomSanitizer } from '@angular/platform-browser';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-trangchu',
  templateUrl: './trangchu.component.html',
})
export class TrangchuComponent implements OnInit {

  banners: any[] = [];
  danhMucs: any[] = [];
  sanPhams: any[] = [];
  sanPhamsbanchay: any[] = [];
  camNangMoiNhat: any[] = [];
  tiktokVideos: any[] = [];

  selectedDanhMuc: any = null;
  thumbnailLeft: string | null = null;

  // 🔥 Base URL ảnh
  mediaBaseUrl = environment.mediaUrl;

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    nav: true,
    dots: false,
    navSpeed: 700,
    lazyLoad: true,
    navText: ['', ''],
    responsive: {
      0: { items: 1, nav: false, dots: true },
      576: { items: 1, nav: false, dots: true },
      768: { items: 1, nav: true, dots: false },
      1024: { items: 1, nav: true, dots: false }
    }
  };
  videoOptions: OwlOptions = {
    loop: true,
    autoplay: false,
    margin: 20,
    nav: true,
    dots: false,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1200: { items: 3 }
    }
  };

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer,private cartService: CartService) { }

  ngOnInit(): void {
    this.loadDanhMuc();
    this.loadBanner();
    this.selectSanPhamBanChay();
    this.selectCamNangMoiNhat();
    // this.loadTikTokVideos();
  }

  // ================= LOAD DATA =================

  loadBanner(): void {
    this.apiService.getAllBanner().subscribe(res => {
      this.banners = res || [];
    });
  }

  loadDanhMuc(): void {
    this.apiService.getDanhMucSPListAll().subscribe(res => {
      this.danhMucs = res || [];

      if (this.danhMucs.length > 0) {
        this.selectDanhMuc(this.danhMucs[0]);
      }
    });
  }

  selectDanhMuc(dm: any): void {
    if (!dm || this.selectedDanhMuc?.slug === dm.slug) return;

    this.selectedDanhMuc = dm;

    // 🔥 Thumbnail dùng URL trực tiếp
    this.thumbnailLeft = dm.anhThumbnail
      ? this.getImageUrl(dm.anhThumbnail)
      : null;

    this.apiService.getByDanhMucSP(dm.slug).subscribe(res => {
      this.sanPhams = res || [];
    });
  }

  selectSanPhamBanChay(): void {
    this.apiService.getSanPhamBanChay().subscribe(res => {
      this.sanPhamsbanchay = res || [];
    });
  }

  selectCamNangMoiNhat(): void {
    this.apiService.getCamNangHomeMoiNhat().subscribe(res => {
      this.camNangMoiNhat = res || [];
    });
  }

  // ================= IMAGE HELPER =================

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }
  // getTikTokEmbedUrl(videoId: string): string {
  //   // Hoặc thêm query param nếu muốn tùy chỉnh: ?music_info=1&description=1
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(
  //     `https://www.tiktok.com/player/v1/${videoId}`
  //   ) as string;
  // }
  // loadTikTokVideos(): void {
  //   this.apiService.getTikTokVideos('HomePage')
  //     .subscribe(res => {
  //       this.tiktokVideos = res || [];
  //     });
  // }


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