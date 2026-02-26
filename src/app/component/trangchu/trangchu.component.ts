import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';

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

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDanhMuc();
    this.loadBanner();
    this.selectSanPhamBanChay();
    this.selectCamNangMoiNhat();
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
    return fileName
      ? this.mediaBaseUrl + fileName
      : 'assets/img/no-image.png';
  }

}