"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/molecules/Card";
import { Button } from "@/components/core/atoms/Button";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { updateOilSettingsSchema, type OilSetting, type UpdateOilSettings } from "@vefy/shared";
import { ChevronDown, Settings2 } from "lucide-react";

interface OilSettingsCardProps {
  settings: OilSetting[];
  saving: boolean;
  onSave: (settings: OilSetting[]) => Promise<void>;
}

const checkboxClass = "h-4 w-4 rounded border-border bg-surface accent-primary";

export function OilSettingsCard({ settings, saving, onSave }: OilSettingsCardProps) {
  const { t, tRaw } = useT();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateOilSettings>({
    resolver: zodResolver(updateOilSettingsSchema),
    values: { settings },
  });
  const watched = useWatch({ control: form.control, name: "settings" }) ?? settings;
  const errors = form.formState.errors.settings;

  const handleSave = form.handleSubmit((data) => onSave(data.settings));

  // A cleared input that then gets hidden would still fail validation with no visible error
  const restoreIfEmpty = (index: number, field: "cycleKm" | "cycleDays") => {
    const name = `settings.${index}.${field}` as const;
    if (form.getValues(name) == null) form.setValue(name, settings[index][field]);
  };

  return (
    <Card>
      <CardHeader className={cn(open && "pb-2")}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            {t("oil.cycleSettings")}
          </CardTitle>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </CardHeader>
      {open && (
        <CardContent>
          <form onSubmit={handleSave}>
            <fieldset disabled={saving} className="min-w-0 space-y-4">
              {settings.map((setting, index) => {
                const row = watched[index] ?? setting;
                const rowErrors = errors?.[index];
                return (
                  <div key={setting.kind} className="space-y-3 border-b border-border pb-4 last:border-0 last:pb-0">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Controller
                        control={form.control}
                        name={`settings.${index}.enabled`}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                restoreIfEmpty(index, "cycleKm");
                                restoreIfEmpty(index, "cycleDays");
                              }
                              field.onChange(e.target.checked);
                            }}
                            className={checkboxClass}
                          />
                        )}
                      />
                      {t(`oilKinds.${setting.kind}`)}
                    </label>

                    {row.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                        <div>
                          <Label>{t("oil.cycleKm")}</Label>
                          <InputNumber
                            control={form.control}
                            name={`settings.${index}.cycleKm`}
                            thousandSeparator
                            suffix="km"
                            className="mt-1.5"
                          />
                          {rowErrors?.cycleKm && (
                            <p className="text-sm text-danger mt-1">{tRaw(rowErrors.cycleKm.message as string)}</p>
                          )}
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm text-foreground h-5">
                            <Controller
                              control={form.control}
                              name={`settings.${index}.useDays`}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={(e) => {
                                    if (!e.target.checked) restoreIfEmpty(index, "cycleDays");
                                    field.onChange(e.target.checked);
                                  }}
                                  className={checkboxClass}
                                />
                              )}
                            />
                            {t("oil.useTimeLimit")}
                          </label>
                          {row.useDays && (
                            <>
                              <InputNumber
                                control={form.control}
                                name={`settings.${index}.cycleDays`}
                                suffix={t("common.days")}
                                className="mt-1.5"
                              />
                              {rowErrors?.cycleDays && (
                                <p className="text-sm text-danger mt-1">{tRaw(rowErrors.cycleDays.message as string)}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <Button type="submit" size="sm" variant="outline" disabled={saving}>
                {saving ? t("common.saving") : t("common.saveSettings")}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
