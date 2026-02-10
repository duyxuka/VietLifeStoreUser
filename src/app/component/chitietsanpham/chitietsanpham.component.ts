import { Component } from '@angular/core';

@Component({
  selector: 'app-chitietsanpham',
  templateUrl: './chitietsanpham.component.html',
  styleUrl: './chitietsanpham.component.css'
})
export class ChitietsanphamComponent {
  images: string[] = [
    'assets/img/product/post-card1-6.png',
    'assets/img/product/post-card1-7.png',
    'assets/img/product/post-card1-8.png',
    'assets/img/product/post-card1-9.png'
  ];

  mainImage: string = this.images[0];

  changeImage(img: string) {
    this.mainImage = img;
  }
}
