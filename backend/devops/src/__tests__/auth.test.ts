describe('Auth Module - Student 1', () => {
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPassword = (password: string) =>
    password.length >= 6 && /\d/.test(password);

  test('valid email should be accepted', () => {
    expect(isValidEmail('client@gmail.com')).toBe(true);
  });

  test('invalid email should be rejected', () => {
    expect(isValidEmail('clientgmail.com')).toBe(false);
  });

  test('password should contain at least 6 characters and number', () => {
    expect(isValidPassword('test123')).toBe(true);
  });

  test('weak password should be rejected', () => {
    expect(isValidPassword('abc')).toBe(false);
  });
});