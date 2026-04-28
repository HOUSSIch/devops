import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { QuestionnairePage } from "../app/pages/QuestionnairePage";

const { mockNavigate, mockUseAuth } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseAuth: vi.fn(),
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

function createToken(sub: string) {
  const payload = Buffer.from(JSON.stringify({ sub })).toString("base64");
  return `header.${payload.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}.signature`;
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

async function fillRequiredQuestionnaire(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Dry" }));
  await user.click(screen.getAllByRole("button", { name: "High" })[0]);
  await user.click(screen.getByRole("button", { name: "Itching" }));
  await user.click(screen.getByRole("button", { name: "Forehead" }));
  await user.click(screen.getByRole("button", { name: "Acne" }));
  await user.click(screen.getByRole("button", { name: "1 to 4 weeks" }));
  await user.click(screen.getByRole("button", { name: "Severe" }));
}

beforeEach(() => {
  window.history.pushState({}, "", "/questionnaire");
  mockNavigate.mockReset();
  mockUseAuth.mockReset();
  localStorage.clear();
});

describe("QuestionnairePage", () => {
  test("renders the questionnaire with a disabled submit button until required fields are filled", () => {
    mockUseAuth.mockReturnValue(buildAuthState(createToken("user-123")));

    render(<QuestionnairePage />);

    expect(screen.getByText("Skin Health Questionnaire")).toBeInTheDocument();
    expect(screen.getByText("Step 2 / 4")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to upload/i })).toBeDisabled();
  });

  test("toggles multi-select answers and enables submission when the form is complete", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(buildAuthState(createToken("user-123")));

    render(<QuestionnairePage />);

    await user.click(screen.getByRole("button", { name: "Itching" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Itching" })).toHaveClass("bg-[#8b63d3]");
    });

    await user.click(screen.getByRole("button", { name: "Itching" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Itching" })).not.toHaveClass("bg-[#8b63d3]");
    });
  });

  test("submits the questionnaire, persists the payload, and marks it complete", async () => {
    const user = userEvent.setup();
    const token = createToken("user-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ message: "saved" }),
    });

    vi.stubGlobal("fetch", fetchMock);
    mockUseAuth.mockReturnValue(buildAuthState(token));

    render(<QuestionnairePage />);

    await fillRequiredQuestionnaire(user);
    await user.type(screen.getByPlaceholderText(/fragrance, retinol, acids/i), "fragrance");
    await user.type(screen.getByPlaceholderText(/eczema, psoriasis, rosacea/i), "eczema");
    await user.type(screen.getByPlaceholderText(/cleanser, moisturizer, serum/i), "cleanser and moisturizer");

    const comboboxes = screen.getAllByRole("combobox");
    await user.selectOptions(comboboxes[0], "Often");
    await user.selectOptions(comboboxes[1], "High");
    await user.selectOptions(comboboxes[2], "Good");
    await user.selectOptions(comboboxes[3], "More than 2L");

    await user.click(screen.getByRole("button", { name: /continue to upload/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/users/questionnaire",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
      }),
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(requestBody.skinType).toBe("Dry");
    expect(requestBody.sensitivityLevel).toBe("High");
    expect(requestBody.symptoms).toContain("Itching");
    expect(requestBody.affectedAreas).toContain("Forehead");
    expect(requestBody.concerns).toContain("Acne");
    expect(requestBody.duration).toBe("1 to 4 weeks");
    expect(requestBody.severity).toBe("Severe");

    expect(localStorage.getItem("skinQuestionnaire")).toContain("\"skinType\":\"Dry\"");
    expect(localStorage.getItem("questionnaire_completed_user-123")).toBe("true");
    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });

  test("shows a login error when the user tries to submit without a token", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
    mockUseAuth.mockReturnValue(buildAuthState(null));

    render(<QuestionnairePage />);

    await fillRequiredQuestionnaire(user);
    await user.click(screen.getByRole("button", { name: /continue to upload/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("skinQuestionnaire")).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});