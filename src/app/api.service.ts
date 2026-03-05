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
  getDanhMucSPListAll(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}danh-muc-san-phams/all`);
  }

  getDanhMucCamNangListAll(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}danh-muc-cam-nangs/all`);
  }

  getByDanhMucSP(slug: string): Observable<any[]> {
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

  getListFilterCamNang(filter: {
    keyword?: string;
    skipCount: number;
    danhMucSlug?: string;
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

    return this.httpClient.get<{
      items: any[];
      totalCount: number;
    }>(`${this.baseUrl}cam-nangs/filter`, { params });
  }
  getCamNangBySlug(slug: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}cam-nangs/by-slug?slug=${slug}`);
  }
  getByDanhMucCamNang(slug: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}cam-nangs/by-danh-muc`, { params: { slug } });
  }

  createLienHe(data: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}lien-hes`,
      data
    );
  }

  // ================= DANH MỤC CHÍNH SÁCH =================
  getDanhMucChinhSachAll(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}danh-muc-chinh-sachs/all`
    );
  }

  // ================= CHÍNH SÁCH THEO DANH MỤC =================
  getChinhSachByDanhMuc(danhMucId: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}chinh-sachs/by-danh-muc-id/${danhMucId}`
    );
  }
  getTikTokVideos(section: string = 'HomePage'): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}social-videos/by-section`,
      { params: { section } }
    );
  }

  createDonHang(data: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}don-hangs`,
      data
    );
  }
}
