import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const baseUrl = 'https://localhost:44385/api/app/';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private httpClient: HttpClient) { }

  getAllBanner(): Observable<any> {
    return this.httpClient.get<any>(`${baseUrl}banners/all`);
  }
  getListAll(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${baseUrl}danh-muc-san-phams/all`);
  }

  getByDanhMuc(id: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${baseUrl}san-phams/by-danh-muc/${id}`);
  }
}
