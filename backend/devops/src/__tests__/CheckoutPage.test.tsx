import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { CheckoutPage } from "../app/pages/CheckoutPage";

const { mockNavigate, mockUseAuth, mockUseCart } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseAuth: vi.fn(),
  mockUseCart: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../app/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../app/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

function buildCartItems() {
  return [
    { name: "Cleanser", price: "$30.00", quantity: 1 },
    { name: "Serum", price: "$45.00", quantity: 2 },
  ];
}

function buildAuthState(token: string | null) {
  return {
    isInitialized: true,
    isAuthenticated: !!token,
    token,
    username: token ? "alex" : null,
    roles: [],
    isAdmin: false,
    subscriptionTier: "FREE",
    hasRole: () => false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshNow: vi.fn(),
    syncProfile: vi.fn(),
  };
}

async function fillCheckoutForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("John Doe"), "Jane Doe");
  await user.type(screen.getByPlaceholderText("john@example.com"), "jane@example.com");
  await user.type(screen.getByPlaceholderText("123 Main Street"), "42 Skin Ave");
  await user.type(screen.getByPlaceholderText("New York"), "San Francisco");
  await user.type(screen.getByPlaceholderText("10001"), "94102");
  await user.type(screen.getByPlaceholderText("1234 5678 9012 3456"), "4111111111111111");
  await user.type(screen.getByPlaceholderText("MM/YY"), "12/29");
  await user.type(screen.getByPlaceholderText("123"), "123");
}

beforeEach(() => {
  window.history.pushState({}, "", "/checkout");
  mockNavigate.mockReset();
  mockUseAuth.mockReset();
  mockUseCart.mockReset();
  mockUseCart.mockReturnValue({ cartItems: buildCartItems() });
});

describe("CheckoutPage", () => {
  test("renders the order summary and total from cart items", () => {
    mockUseAuth.mockReturnValue(buildAuthState("token-123"));

    render(<CheckoutPage />);

    expect(screen.getByText("Secure Checkout")).toBeInTheDocument();
    expect(screen.getByText("Cleanser x1")).toBeInTheDocument();
    expect(screen.getByText("Serum x2")).toBeInTheDocument();
    expect(screen.getAllByText("$120.00").length).toBeGreaterThan(0);
    expect(screen.getByText("$128.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete purchase - \$128\.00/i })).toBeInTheDocument();
  });

  test("submits the checkout form and navigates to confirmation on success", async () => {
    const user = userEvent.setup();
    const order = { id: "order-1", total: 128 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => order,
    });

    vi.stubGlobal("fetch", fetchMock);
    mockUseAuth.mockReturnValue(buildAuthState("token-123"));
    mockUseCart.mockReturnValue({ cartItems: buildCartItems() });

    render(<CheckoutPage />);

    await fillCheckoutForm(user);
    const form = screen.getByRole("button", { name: /complete purchase - \$128\.00/i })
      .closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    await screen.findByRole("button", { name: /complete purchase - \$128\.00/i });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/cart/checkout",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer token-123",
        },
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/confirmation", { state: { order } });
  });

  test("does not submit when no auth token is available", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
    mockUseAuth.mockReturnValue(buildAuthState(null));

    render(<CheckoutPage />);

    await fillCheckoutForm(user);
    const form = screen.getByRole("button", { name: /complete purchase - \$128\.00/i })
      .closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});