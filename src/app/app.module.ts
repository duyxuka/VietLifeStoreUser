import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrangchuComponent } from './component/trangchu/trangchu.component';
import { DanhsachsanphamComponent } from './component/danhsachsanpham/danhsachsanpham.component';
import { ChitietsanphamComponent } from './component/chitietsanpham/chitietsanpham.component';
import { GiohangComponent } from './component/giohang/giohang.component';
import { ThanhtoanComponent } from './component/thanhtoan/thanhtoan.component';
import { LienheComponent } from './component/lienhe/lienhe.component';
import { DanhsachcamnangComponent } from './component/danhsachcamnang/danhsachcamnang.component';
import { ChitietcamnangComponent } from './component/chitietcamnang/chitietcamnang.component';
import { TimkiemsanphamComponent } from './component/timkiemsanpham/timkiemsanpham.component';
import { DangnhapComponent } from './component/dangnhap/dangnhap.component';
import { DangkyComponent } from './component/dangky/dangky.component';
import { ChinhsachComponent } from './component/chinhsach/chinhsach.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import {NgxPaginationModule} from 'ngx-pagination';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    TrangchuComponent,
    DanhsachsanphamComponent,
    ChitietsanphamComponent,
    GiohangComponent,
    ThanhtoanComponent,
    LienheComponent,
    DanhsachcamnangComponent,
    ChitietcamnangComponent,
    TimkiemsanphamComponent,
    DangnhapComponent,
    DangkyComponent,
    ChinhsachComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CarouselModule,
    NgxPaginationModule
  ],
  providers: [
    provideAnimations(),
    provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
