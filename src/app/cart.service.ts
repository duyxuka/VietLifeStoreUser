import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private cartItems: any[] = [];
    private cartSubject = new BehaviorSubject<any[]>([]);
    cart$ = this.cartSubject.asObservable();

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private toastr: ToastrService) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        // Chỉ chạy localStorage khi ở browser
        if (this.isBrowser) {
            const stored = localStorage.getItem('cart');
            if (stored) {
                this.cartItems = JSON.parse(stored);
                this.cartSubject.next(this.cartItems);
            }
        }
    }

    getCart() {
        return this.cartItems;
    }

    addToCart(product: any) {

        const existing = this.cartItems.find(p =>
            p.id === product.id &&
            p.bienTheId === product.bienTheId
        );

        if (existing) {
            existing.quantity += product.quantity || 1;
        } else {
            this.cartItems.push({
                ...product,
                quantity: product.quantity || 1
            });
        }

        this.updateCart();
        this.toastr.success("Đã thêm vào giỏ hàng");
    }

    removeFromCart(id: string, bienTheId: string | null) {

        this.cartItems = this.cartItems.filter(p =>
            !(p.id === id && p.bienTheId === bienTheId)
        );

        this.updateCart();
        this.toastr.success("Đã xóa khỏi giỏ hàng");
    }

    clearCart() {
        this.cartItems = [];
        this.updateCart();
        this.toastr.success("Đã xóa hết giỏ hàng")
    }

    private updateCart() {
        // Chỉ lưu localStorage khi ở browser
        if (this.isBrowser) {
            localStorage.setItem('cart', JSON.stringify(this.cartItems));
        }
        this.cartSubject.next(this.cartItems);
    }

    getTotalQuantity(): number {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotalPrice(): number {
        return this.cartItems.reduce((sum, item) =>
            sum + (item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia) * item.quantity
            , 0);
    }
    
    updateQuantity(id: string, bienTheId: string | null, quantity: number) {
        const item = this.cartItems.find(p =>
            p.id === id && p.bienTheId === bienTheId
        );
        if (item) {
            item.quantity = quantity;
            this.updateCart();
        }
    }
}