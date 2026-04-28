import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { CartPage } from "../app/pages/CartPage";

const { mockNavigate, mockUpdateQuantity, mockRemoveItem, mockUseCart } = vi.hoisted(
  () => ({
    mockNavigate: vi.fn(),
    mockUpdateQuantity: vi.fn(),
    mockRemoveItem: vi.fn(),
    mockUseCart: vi.fn(),
  }),
);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../app/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

function buildItem(quantity = 2) {
  return {
    id: "item-1",
    name: "Sample Serum",
    brand: "DeepHydra",
    price: "$60.00",
    image: "https://example.com/serum.jpg",
    url: "https://example.com/serum",
    quantity,
  };
}

beforeEach(() => {
  window.history.pushState({}, "", "/cart");
  mockNavigate.mockReset();
  mockUpdateQuantity.mockReset();
  mockRemoveItem.mockReset();
  mockUseCart.mockReturnValue({
    cartItems: [],
    updateQuantity: mockUpdateQuantity,
    removeItem: mockRemoveItem,
    loading: false,
  });
});

describe("CartPage", () => {
  test("renders the empty cart state and routes to products", async () => {
    const user = userEvent.setup();

    render(<CartPage />);

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /browse products/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/products");
  });

  test("renders the loading state while the cart is being fetched", () => {
    mockUseCart.mockReturnValue({
      cartItems: [],
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      loading: true,
    });

    render(<CartPage />);

    expect(screen.getByText(/loading your cart/i)).toBeInTheDocument();
  });

  test("shows cart totals and updates item quantity", async () => {
    const user = userEvent.setup();

    mockUseCart.mockReturnValue({
      cartItems: [buildItem(2)],
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      loading: false,
    });

    render(<CartPage />);

    expect(screen.getByText("Sample Serum")).toBeInTheDocument();
    expect(screen.getByText("$60.00 each")).toBeInTheDocument();
    expect(screen.getByText("$108.00")).toBeInTheDocument();
    expect(screen.getByText(/discount/i)).toBeInTheDocument();
    expect(screen.getAllByText("$120.00").length).toBeGreaterThan(0);

    const card = screen.getByText("Sample Serum").closest(".glass-card") as HTMLElement;
    const itemButtons = within(card).getAllByRole("button");

    await user.click(itemButtons[2]);

    expect(mockUpdateQuantity).toHaveBeenCalledWith("item-1", 3);
  });

  test("removes an item from the cart", async () => {
    const user = userEvent.setup();

    mockUseCart.mockReturnValue({
      cartItems: [buildItem(1)],
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      loading: false,
    });

    render(<CartPage />);

    const card = screen.getByText("Sample Serum").closest(".glass-card") as HTMLElement;
    const itemButtons = within(card).getAllByRole("button");

    await user.click(itemButtons[0]);

    expect(mockRemoveItem).toHaveBeenCalledWith("item-1");
  });

  test("routes from the cart summary to checkout", async () => {
    const user = userEvent.setup();

    mockUseCart.mockReturnValue({
      cartItems: [buildItem(1)],
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      loading: false,
    });

    render(<CartPage />);

    await user.click(screen.getByRole("button", { name: /proceed to checkout/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });
});