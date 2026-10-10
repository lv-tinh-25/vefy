"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationsDialog } from "@/components/core/molecules/NotificationsDialog";
import { signOut } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Bell, LogOut, Settings, Globe, Sun, Moon, User, Coins, Loader2 } from "lucide-react";

const LOCALE_LABELS: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

export function UserMenu() {
  const { profile, user } = useAuth();
  const { t, locale, setLocale } = useT();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (loggingOut) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, loggingOut]);

  // Session usually resolves before the profile request; until either does, show a placeholder
  const displayName = profile?.name ?? user?.name;
  const avatarUrl = profile?.image ?? user?.image;
  const initial = displayName?.charAt(0)?.toUpperCase();
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const result = await signOut();
      if (!result.error) {
        notify.afterReload("success", t("toast.loggedOut"));
        // Full reload drops the SWR cache and any in-memory state of the signed-out user
        window.location.replace("/auth/login");
        return;
      }
    } catch {
      // handled below
    }
    notify.error(t("auth.errorConnection"));
    setLoggingOut(false);
  };

  const toggleLocale = () => {
    setLocale(locale === "vi" ? "en" : "vi");
    setOpen(false);
  };

  const openNotifications = () => {
    setOpen(false);
    setNotificationsOpen(true);
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          disabled={loggingOut}
          className="relative flex items-center gap-2 rounded-full transition-all duration-200 hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName ?? ""}
              className="h-8 w-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div
              className={cn(
                "h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold",
                !initial && "animate-pulse",
              )}
            >
              {initial}
            </div>
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
              {badgeLabel}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-elevated border border-border shadow-elevated animate-scale-in origin-top-right z-50">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>

            <fieldset disabled={loggingOut} className="min-w-0 py-1.5">
              <MenuItem
                icon={Bell}
                label={t("userMenu.notifications")}
                badge={unreadCount > 0 ? badgeLabel : undefined}
                onClick={openNotifications}
              />
              <MenuItem
                icon={theme === "dark" ? Sun : Moon}
                label={theme === "dark" ? t("userMenu.lightMode") : t("userMenu.darkMode")}
                onClick={() => {
                  toggleTheme();
                  setOpen(false);
                }}
              />
              <MenuItem
                icon={Globe}
                label={LOCALE_LABELS[locale === "vi" ? "en" : "vi"]}
                onClick={toggleLocale}
              />
              <MenuItem
                icon={Coins}
                label={t("userMenu.expenses")}
                onClick={() => {
                  setOpen(false);
                  router.push("/expenses");
                }}
              />
              <MenuItem
                icon={Settings}
                label={t("auth.accountSettings")}
                onClick={() => {
                  setOpen(false);
                  router.push("/account");
                }}
              />
              <div className="my-1 border-t border-border" />
              <MenuItem
                icon={loggingOut ? Loader2 : LogOut}
                iconClassName={loggingOut ? "animate-spin" : undefined}
                label={t("auth.logout")}
                onClick={handleLogout}
                variant="danger"
              />
            </fieldset>
          </div>
        )}
      </div>

      <NotificationsDialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  variant,
  badge,
  iconClassName,
}: {
  icon: typeof User;
  iconClassName?: string;
  label: string;
  onClick: () => void;
  variant?: "danger";
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variant === "danger"
          ? "text-danger hover:bg-danger-muted"
          : "text-foreground hover:bg-surface",
      )}
    >
      <Icon className={cn("h-4 w-4", iconClassName)} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
