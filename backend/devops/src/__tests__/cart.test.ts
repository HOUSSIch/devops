describe('Cart Module - Student 3', () => {
  type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
  };

  const calculateTotal = (cart: CartItem[]) =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  test('adds product to cart', () => {
    const cart: CartItem[] = [];
    const product = { id: 1, name: 'Serum', price: 80, quantity: 1 };

    cart.push(product);

    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Serum');
  });

  test('calculates cart total with quantities', () => {
    const cart = [
      { id: 1, name: 'Serum', price: 80, quantity: 2 },
      { id: 2, name: 'Cream', price: 45, quantity: 1 }
    ];

    expect(calculateTotal(cart)).toBe(205);
  });

  test('removes product from cart', () => {
    const cart = [
      { id: 1, name: 'Serum', price: 80, quantity: 1 },
      { id: 2, name: 'Cream', price: 45, quantity: 1 }
    ];

    const updatedCart = cart.filter(item => item.id !== 1);

    expect(updatedCart).toHaveLength(1);
    expect(updatedCart[0].name).toBe('Cream');
  });

  test('empty cart total should be zero', () => {
    expect(calculateTotal([])).toBe(0);
  });
});