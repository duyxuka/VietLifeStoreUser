import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ApiService } from '../../api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  thumbnailLeft: SafeResourceUrl | null = null;

  imageCache: { [key: string]: SafeResourceUrl } = {};

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    nav: true,
    dots: false,
    navSpeed: 700,
    lazyLoad: true,
    lazyLoadEager: 1,
    navText: ['', ''],
    responsive: {
      0: { items: 1, nav: false, dots: true },
      576: { items: 1, nav: false, dots: true },
      768: { items: 1, nav: true, dots: false },
      1024: { items: 1, nav: true, dots: false }
    }
  };

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadDanhMuc();

    this.apiService.getAllBanner().subscribe(res => {
      this.banners = res;
    });

    this.selectSanPhamBanChay();
    this.selectCamNangMoiNhat();
  }

  loadDanhMuc(): void {
    this.apiService.getListAll().subscribe(res => {
      this.danhMucs = res || [];

      if (this.danhMucs.length > 0) {
        this.selectDanhMuc(this.danhMucs[0]);
      }
    });
  }

  selectDanhMuc(dm: any): void {
    if (!dm || this.selectedDanhMuc?.slug === dm.slug) return;

    this.selectedDanhMuc = dm;

    if (dm.anhThumbnail) {
      this.apiService.getImageSanPham(dm.anhThumbnail).subscribe(res => {
        const ext = dm.anhThumbnail.split('.').pop();

        this.thumbnailLeft =
          this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:image/${ext};base64,${res}`
          );
      });
    } else {
      this.thumbnailLeft = null;
    }

    this.apiService.getByDanhMuc(dm.slug).subscribe(res => {
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

  // ================= IMAGE HANDLER =================

  // ================= IMAGE HANDLER =================

  getImageSanPham(fileName: string): SafeResourceUrl | null {
  if (!fileName) return null;

  // Nếu đã có trong cache thì trả về luôn
  if (this.imageCache[fileName]) {
    return this.imageCache[fileName];
  }

  // Gọi API lấy ảnh
  this.apiService.getImageSanPham(fileName).subscribe(res => {
    const ext = fileName.split('.').pop();

    this.imageCache[fileName] =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:image/${ext};base64,${res}`
      );
  });

  return this.imageCache[fileName] || null;
}


  getImageBanner(fileName: string): SafeResourceUrl | null {
    if (!fileName) return null;

    if (this.imageCache[fileName]) {
      return this.imageCache[fileName];
    }

    this.apiService.getImageBanner(fileName).subscribe(res => {
      const ext = fileName.split('.').pop();

      this.imageCache[fileName] =
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/${ext};base64,${res}`
        );
    });

    return null;
  }

  getImageCamNang(fileName: string): SafeResourceUrl | null {
    if (!fileName) return null;

    if (this.imageCache[fileName]) {
      return this.imageCache[fileName];
    }

    this.apiService.getImageCamNang(fileName).subscribe(res => {
      const ext = fileName.split('.').pop();

      this.imageCache[fileName] =
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/${ext};base64,${res}`
        );
    });

    return null;
  }

}
