"use client";

import { useId, type ReactNode } from "react";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  hint?: ReactNode;
}

/** Radio group styled as a segmented instrument switch. */
export function Segmented<T extends string>({ label, value, options, onChange, disabled, hint }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className="control">
      <span className="label" id={id}>
        {label}
      </span>
      <div className="segmented" role="radiogroup" aria-labelledby={id} data-disabled={disabled || undefined}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              const index = options.findIndex((o) => o.value === value);
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(options[(index + 1) % options.length].value);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(options[(index - 1 + options.length) % options.length].value);
              }
            }}
            tabIndex={option.value === value ? 0 : -1}
          >
            {option.label}
          </button>
        ))}
      </div>
      {hint && <p className="control-hint">{hint}</p>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: ReactNode;
}

export function Toggle({ label, checked, onChange, disabled, hint }: ToggleProps) {
  const id = useId();
  return (
    <div className="control">
      <div className="toggle-row">
        <label className="toggle-label" htmlFor={id}>
          {label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          className="switch"
          disabled={disabled}
          onClick={() => onChange(!checked)}
        >
          <span className="switch-thumb" />
          <span className="switch-text">{checked ? "On" : "Off"}</span>
        </button>
      </div>
      {hint && <p className="control-hint">{hint}</p>}
    </div>
  );
}
