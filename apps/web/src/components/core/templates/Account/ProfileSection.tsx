"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useT } from "@/lib/i18n";
import { SettingCard } from "@/components/core/molecules/SettingRow";
import { Button } from "@/components/core/atoms/Button";
import { CheckCircle2, Pencil } from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";

export function ProfileSection() {
  const { profile, hasGoogle } = useAuth();
  const { t } = useT();
  const [editing, setEditing] = useState(false);

  if (!profile) return null;

  const initial = profile.name?.charAt(0)?.toUpperCase() ?? "U";
  const authMethodLabel = hasGoogle
    ? t("account.authMethodGoogle")
    : t("account.authMethodEmail");

  return (
    <>
      <SettingCard title={t("account.profile")}>
        <div className="flex items-start gap-4 p-4">
          {/* Avatar */}
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-16 w-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-semibold">
              {initial}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground truncate">
              {profile.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
              <span className="truncate">{profile.email}</span>
              {profile.emailVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
              )}
            </div>
            <p className="text-xs text-faint mt-1.5">{authMethodLabel}</p>
          </div>

          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
            {t("account.edit")}
          </Button>
        </div>
      </SettingCard>

      {editing && <EditProfileModal open onClose={() => setEditing(false)} />}
    </>
  );
}
