"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { BrandSelect } from "@/components/core/molecules/BrandSelect";
import { ColorPicker } from "@/components/core/molecules/ColorPicker";
import { YearDropdown } from "@/components/core/molecules/YearDropdown";
import { useT } from "@/lib/i18n";
import { useVehicleForm } from "@/hooks/garage/useVehicleForm";
import { motorcycleVariantSchema, vehicleColorSchema, type VehicleType } from "@vefy/shared";

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<unknown> | void;
}

export function VehicleFormModal({ open, onClose, onSuccess }: VehicleFormModalProps) {
  const { t, tRaw } = useT();
  const { form, loading, onSubmit } = useVehicleForm(onSuccess, onClose);
  const { control, watch, setValue, formState: { errors } } = form;
  const watchedType = watch("type");
  const vehicleType: VehicleType = watchedType === "car" ? "car" : "motorcycle";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={loading}
      title={t("vehicleForm.title")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>{t("common.cancel")}</Button>
          <Button type="submit" form="vehicle-form" disabled={loading}>
            {loading ? t("common.adding") : t("vehicleForm.addVehicle")}
          </Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>{t("vehicleForm.type")}</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="flex gap-2 mt-1.5">
                <Button
                  type="button"
                  variant={field.value === "car" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    field.onChange("car");
                    setValue("variant", undefined);
                  }}
                >
                  {t("common.car")}
                </Button>
                <Button type="button" variant={field.value === "motorcycle" ? "default" : "outline"} size="sm" onClick={() => field.onChange("motorcycle")}>{t("common.motorcycle")}</Button>
              </div>
            )}
          />
        </div>

        {vehicleType === "motorcycle" && (
          <div>
            <Label>{t("vehicleForm.variant")}</Label>
            <Controller
              control={control}
              name="variant"
              render={({ field, fieldState }) => (
                <>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {motorcycleVariantSchema.options.map((variant) => (
                      <Button
                        key={variant}
                        type="button"
                        variant={field.value === variant ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(variant)}
                      >
                        {t(`vehicleVariant.${variant}`)}
                      </Button>
                    ))}
                  </div>
                  {fieldState.error && <p className="text-sm text-danger mt-1">{tRaw(fieldState.error.message)}</p>}
                </>
              )}
            />
          </div>
        )}

        <div>
          <Label>{t("vehicleForm.color")}</Label>
          <div className="mt-1.5">
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorPicker value={field.value} onChange={(c) => {
                  const parsed = vehicleColorSchema.safeParse(c);
                  if (parsed.success) field.onChange(parsed.data);
                }} />
              )}
            />
          </div>
        </div>

        <div>
          <Label>{t("vehicleForm.brand")}</Label>
          <Controller
            control={control}
            name="brand"
            render={({ field, fieldState }) => (
              <>
                <BrandSelect vehicleType={vehicleType} value={field.value} onChange={field.onChange} className="mt-1.5" />
                {fieldState.error && <p className="text-sm text-danger mt-1">{tRaw(fieldState.error.message)}</p>}
              </>
            )}
          />
        </div>

        <div>
          <Label>{t("vehicleForm.model")}</Label>
          <Controller control={control} name="model" render={({ field, fieldState }) => (
            <>
              <Input {...field} placeholder={t("vehicleForm.modelHint")} className="mt-1.5" />
              {fieldState.error && <p className="text-sm text-danger mt-1">{tRaw(fieldState.error.message)}</p>}
            </>
          )} />
        </div>

        <div>
          <Label>{t("vehicleForm.nameOptional")}</Label>
          <Controller control={control} name="name" render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder={t("vehicleForm.nameHint")} className="mt-1.5" />} />
        </div>

        <div>
          <Label>{t("vehicleForm.year")}</Label>
          <YearDropdown control={control} name="year" className="mt-1.5" />
          {errors.year && <p className="text-sm text-danger mt-1">{tRaw(errors.year.message as string)}</p>}
        </div>

        <div>
          <Label>{t("vehicleForm.licensePlate")}</Label>
          <Controller control={control} name="licensePlate" render={({ field, fieldState }) => (
            <>
              <Input {...field} placeholder={t("vehicleForm.licensePlateHint")} className="mt-1.5" />
              {fieldState.error && <p className="text-sm text-danger mt-1">{tRaw(fieldState.error.message)}</p>}
            </>
          )} />
        </div>
      </form>
    </Dialog>
  );
}
