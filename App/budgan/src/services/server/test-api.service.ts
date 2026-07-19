import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ServerOnly } from './server-only.decorator';

export interface TestApiService {
  test(): Promise<string>;
}

export const TEST_API_SERVICE = new InjectionToken<TestApiService>('TestApiService');

@ServerOnly
@Injectable({ providedIn: 'root' })
export class TestApiServiceImpl implements TestApiService {
  private readonly _http = inject(HttpClient);

  test(): Promise<string> {
    return firstValueFrom(this._http.get('/api/Test', { responseType: 'text' }));
  }
}
