import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;
  private UrlAuth = environment.url;

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

  createPayment(orderId: string): Observable<any> {
    return this.httpClient.post(`${this.UrlAuth}api/payment/create-url?orderId=${orderId}`, {});
  }

  postPayment(data: any) {
    return this.httpClient.post(`${this.baseUrl}payment-information-models`, data);
  }

  validateVoucher(code: string, orderTotal: number): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}vouchers/validate-voucher?code=${code}&orderTotal=${orderTotal}`, {});
  }

  getMyVouchersWithStatus(orderTotal: number): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}vouchers/my-vouchers-with-status?orderTotal=${orderTotal}`
    );
  }

  cancelOrder(id: string) {
    return this.httpClient.post(`${this.baseUrl}don-hangs/${id}/cancel-order`, {});
  }

  getCommentsByCamNang(id: string) {
    return this.httpClient.get(`${this.baseUrl}cam-nang-comment/by-cam-nang/${id}`);
  }

  createComment(data: any) {
    return this.httpClient.post(`${this.baseUrl}cam-nang-comment`, data);
  }

  getReviewsByProduct(productId: string) {
    return this.httpClient.get<any>(`${this.baseUrl}san-pham-reviews/by-san-pham/${productId}`);
  }

  createReview(data: any) {
    return this.httpClient.post(`${this.baseUrl}san-pham-reviews`, data);
  }

  // Trang chủ — tất cả voucher toàn shop
  getListAllVouchers(phamVi?: number): Observable<any[]> {
    let url = `${this.baseUrl}vouchers/all`;
    if (phamVi) url += `?phamVi=${phamVi}`;
    return this.httpClient.get<any[]>(url);
  }

  // Trang danh mục — voucher toàn shop + voucher danh mục đó
  getVouchersByDanhMuc(danhMucId: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}vouchers/all?danhMucId=${danhMucId}`
    );
  }

  // Trang chi tiết SP — voucher toàn shop + voucher sản phẩm đó
  getVouchersBySanPham(sanPhamId: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.baseUrl}vouchers/all?sanPhamId=${sanPhamId}`
    );
  }

  nhanVoucher(voucherId: string): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}vouchers/nhan-voucher/${voucherId}`, {});
  }
  getMyVouchers(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}vouchers/my-vouchers`);
  }

  tangLuotXem(productId: string) {
    return this.httpClient.post(`${this.baseUrl}san-phams/tang-luot-xem/${productId}`, {});
  }
}
