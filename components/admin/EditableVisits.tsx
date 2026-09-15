"use client";

import EditableCard from "@/components/admin/EditableCard";
import { saveVisitsOverride } from "@/app/admin/(panel)/actions";

export default function EditableVisits({
  value,
  overridden,
  rawOverride,
}: {
  value: number;
  overridden: boolean;
  rawOverride: string;
}) {
  return (
    <EditableCard label="Visitas" displayValue={value} overridden={overridden} action={saveVisitsOverride}>
      <input
        name="visits_override"
        type="number"
        min={0}
        defaultValue={rawOverride}
        placeholder={String(value)}
        className="mt-2 w-full rounded-lg border border-brand-soft px-2 py-1 text-lg font-bold outline-none focus:border-brand"
      />
    </EditableCard>
  );
}
