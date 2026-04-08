import { JSX, ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * VisuallyHidden component - hides content visually but keeps it accessible to screen readers
 * Use this for descriptive text that aids screen reader users but isn't needed visually
 */
export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}
