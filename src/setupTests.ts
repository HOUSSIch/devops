import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("motion/react", () => {
	const motionPropKeys = new Set([
		"initial",
		"animate",
		"exit",
		"transition",
		"variants",
		"whileHover",
		"whileTap",
		"whileFocus",
		"whileInView",
		"whileDrag",
		"layout",
		"layoutId",
		"layoutScroll",
		"drag",
		"dragConstraints",
		"dragElastic",
		"dragMomentum",
		"dragPropagation",
		"viewport",
		"onAnimationStart",
		"onAnimationComplete",
	]);

	const createMotionComponent = (tagName: string) =>
		React.forwardRef<HTMLElement, Record<string, unknown>>(
			({ children, ...props }, ref) => {
				const domProps = Object.fromEntries(
					Object.entries(props).filter(([key]) => !motionPropKeys.has(key)),
				);

				return React.createElement(tagName, { ref, ...domProps }, children);
			},
		);

	const motion = new Proxy(
		{},
		{
			get: (_target, tag) => createMotionComponent(String(tag)),
		},
	);

	return {
		motion,
		AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
			React.createElement(React.Fragment, null, children),
	};
});

vi.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get: (_target, tag) => {
				const motionPropKeys = new Set([
					"initial",
					"animate",
					"exit",
					"transition",
					"variants",
					"whileHover",
					"whileTap",
					"whileFocus",
					"whileInView",
					"whileDrag",
					"layout",
					"layoutId",
					"layoutScroll",
					"drag",
					"dragConstraints",
					"dragElastic",
					"dragMomentum",
					"dragPropagation",
					"viewport",
					"onAnimationStart",
					"onAnimationComplete",
				]);

				return React.forwardRef<HTMLElement, Record<string, unknown>>(
					({ children, ...props }, ref) => {
						const domProps = Object.fromEntries(
							Object.entries(props).filter(([key]) => !motionPropKeys.has(key)),
						);

						return React.createElement(String(tag), { ref, ...domProps }, children);
					},
				);
			},
		},
	),
	AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
		React.createElement(React.Fragment, null, children),
}));

vi.mock("sonner", () => ({
	Toaster: () => null,
}));

Object.defineProperty(window, "scrollTo", {
	value: vi.fn(),
	writable: true,
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
	localStorage.clear();
});