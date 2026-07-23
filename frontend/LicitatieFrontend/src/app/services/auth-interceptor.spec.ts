import { AuthInterceptor } from './auth-interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;

  beforeEach(() => {
    interceptor = new AuthInterceptor();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
