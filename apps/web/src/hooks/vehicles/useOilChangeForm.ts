"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertOilChangesSchema,
  todayDateStr,
  type InsertOilChanges,
  type OilKind,
} from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

// Cost starts empty; the schema rejects it on submit if it's never filled in
const newItem = (kind: OilKind) => ({ kind, cost: undefined as unknown as number, oilType: "" });

export function useOilChangeForm(
  vehicleId: string,
  enabledKinds: OilKind[],
  prefillOdometer: number | undefined,
  onSuccess: () => Promise<unknown> | void,
  onClose: () => void,
) {
  const { t, locale } = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InsertOilChanges>({
    resolver: zodResolver(insertOilChangesSchema),
    defaultValues: {
      date: todayDateStr(),
      odometer: prefillOdometer,
      note: "",
      items: [newItem(enabledKinds[0])],
    },
  });

  const items = useFieldArray({ control: form.control, name: "items" });
  const chosenKinds = useWatch({ control: form.control, name: "items" }).map((i) => i.kind);
  const unusedKinds = enabledKinds.filter((k) => !chosenKinds.includes(k));

  const addItem = () => {
    if (unusedKinds.length === 0) return;
    items.append(newItem(unusedKinds[0]));
  };

  /** Kinds a row may pick: its own plus the ones no other row uses */
  const kindOptions = (index: number) =>
    enabledKinds.filter((k) => k === chosenKinds[index] || !chosenKinds.includes(k));

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.api.vehicles[":vehicleId"]["oil-changes"].$post({
        param: { vehicleId },
        json: data,
      });
      if (res.ok) {
        // Wait for the list to refetch so the dialog closes onto fresh data
        await onSuccess();
        onClose();
      } else {
        const body = await res.json();
        if ("code" in body && body.code === "ODOMETER_TOO_LOW") {
          setError(t("oil.errorOdometerTooLow", { km: formatNumber(body.minOdometer, locale) }));
        } else if ("code" in body && body.code === "OIL_KIND_UNAVAILABLE") {
          setError(t("oil.errorKindUnavailable"));
        } else {
          setError(t("common.error"));
        }
      }
    } catch {
      setError(t("auth.errorConnection"));
    } finally {
      setLoading(false);
    }
  });

  return {
    form,
    items: items.fields,
    removeItem: items.remove,
    addItem,
    canAddItem: unusedKinds.length > 0,
    kindOptions,
    loading,
    error,
    onSubmit,
  };
}
