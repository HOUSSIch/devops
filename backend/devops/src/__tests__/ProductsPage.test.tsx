import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProductsPage } from "../app/pages/ProductsPage";

const { mockNavigate, mockAddItem } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAddItem: vi.fn(),
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

vi.mock("../app/contexts/CartContext", () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

function buildAnalysis() {
  return {
    skinType: "Oily",
    healthScore: 84,
    skinAge: 25,
    summary: "Oily skin with acne-prone tendencies.",
    concerns: [
      {
        label: "Acne",
        severity: "Moderate",
        description: "Breakouts around the T-zone",
      },
    ],
    morningRoutine: [],
    eveningRoutine: [],
  };
}

function buildProduct() {
  return {
    name: "Glow Cream",
    brand: "DeepHydra",
    price: "$42.00",
    benefits: ["Hydration", "Barrier support"],
    match: 96,
    image: "https://example.com/glow-cream.jpg",
    rating: 4.8,
    url: "https://example.com/glow-cream",
    safeForAllergies: true,
    hasConflicts: true,
    conflictWarning: "Avoid pairing with strong exfoliants.",
    keyIngredients: ["Ceramides", "Squalane"],
  };
}

beforeEach(() => {
  window.history.pushState({}, "", "/products");
  mockNavigate.mockReset();
  mockAddItem.mockReset();
  localStorage.clear();
});

describe("ProductsPage", () => {
  test("shows the empty analysis state when no skin analysis exists", async () => {
    const user = userEvent.setup();

    vi.stubGlobal("fetch", vi.fn());

    render(<ProductsPage />);

    expect(await screen.findByText(/no analysis found/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /go to upload/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });

  test("loads recommended products and adds one to cart", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [buildProduct()],
    });

    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("skinAnalysisResult", JSON.stringify(buildAnalysis()));

    render(<ProductsPage />);

    expect(await screen.findByText("Glow Cream")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/products/recommendations",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(screen.getByText("Safe for your profile")).toBeInTheDocument();
    expect(screen.getByText("Ingredient Notice")).toBeInTheDocument();
    expect(screen.getByText("Ceramides")).toBeInTheDocument();
    expect(screen.getByText("Hydration")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /buy now/i }));

    expect(mockAddItem).toHaveBeenCalledWith({
      name: "Glow Cream",
      brand: "DeepHydra",
      price: "$42.00",
      image: "https://example.com/glow-cream.jpg",
      url: "https://example.com/glow-cream",
    });
    expect(await screen.findByRole("button", { name: /added!/i })).toBeInTheDocument();
  });

  test("shows an error state when recommendations cannot be loaded", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Backend unavailable" }),
    });

    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("skinAnalysisResult", JSON.stringify(buildAnalysis()));

    render(<ProductsPage />);

    expect(await screen.findByText(/could not load products/i)).toBeInTheDocument();
    expect(screen.getByText(/backend unavailable/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to results/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/results");
  });
});