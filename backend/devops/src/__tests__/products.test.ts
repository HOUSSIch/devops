describe('Products Module - Student 2', () => {
  const products = [
    { id: 1, name: 'Hydrating Serum', category: 'Skincare', price: 80, stock: 10 },
    { id: 2, name: 'Face Cream', category: 'Skincare', price: 45, stock: 0 },
    { id: 3, name: 'Cleanser', category: 'Skincare', price: 30, stock: 5 }
  ];

  test('product should have required fields', () => {
    const product = products[0];

    expect(product.id).toBeDefined();
    expect(product.name).toBeDefined();
    expect(product.category).toBe('Skincare');
    expect(product.price).toBeGreaterThan(0);
  });

  test('available products should be filtered correctly', () => {
    const availableProducts = products.filter(product => product.stock > 0);

    expect(availableProducts).toHaveLength(2);
  });

  test('discount price should be lower than original price', () => {
    const originalPrice = 100;
    const discount = 20;
    const finalPrice = originalPrice - (originalPrice * discount) / 100;

    expect(finalPrice).toBe(80);
    expect(finalPrice).toBeLessThan(originalPrice);
  });

  test('search should return matching product by name', () => {
    const keyword = 'serum';
    const result = products.filter(product =>
      product.name.toLowerCase().includes(keyword)
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Hydrating Serum');
  });
});