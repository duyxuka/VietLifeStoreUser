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
import { DangnhapComponent } from './component/dangnhap/dangnhap.component';
import { DangkyComponent } from './component/dangky/dangky.component';
import { ChinhsachComponent } from './component/chinhsach/chinhsach.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import {NgxPaginationModule} from 'ngx-pagination';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DanhmucsanphamComponent } from './component/danhmucsanpham/danhmucsanpham.component';
import { DanhmuccamnangComponent } from './component/danhmuccamnang/danhmuccamnang.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { ThongtincanhanComponent } from './component/thongtincanhan/thongtincanhan.component';
import { authInterceptor } from './auth.interceptor';
import { PaymentComponent } from './component/payment/payment.component';
import { DathangthanhcongComponent } from './component/dathangthanhcong/dathangthanhcong.component';
import { NumberShortPipe } from './number-short.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

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
    DangnhapComponent,
    DangkyComponent,
    ChinhsachComponent,
    DanhmucsanphamComponent,
    DanhmuccamnangComponent,
    ResetPasswordComponent,
    ThongtincanhanComponent,
    PaymentComponent,
    DathangthanhcongComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CarouselModule,
    NgxPaginationModule,
    FormsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      tapToDismiss: true
    }),
    ReactiveFormsModule,
    NumberShortPipe,
  ],
  providers: [
    provideAnimations(),
    // provideClientHydration(),
    provideHttpClient(
    withFetch(),
    withInterceptors([authInterceptor])
  )
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
