import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm mb-2 text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
