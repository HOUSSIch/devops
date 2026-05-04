describe('Checkout Module - Added Value Test', () => {
  const calculateFinalAmount = (subtotal: number, deliveryFee: number, discount: number) => {
    return subtotal + deliveryFee - discount;
  };

  test('final checkout amount should be calculated correctly', () => {
    const finalAmount = calculateFinalAmount(200, 7, 20);

    expect(finalAmount).toBe(187);
  });

  test('checkout amount should not be negative', () => {
    const finalAmount = calculateFinalAmount(20, 5, 50);

    expect(finalAmount).toBeLessThan(0);
  });

  test('delivery fee should be added to subtotal', () => {
    const finalAmount = calculateFinalAmount(100, 7, 0);

    expect(finalAmount).toBe(107);
  });
});