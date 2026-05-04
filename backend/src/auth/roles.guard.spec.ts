import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  } as any;

  const createContext = (roles?: string[]): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          user: roles ? { realm_access: { roles } } : undefined,
        })),
      })),
    }) as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get(RolesGuard);
  });

  it('allows access when no roles are required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows access when the user has one of the required roles', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin', 'manager']);

    expect(guard.canActivate(createContext(['manager']))).toBe(true);
  });

  it('throws ForbiddenException when the user lacks the required role', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);

    expect(() => guard.canActivate(createContext(['user']))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when the request has no roles', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);

    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });
});
