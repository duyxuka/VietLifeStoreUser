import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { environment } from '../../enviroments/enviroment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-chitietcamnang',
  templateUrl: './chitietcamnang.component.html',
  styleUrls: ['./chitietcamnang.component.css']
})
export class ChitietcamnangComponent implements OnInit {

  // ================= ARTICLE =================
  slug?: string;
  article: any | null = null;
  relatedArticles: any[] = [];
  categories: any[] = [];
  loading = false;
  errorMessage: string | null = null;
  mediaBaseUrl = environment.mediaUrl;

  // ================= COMMENTS =================
  comments: any[] = [];
  mainCommentText = '';

  // Reply state
  replyText = '';
  replyTargetId: string | null = null;  // id comment đang hiện reply input
  replyToName = '';                    // tên hiển thị trong placeholder
  replyParentId: string | null = null;  // ✅ parentId gửi backend = id comment được reply

  // UI state
  openDropdownId: string | null = null;
  openReplies: { [id: string]: boolean } = {};  // key = comment.id

  // Avatar colors (xoay vòng theo hash tên)
  private avatarColors = ['av-0', 'av-1', 'av-2', 'av-3', 'av-4'];
  userName: string | null = null;
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  // ============================================================
  //  LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) this.loadArticle();
    });
    this.loadCategories();
    this.userName = this.authService.getUserNameFromToken();
  }

  // ============================================================
  //  DANH MỤC
  // ============================================================

  loadCategories(): void {
    this.apiService.getDanhMucCamNangListAll().subscribe(res => {
      this.categories = res;
    });
  }

  // ============================================================
  //  BÀI VIẾT
  // ============================================================

  loadArticle(): void {
    if (!this.slug) return;
    this.loading = true;
    this.errorMessage = null;

    this.apiService.getCamNangBySlug(this.slug).subscribe({
      next: (res: any) => {
        this.article = res;
        this.loadComments(res.id);

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
        console.error(err);
        this.errorMessage = 'Không thể tải nội dung';
        this.loading = false;
      }
    });
  }

  // ============================================================
  //  LOAD COMMENTS
  //  Backend trả cây đúng → nhận thẳng, không rebuild
  // ============================================================

  loadComments(camNangId: string): void {
    this.apiService.getCommentsByCamNang(camNangId).subscribe((res: any) => {
      this.comments = this.initCommentTree(res);
    });
  }

  private initCommentTree(nodes: any[]): any[] {
    if (!nodes || nodes.length === 0) return [];
    return nodes.map(node => ({
      ...node,
      liked: node.liked ?? false,
      likeCount: node.likeCount ?? 0,
      replies: this.initCommentTree(node.replies ?? [])
    }));
  }

  // ============================================================
  //  HELPERS
  // ============================================================

  getInitial(name: string): string {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  }

  // Màu avatar cố định theo tên (hash đơn giản, cùng tên → cùng màu)
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return this.avatarColors[hash % this.avatarColors.length];
  }

  getTotalComments(): number {
    return this.countNodes(this.comments);
  }

  private countNodes(nodes: any[]): number {
    if (!nodes || nodes.length === 0) return 0;
    return nodes.reduce(
      (sum, node) => sum + 1 + this.countNodes(node.replies ?? []),
      0
    );
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  getImageUrl(fileName: string): string {
    return fileName ? this.mediaBaseUrl + fileName : '';
  }

  // ============================================================
  //  LIKE
  // ============================================================

  toggleLike(comment: any): void {
    comment.liked = !comment.liked;
    comment.likeCount = (comment.likeCount || 0) + (comment.liked ? 1 : -1);
  }

  // ============================================================
  //  DROPDOWN
  // ============================================================

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdownId = null;
  }

  copyComment(comment: any): void {
    navigator.clipboard?.writeText(comment.noiDung);
    this.openDropdownId = null;
  }

  deleteComment(id: string, parentId: string | null): void {
    if (!parentId) {
      this.comments = this.comments.filter(c => c.id !== id);
    } else {
      this.removeFromTree(this.comments, id, parentId);
    }
    this.openDropdownId = null;
  }

  private removeFromTree(nodes: any[], id: string, parentId: string): void {
    for (const node of nodes) {
      if (node.id === parentId) {
        node.replies = node.replies.filter((r: any) => r.id !== id);
        return;
      }
      if (node.replies?.length) {
        this.removeFromTree(node.replies, id, parentId);
      }
    }
  }

  // ============================================================
  //  TOGGLE REPLIES — mỗi node có toggle độc lập
  // ============================================================

  toggleReplies(commentId: string): void {
    this.openReplies[commentId] = !this.openReplies[commentId];
  }

  // ============================================================
  //  TOGGLE REPLY INPUT
  //
  //  targetId    : id comment được click "Phản hồi" → hiện input tại đây
  //  targetName  : tên dùng cho placeholder
  //  parentId    : ✅ id của comment này → gửi lên backend làm parentId
  //                (mỗi reply gán đúng cha trực tiếp, không cần flatten về root)
  // ============================================================

  toggleReplyInput(targetId: string, targetName: string, parentId: string): void {
    if (this.replyTargetId === targetId) {
      this.replyTargetId = null;
      this.replyToName = '';
      this.replyParentId = null;
      this.replyText = '';
    } else {
      this.replyTargetId = targetId;
      this.replyToName = targetName;
      this.replyParentId = parentId;  // ✅ id của chính comment này
      this.replyText = '';
    }
  }

  // ============================================================
  //  GỬI BÌNH LUẬN CHÍNH
  // ============================================================

  submitMain(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning("Bạn cần đăng nhập để bình luận");
      return;
    }
    if (!this.mainCommentText.trim() || !this.article) return;

    const payload = {
      camNangId: this.article.id,
      noiDung: this.mainCommentText.trim(),
      parentId: null
    };

    this.apiService.createComment(payload).subscribe({
      next: () => {
        this.mainCommentText = '';
        this.loadComments(this.article.id);
      },
      error: (err) => console.error('Lỗi gửi bình luận:', err)
    });
  }

  // ============================================================
  //  GỬI REPLY
  //  parentId = replyParentId = id của comment được reply trực tiếp
  //  Backend build cây đúng cấp nhờ parentId này
  // ============================================================

  submitReply(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning("Bạn cần đăng nhập để phản hồi");
      return;
    }
    if (!this.replyText.trim() || !this.article || !this.replyParentId) return;

    const payload = {
      camNangId: this.article.id,
      noiDung: this.replyText.trim(),
      parentId: this.replyParentId
    };

    this.apiService.createComment(payload).subscribe({
      next: () => {
        // Tự mở replies của comment cha sau khi gửi
        this.openReplies[this.replyParentId!] = true;

        this.replyText = '';
        this.replyTargetId = null;
        this.replyToName = '';
        this.replyParentId = null;

        this.loadComments(this.article.id);
      },
      error: (err) => console.error('Lỗi gửi phản hồi:', err)
    });
  }

}