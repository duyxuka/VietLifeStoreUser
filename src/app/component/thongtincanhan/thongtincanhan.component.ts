import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-thongtincanhan',
  templateUrl: './thongtincanhan.component.html',
  styleUrl: './thongtincanhan.component.css'
})
export class ThongtincanhanComponent implements OnInit {

  user:any;
  tab='account';

  password:any={
    oldPassword:'',
    newPassword:'',
    confirmPassword:''
  }

  constructor(private accountService:AuthService){}

  ngOnInit():void{
    this.loadProfile();
  }

  loadProfile(){
    this.accountService.getProfile().subscribe(res=>{
      this.user=res;
    });
  }

  updateProfile(){

    const data={
      name:this.user.name,
      phoneNumber:this.user.phoneNumber
    };

    this.accountService.updateProfile(data).subscribe(()=>{
      alert("Cập nhật thành công");
      this.loadProfile();
    });

  }

  changePassword(){

    if(this.password.newPassword!==this.password.confirmPassword){
      alert("Mật khẩu xác nhận không đúng");
      return;
    }

    this.accountService.changePassword({
      currentPassword:this.password.oldPassword,
      newPassword:this.password.newPassword
    }).subscribe(()=>{
      alert("Đổi mật khẩu thành công");
      this.password={
        oldPassword:'',
        newPassword:'',
        confirmPassword:''
      }
    });

  }

  orders = [
    { id:1023,date:'01/03/2026',total:1250000,status:'done'},
    { id:1024,date:'03/03/2026',total:890000,status:'pending'}
  ];

  get totalSpent(){
    return this.orders
      .filter(o=>o.status==='done')
      .reduce((sum,o)=>sum+o.total,0);
  }

  logout(){
    this.accountService.logout();
    location.href="/login";
  }

}