jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() => jest.fn()),
}));

jest.mock('passport-jwt', () => ({
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: jest.fn(() => 'bearer-token-extractor'),
  },
  Strategy: class StrategyMock {},
}));

import * as jwksRsa from 'jwks-rsa';
import { KeycloakJwtStrategy } from './keycloak-jwt.strategy';

describe('KeycloakJwtStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures JWKS based on the expected Keycloak realm', () => {
    const strategy = new KeycloakJwtStrategy();

    expect(jwksRsa.passportJwtSecret).toHaveBeenCalledWith(
      expect.objectContaining({
        jwksUri:
          'http://localhost:8085/realms/deepskyn/protocol/openid-connect/certs',
      }),
    );
    expect(strategy).toBeDefined();
  });

  it('returns the JWT payload unchanged from validate', async () => {
    const strategy = new KeycloakJwtStrategy();
    const payload = { sub: 'kc-1', email: 'test@example.com' };

    await expect(strategy.validate(payload)).resolves.toEqual(payload);
  });
});