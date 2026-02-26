import { Component, OnInit } from '@angular/core';
import { CartService } from '../../cart.service';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-giohang',
  templateUrl: './giohang.component.html',
  styleUrl: './giohang.component.css'
})
export class GiohangComponent implements OnInit {

  cartItems: any[] = [];
  totalPrice = 0;
  mediaBaseUrl = environment.mediaUrl;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }

  getImageUrl(fileName: string): string {
    return fileName
      ? this.mediaBaseUrl + fileName
      : 'assets/img/no-image.png';
  }

  removeItem(id: string, bienTheId: string | null) {
    this.cartService.removeFromCart(id, bienTheId);
  }

  increase(item: any) {
    item.quantity++;
    this.cartService.updateQuantity(item.id, item.bienTheId, item.quantity);
  }

  decrease(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartService.updateQuantity(item.id, item.bienTheId, item.quantity);
    }
  }
}