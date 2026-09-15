"use client";

import EditableCard from "@/components/admin/EditableCard";
import { saveDurationOverride } from "@/app/admin/(panel)/actions";

export default function EditableDuration({
  minutes,
  seconds,
  overridden,
}: {
  minutes: number;
  seconds: number;
  overridden: boolean;
}) {
  return (
    <EditableCard
      label="Tempo médio no site"
      displayValue={`${minutes}m ${String(seconds).padStart(2, "0")}s`}
      overridden={overridden}
      action={saveDurationOverride}
    >
      <div className="mt-2 flex items-center gap-2">
        <input
          name="minutes"
          type="number"
          min={0}
          defaultValue={minutes}
          className="w-16 rounded-lg border border-brand-soft px-2 py-1 text-lg font-bold outline-none focus:border-brand"
        />
        <span className="text-sm text-foreground/50">min</span>
        <input
          name="seconds"
          type="number"
          min={0}
          max={59}
          defaultValue={seconds}
          className="w-16 rounded-lg border border-brand-soft px-2 py-1 text-lg font-bold outline-none focus:border-brand"
        />
        <span className="text-sm text-foreground/50">seg</span>
      </div>
    </EditableCard>
  );
}
