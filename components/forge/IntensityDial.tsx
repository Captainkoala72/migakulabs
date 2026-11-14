"use client";

import { INTENSITY } from "@/lib/forge/intensity";

interface Props {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  compact?: boolean;
  disabled?: boolean;
}

/**
 * The Polish ↔ Optimize dial. A native range input underneath (keyboard,
 * screen readers and touch all work), styled as an instrument needle.
 */
export function IntensityDial({ value, onChange, id = "intensity", compact = false, disabled = false }: Props) {
  const stop = INTENSITY[value] ?? INTENSITY[0];
  const pct = (value / (INTENSITY.length - 1)) * 100;

  return (
    <div className={`dial ${compact ? "is-compact" : ""}`} style={{ ["--p" as string]: `${pct}%` }}>
      <div className="dial-ends">
        <span className="label strong">Polish</span>
        {!compact && <span className="label">Intensity</span>}
        <span className="label strong">Optimize</span>
      </div>

      <div className="dial-track">
        <div className="dial-scale" aria-hidden="true" />
        <input
          id={id}
          type="range"
          min={0}
          max={INTENSITY.length - 1}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Intensity, from Polish (0) to Optimize (4)"
          aria-valuetext={`${stop.name}. ${stop.summary}`}
        />
      </div>

      <div className="dial-stops" role="group" aria-label="Intensity stops">
        {INTENSITY.map((s) => (
          <button
            key={s.value}
            type="button"
            className="dial-stop"
            data-active={s.value === value}
            style={{ ["--i" as string]: s.value }}
            onClick={() => onChange(s.value)}
            disabled={disabled}
            aria-pressed={s.value === value}
            aria-label={s.name}
            title={s.name}
          >
            <span className="n" aria-hidden="true">
              {String(s.value).padStart(2, "0")}
            </span>
            <span className="nm" aria-hidden="true">
              {s.name}
            </span>
          </button>
        ))}
      </div>

      {!compact && (
        <div className="dial-readout" aria-live="polite">
          <div className="dial-readout-head">
            <span className="dial-name">{stop.name}</span>
            <span className="label">
              Stop {value}/4 · length {stop.lengthBudget}
            </span>
          </div>
          <p>{stop.summary}</p>
        </div>
      )}
    </div>
  );
}
