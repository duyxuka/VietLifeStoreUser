import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { switchMap } from 'rxjs';
import { environment } from './enviroments/enviroment';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

    ApiUrl = environment.apiUrl;
    url = environment.url;

    private isBrowser: boolean;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    login(emailOrPhone: string, password: string) {

        return this.http.get(
            `${this.ApiUrl}account/resolve-user-name?emailOrPhone=${emailOrPhone}`,
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
                    `${this.url}connect/token`,
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
            `${this.ApiUrl}account/register`,
            data
        );
    }

    logout() {
        if (!this.isBrowser) return;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
    saveTokens(accessToken: string, refreshToken?: string) {
        if (!this.isBrowser) return;

        localStorage.setItem('access_token', accessToken);

        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }
    getAccessToken(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem('refresh_token');
    }

    getUserIdFromToken(): string | null {

        const token = this.getAccessToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.sub;
        } catch {
            return null;
        }
    }
    getUserNameFromToken(): string | null {

        const token = this.getAccessToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.given_name ||
                decoded.preferred_username ||
                null;
        } catch {
            return null;
        }
    }

    isLoggedIn(): boolean {
        return !!this.getAccessToken();
    }

    forgotPassword(email: string) {
        return this.http.post(
            environment.apiUrl + 'account/forgot-password?email=' + email,
            {}
        );
    }
    resetPassword(data: any) {
        const url =
            environment.apiUrl +
            `account/reset-password/${data.userId}?token=${encodeURIComponent(data.token)}&newPassword=${encodeURIComponent(data.newPassword)}`;

        return this.http.post(url, {});
    }

    getProfile() {
        return this.http.get<any>(environment.apiUrl + 'account/profile');
    }
    updateProfile(data: any) {
        return this.http.post(
            environment.apiUrl + 'account/update-profile',
            data
        );
    }

    changePassword(data: any) {
        return this.http.post(
            environment.apiUrl + 'account/change-password',
            data
        );
    }
    refreshToken() {

        const refreshToken = this.getRefreshToken();

        const body = new URLSearchParams();
        body.set('grant_type', 'refresh_token');
        body.set('client_id', 'VietlifeStore_App');
        body.set('client_secret', '1q2w3e*');
        body.set('refresh_token', refreshToken!);

        return this.http.post<any>(
            this.url + 'connect/token',
            body.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    }
}