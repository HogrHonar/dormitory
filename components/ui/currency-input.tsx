// components/ui/currency-input.tsx
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  type?: string;
  step?: string;
  target?: string;
}

export function CurrencyInput({
  value,
  onChange,
  disabled,
  placeholder = "0",
  className,
  id,
  type,
  step,
}: CurrencyInputProps) {
  // Format number with commas for display
  const formatDisplay = (raw: string) => {
    const digits = raw.replace(/,/g, "");
    if (!digits) return "";
    const num = parseFloat(digits);
    if (isNaN(num)) return raw;
    return num.toLocaleString("en-US");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip commas, only allow digits
    const raw = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
    onChange(raw);
  };

  return (
    <Input
      id={id}
      type={type}
      className={className}
      inputMode="numeric"
      value={formatDisplay(value)}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      dir="ltr"
      step={step}
    />
  );
}
