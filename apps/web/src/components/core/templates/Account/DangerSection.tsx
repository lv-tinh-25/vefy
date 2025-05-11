"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useLogoutAll } from "@/hooks/account/useLogoutAll";
import { SettingCard, SettingRow } from "@/components/core/molecules/SettingRow";
import { Button } from "@/components/core/atoms/Button";
import { LogOut, Trash2, CheckCircle2 } from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function DangerSection() {
  const { t } = useT();
  const { logoutAll, loading, success } = useLogoutAll();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <SettingCard title={t("account.danger")} variant="danger">
        <SettingRow
          icon={LogOut}
          label={t("account.logoutAll")}
          description={t("account.logoutAllDesc")}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={logoutAll}
              disabled={loading}
            >
              {success ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  OK
                </>
              ) : (
                t("account.logoutAllAction")
              )}
            </Button>
          }
        />
        <SettingRow
          icon={Trash2}
          label={t("account.deleteAccount")}
          description={t("account.deleteAccountDesc")}
          variant="danger"
          action={
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("account.deleteAccountAction")}
            </Button>
          }
        />
      </SettingCard>

      {confirmingDelete && (
        <DeleteAccountModal open onClose={() => setConfirmingDelete(false)} />
      )}
    </>
  );
}
