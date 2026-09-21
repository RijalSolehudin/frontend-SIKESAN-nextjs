'use client';

import * as React from 'react';
import { Input } from './input';

export interface MoneyInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (rawValue: string) => void;
  prefix?: string;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value = '', onChange, className, prefix = 'Rp', ...props }, ref) => {
    // Helper to format raw digits with comma thousands separators (e.g. 1000000 -> 1,000,000)
    const formatValue = (val: string | number | undefined) => {
      if (val === undefined || val === null || val === '') return '';
      const digits = val.toString().replace(/\D/g, '');
      if (!digits) return '';
      return new Intl.NumberFormat('en-US').format(BigInt(digits));
    };

    const [displayValue, setDisplayValue] = React.useState<string>(() => formatValue(value));

    // Keep display value in sync with external value changes (e.g. form.reset, form.setValue)
    React.useEffect(() => {
      setDisplayValue(formatValue(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawDigits = e.target.value.replace(/\D/g, '');
      const formatted = rawDigits ? new Intl.NumberFormat('en-US').format(BigInt(rawDigits)) : '';
      setDisplayValue(formatted);
      onChange?.(rawDigits);
    };

    return (
      <div className="relative w-full">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          className={`${
            prefix ? 'pl-9' : ''
          } h-10 rounded-xl font-bold tabular-nums text-sm text-slate-900 ${className || ''}`}
        />
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
