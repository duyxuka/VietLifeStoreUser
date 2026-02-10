import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrangchuComponent } from './component/trangchu/trangchu.component';
import { DanhsachsanphamComponent } from './component/danhsachsanpham/danhsachsanpham.component';
import { ChitietsanphamComponent } from './component/chitietsanpham/chitietsanpham.component';
import { DanhsachcamnangComponent } from './component/danhsachcamnang/danhsachcamnang.component';
import { ChitietcamnangComponent } from './component/chitietcamnang/chitietcamnang.component';
import { DangnhapComponent } from './component/dangnhap/dangnhap.component';
import { DangkyComponent } from './component/dangky/dangky.component';
import { GiohangComponent } from './component/giohang/giohang.component';
import { ThanhtoanComponent } from './component/thanhtoan/thanhtoan.component';
import { TimkiemsanphamComponent } from './component/timkiemsanpham/timkiemsanpham.component';
import { LienheComponent } from './component/lienhe/lienhe.component';
import { ChinhsachComponent } from './component/chinhsach/chinhsach.component';

const routes: Routes = [
  { path: '', component: TrangchuComponent },
  { path: 'danhsachsanpham', component: DanhsachsanphamComponent },
  { path: 'chitietsanpham', component: ChitietsanphamComponent },
  { path: 'danhsachcamnang', component: DanhsachcamnangComponent },
  { path: 'chitietcamnang', component: ChitietcamnangComponent },
  { path: 'dangnhap', component: DangnhapComponent },
  { path: 'dangky', component: DangkyComponent },
  { path: 'giohang', component: GiohangComponent },
  { path: 'thanhtoan', component: ThanhtoanComponent },
  { path: 'timkiemsanpham', component: TimkiemsanphamComponent },
  { path: 'lienhe', component: LienheComponent },
  { path: 'chinhsach', component: ChinhsachComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
