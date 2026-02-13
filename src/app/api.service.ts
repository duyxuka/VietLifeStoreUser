import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getAllBanner(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}banners/all`);
  }
  getListAll(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}danh-muc-san-phams/all`);
  }

  getByDanhMuc(slug: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}san-phams/by-danh-muc`, { params: { slug } });
  }
  getSanPhamBySlug(slug: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}san-phams/by-slug?slug=${slug}`);
  }
  getSanPhamBanChay(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}san-phams/top-ban-chay?top=6`);
  }
  getCamNangHomeMoiNhat(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}cam-nangs/latest-cam-nang-home?take=4`);
  }
  getListFilterSanPham(filter: {
    keyword?: string;
    sort?: string;
    danhMucSlug?: string;
    skipCount: number;
    maxResultCount: number;
  }): Observable<{
    items: any[];
    totalCount: number;
  }> {

    let params = new HttpParams()
      .set('skipCount', filter.skipCount)
      .set('maxResultCount', filter.maxResultCount);
    if (filter.danhMucSlug) {
      params = params.set('danhMucSlug', filter.danhMucSlug);
    }

    if (filter.keyword) {
      params = params.set('keyword', filter.keyword);
    }

    if (filter.sort) {
      params = params.set('sort', filter.sort);
    }

    return this.httpClient.get<{
      items: any[];
      totalCount: number;
    }>(`${this.baseUrl}san-phams/filter`, { params });
  }
  getImageSanPham(fileName: string): Observable<string> {
    return this.httpClient.get(`${this.baseUrl}san-phams/image`, {
      params: { fileName: fileName },
      responseType: 'text'
    });
  }
  getImageBanner(fileName: string): Observable<string> {
    return this.httpClient.get(`${this.baseUrl}banners/image`, {
      params: { fileName: fileName },
      responseType: 'text'
    });
  }
  getImageCamNang(fileName: string): Observable<string> {
    return this.httpClient.get(`${this.baseUrl}cam-nangs/image`, {
      params: { fileName: fileName },
      responseType: 'text'
    });
  }

}
