import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-chitietcamnang',
  templateUrl: './chitietcamnang.component.html',
  styleUrls: ['./chitietcamnang.component.css']
})
export class ChitietcamnangComponent implements OnInit {

  slug?: string;
  article: any | null = null;
  relatedArticles: any[] = [];
  categories: any[] = [];

  loading = false;
  errorMessage: string | null = null;

  mediaBaseUrl = environment.mediaUrl;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.loadArticle();
      }
    });
    this.loadCategories();
  }
  // ================= LOAD DANH MỤC =================
  loadCategories(): void {
    this.apiService.getDanhMucCamNangListAll()
      .subscribe(res => {
        this.categories = res;
      });
  }
  loadArticle(): void {
    if (!this.slug) return;

    this.loading = true;
    this.errorMessage = null;

    this.apiService.getCamNangBySlug(this.slug).subscribe({
      next: (res: any) => {
        this.article = res;

        // Load bài liên quan theo danh mục
        if (res.slugDanhMuc) {
          this.apiService
            .getByDanhMucCamNang(res.slugDanhMuc)
            .subscribe((related: any[]) => {
              this.relatedArticles = related
                .filter(x => x.slug !== this.slug)
                .slice(0, 5);
            });
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải cẩm nang:', err);
        this.errorMessage = 'Không thể tải nội dung. Vui lòng thử lại sau.';
        this.loading = false;
      }
    });
  }

  getImageUrl(fileName: string): string {
    return fileName
      ? this.mediaBaseUrl + fileName
      : 'assets/img/no-image.png';
  }
}