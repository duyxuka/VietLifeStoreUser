import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class TrackingService implements OnDestroy {
  private hubConnection: signalR.HubConnection | null = null;
  private isBrowser: boolean;

  private _onlineCount$ = new BehaviorSubject<number>(0);
  onlineCount$ = this._onlineCount$.asObservable();

  // Thêm: theo dõi trạng thái kết nối để debug
  private _connectionState$ = new BehaviorSubject<string>('Chưa kết nối');
  connectionState$ = this._connectionState$.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  startConnection(): void {
    if (!this.isBrowser) return;
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.url}hubs/tracking`, {
        accessTokenFactory: () => ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Lắng nghe các sự kiện thay đổi trạng thái kết nối
    this.hubConnection.onreconnecting(err => {
      this._connectionState$.next('Đang kết nối lại...');
      console.warn('[TrackingHub] Mất kết nối, đang thử lại:', err?.message);
    });

    this.hubConnection.onreconnected(connectionId => {
      this._connectionState$.next('Đã kết nối');
      console.log('[TrackingHub] Kết nối lại thành công, id:', connectionId);
    });

    this.hubConnection.onclose(err => {
      this._connectionState$.next('Mất kết nối');
      console.error('[TrackingHub] Đóng kết nối:', err?.message);
    });

    // Lắng nghe số online từ server
    this.hubConnection.on('OnlineCountUpdated', (count: number) => {
      this._onlineCount$.next(count);
    });

    // Khởi động và log kết quả rõ ràng
    this._connectionState$.next('Đang kết nối...');
    this.hubConnection
      .start()
      .then(() => {
        // Vào đây = kết nối thành công
        this._connectionState$.next('Đã kết nối');
        console.log('[TrackingHub] Kết nối thành công ✓');
      })
      .catch(err => {
        // Vào đây = kết nối thất bại
        this._connectionState$.next('Lỗi kết nối');
        console.error('[TrackingHub] Kết nối thất bại:', err);
      });
  }

  ngOnDestroy(): void {
    this.hubConnection?.stop();
  }
}