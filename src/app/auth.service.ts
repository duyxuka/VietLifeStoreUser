import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(private http: HttpClient) { }

    login(emailOrPhone: string, password: string) {

        // Bước 1: lấy username thật
        return this.http.get(
            `https://localhost:44385/api/app/account/resolve-user-name?emailOrPhone=${emailOrPhone}`,
            { responseType: 'text' }
        ).pipe(
            switchMap(username => {

                const body = new HttpParams()
                    .set('username', username)
                    .set('password', password)
                    .set('grant_type', 'password')
                    .set('client_id', 'VietlifeStore_App')
                    .set('client_secret', '1q2w3e*')
                    .set('scope', 'VietlifeStore offline_access');

                return this.http.post<any>(
                    'https://localhost:44385/connect/token',
                    body.toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );
            })
        );
    }

    register(data: any) {
        return this.http.post(
            'https://localhost:44385/api/app/account/register',
            data
        );
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}