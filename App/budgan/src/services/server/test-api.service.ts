import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TestApiService {
  test(): Promise<string>;
}

export const TEST_API_SERVICE = new InjectionToken<TestApiService>('TestApiService');

@Injectable({ providedIn: 'root' })
export class TestApiServiceImpl implements TestApiService {
  private readonly _http = inject(HttpClient);

  test(): Promise<string> {
    return firstValueFrom(this._http.get('/api/Test', { responseType: 'text' }));
  }
}

@Injectable({ providedIn: 'root' })
export class TestApiServiceNoopImpl implements TestApiService {
  test(): Promise<string> {
    throw new Error('TestApiService is only available in server mode.');
  }
}
