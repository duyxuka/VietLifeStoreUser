import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BabyStore';
  danhMucs: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDanhMuc();
  }
  loadDanhMuc(): void {
    this.apiService.getListAll().subscribe(res => {
      this.danhMucs = res || [];
    });
  }
}
