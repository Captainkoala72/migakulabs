"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

export interface PickerOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
  glyph?: string;
  meta?: ReactNode;
  disabled?: boolean;
}

interface Props {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  /** Rendered inside the trigger in place of the plain label. */
  renderValue?: (option: PickerOption | undefined) => ReactNode;
  columns?: 1 | 2;
  disabled?: boolean;
}

/** Accessible listbox popover: arrows, Home/End, Enter/Space, Escape, type-ahead. */
export function Picker({ label, value, options, onChange, renderValue, columns = 1, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ text: "", at: 0 });
  const id = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  const grouped = useMemo(() => {
    const groups: { name?: string; items: { option: PickerOption; index: number }[] }[] = [];
    options.forEach((option, index) => {
      const last = groups[groups.length - 1];
      if (last && last.name === option.group) last.items.push({ option, index });
      else groups.push({ name: option.group, items: [{ option, index }] });
    });
    return groups;
  }, [options]);

  useEffect(() => {
    if (!open) return;
    setActive(selectedIndex);
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function move(from: number, step: number) {
    let next = from;
    for (let i = 0; i < options.length; i++) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) return next;
    }
    return from;
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => move(a, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => move(a, -1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(move(-1, 1));
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(move(options.length, -1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      const t = typeahead.current;
      t.text = now - t.at > 700 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
      t.at = now;
      const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  }

  return (
    <div className="picker" ref={rootRef}>
      <span className="label picker-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        className="picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span id={`${id}-value`} className="picker-value">
          {renderValue ? renderValue(selected) : selected?.label}
        </span>
        <svg className="picker-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          className={`picker-pop cols-${columns}`}
          role="listbox"
          data-lenis-prevent
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
        >
          {grouped.map((group, gi) => (
            <div key={gi} role="presentation" className="picker-group">
              {group.name && (
                <div className="picker-group-name label" role="presentation">
                  {group.name}
                </div>
              )}
              <div className="picker-items" role="presentation">
                {group.items.map(({ option, index }) => (
                  <div
                    key={option.value}
                    id={`${id}-opt-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    className="picker-option"
                    data-active={index === active}
                    onPointerEnter={() => !option.disabled && setActive(index)}
                    onClick={() => choose(index)}
                  >
                    {option.glyph && <span className="glyph">{option.glyph}</span>}
                    <span className="picker-option-text">
                      <span className="picker-option-label">{option.label}</span>
                      {option.description && <span className="picker-option-desc">{option.description}</span>}
                    </span>
                    {option.meta && <span className="picker-option-meta">{option.meta}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
