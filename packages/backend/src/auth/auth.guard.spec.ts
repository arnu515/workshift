import { IsLoggedIn } from './auth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new IsLoggedIn()).toBeDefined();
  });
});
