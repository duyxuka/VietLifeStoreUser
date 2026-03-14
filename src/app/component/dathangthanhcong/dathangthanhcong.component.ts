import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dathangthanhcong',
  templateUrl: './dathangthanhcong.component.html',
  styleUrl: './dathangthanhcong.component.css'
})
export class DathangthanhcongComponent implements OnInit {
  orderId: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
  }
}
