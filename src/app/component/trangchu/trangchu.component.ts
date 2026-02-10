import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-trangchu',
  templateUrl: './trangchu.component.html',
})
export class TrangchuComponent implements OnInit {

  banners: any[] = [];
  danhMucs: any[] = [];
  sanPhams: any[] = [];

  selectedDanhMuc: any = null;
  thumbnailLeft: string | null = null;

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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDanhMuc();

    this.apiService.getAllBanner().subscribe(res => {
      this.banners = res;
    });
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
    if (!dm || this.selectedDanhMuc?.id === dm.id) return;

    this.selectedDanhMuc = dm;
    this.thumbnailLeft = dm.anhThumbnailContent || null;
    this.apiService.getByDanhMuc(dm.id).subscribe(res => {
      this.sanPhams = res || [];
    });
  }
}
