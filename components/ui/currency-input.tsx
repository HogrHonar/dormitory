// components/ui/currency-input.tsx
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  step?: string;
}

export function CurrencyInput({
  value,
  onChange,
  disabled,
  placeholder = "0",
  className,
  id,
  step,
}: CurrencyInputProps) {
  const formatDisplay = (raw: string) => {
    const digits = raw.replace(/,/g, "");
    if (!digits) return "";
    const num = parseFloat(digits);
    if (isNaN(num)) return raw;

    // Preserve decimal part while formatting integer part with commas
    const parts = digits.split(".");
    const intFormatted = parseInt(parts[0] || "0").toLocaleString("en-US");
    return parts.length > 1 ? `${intFormatted}.${parts[1]}` : intFormatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip commas, allow digits and ONE decimal point
    const raw = e.target.value.replace(/,/g, "").replace(/[^0-9.]/g, "");

    // Prevent multiple dots
    const parts = raw.split(".");
    const cleaned =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : raw;

    onChange(cleaned);
  };

  return (
    <Input
      id={id}
      type="text" // ALWAYS text, never "number"
      className={className}
      inputMode="decimal" // decimal not numeric, allows dot on mobile
      value={formatDisplay(value)}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      dir="ltr"
      step={step}
    />
  );
}
