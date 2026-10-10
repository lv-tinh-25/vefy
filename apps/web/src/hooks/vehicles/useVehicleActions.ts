"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { notify } from "@/lib/notify";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";

export function useVehicleActions(vehicleId: string) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { t } = useT();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    router.prefetch("/garage");
  }, [router]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const requestDelete = () => {
    setMenuOpen(false);
    setConfirmOpen(true);
  };

  const deleteVehicle = async () => {
    setDeleting(true);
    try {
      const res = await api.api.vehicles[":id"].$delete({ param: { id: vehicleId } });
      if (res.ok) {
        await Promise.all([mutate("vehicles"), mutate("notifications")]);
        notify.success(t("vehicleActions.deleteSuccess"));
        // Keep the dialog locked until the garage replaces this page
        router.replace("/garage");
        return;
      }
      notify.error(t("toast.deleteFailed"));
    } catch {
      notify.error(t("auth.errorConnection"));
    }
    setDeleting(false);
  };

  return {
    menuRef,
    menuOpen,
    toggleMenu: () => setMenuOpen((o) => !o),
    confirmOpen,
    closeConfirm: () => setConfirmOpen(false),
    requestDelete,
    deleting,
    deleteVehicle,
  };
}
