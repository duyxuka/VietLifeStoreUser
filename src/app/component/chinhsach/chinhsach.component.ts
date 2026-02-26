import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-chinhsach',
  templateUrl: './chinhsach.component.html',
  styleUrls: ['./chinhsach.component.css']
})
export class ChinhsachComponent implements OnInit {

  danhMucList: any[] = [];
  chinhSachList: any[] = [];
  selectedDanhMucId: string | null = null;
  selectedDanhMucName: string = '';
  openedIndex: number | null = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDanhMuc();
  }

  loadDanhMuc() {
    this.apiService.getDanhMucChinhSachAll().subscribe(res => {
      this.danhMucList = res;

      // 🔥 Tự động load danh mục đầu tiên
      if (this.danhMucList.length > 0) {
        this.selectDanhMuc(this.danhMucList[0].id);
      }
    });
  }

  selectDanhMuc(id: string) {
    this.selectedDanhMucId = id;

    const found = this.danhMucList.find(x => x.id === id);
    this.selectedDanhMucName = found ? found.ten : '';

    this.apiService.getChinhSachByDanhMuc(id)
      .subscribe(res => {
        this.chinhSachList = res;
        this.openedIndex = 0;
      });
  }
  toggleAccordion(index: number) {
    if (this.openedIndex === index) {
      this.openedIndex = null; // đóng nếu click lại
    } else {
      this.openedIndex = index; // mở cái mới (cái cũ tự đóng)
    }
  }
}