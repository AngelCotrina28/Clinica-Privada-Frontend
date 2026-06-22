import { Injectable } from '@angular/core';

interface StorageOptions {
  cookie?: boolean;
  maxAgeSeconds?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getString(key: string): string | null {
    return this.storage?.getItem(key) ?? this.getCookie(key);
  }

  setString(key: string, value: string, options: StorageOptions = {}): void {
    this.storage?.setItem(key, value);

    if (options.cookie) {
      this.setCookie(key, value, options.maxAgeSeconds);
    }
  }

  getObject<T>(key: string): T | null {
    const raw = this.getString(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      this.remove(key);
      return null;
    }
  }

  setObject<T>(key: string, value: T): void {
    this.setString(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage?.removeItem(key);
    this.deleteCookie(key);
  }

  private get storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }

  private getCookie(key: string): string | null {
    if (typeof document === 'undefined') return null;

    const prefijo = `${encodeURIComponent(key)}=`;
    const cookie = document.cookie
      .split('; ')
      .find(item => item.startsWith(prefijo));

    return cookie ? decodeURIComponent(cookie.slice(prefijo.length)) : null;
  }

  private setCookie(key: string, value: string, maxAgeSeconds = 60 * 60 * 8): void {
    if (typeof document === 'undefined') return;

    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
  }

  private deleteCookie(key: string): void {
    if (typeof document === 'undefined') return;

    document.cookie = `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}
