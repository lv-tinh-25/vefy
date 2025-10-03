"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search, X, ArrowLeft } from "lucide-react";

export interface SelectGroup {
  label: string;
  options: string[];
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Flat list of options OR grouped options */
  options?: string[];
  groups?: SelectGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  /** When false, hide the search input (acts as a plain dropdown). Default true. */
  searchable?: boolean;
  /** Display text for a stored option value (e.g. translated); defaults to the value itself */
  getOptionLabel?: (value: string) => string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  groups,
  placeholder = "Select...",
  searchPlaceholder,
  emptyMessage = "No results",
  className,
  searchable = true,
  getOptionLabel = (v) => v,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Track trigger position so desktop dropdown (portal + fixed) follows it
  // across resize / ancestor scroll (e.g., when placed inside a scrollable modal).
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (wrapperRef.current) {
        setTriggerRect(wrapperRef.current.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Normalize: flat options → single group
  const allGroups: SelectGroup[] = groups
    ? groups
    : options
      ? [{ label: "", options }]
      : [];

  // Close desktop dropdown on click outside (skip portal)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !target.closest("[data-searchable-portal]")
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else { document.body.style.overflow = ""; setSearch(""); }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const filteredGroups = searchable
    ? allGroups
        .map((g) => ({
          ...g,
          options: g.options.filter((o) =>
            getOptionLabel(o).toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((g) => g.options.length > 0)
    : allGroups;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  // Callback ref: when the scroll container mounts (dropdown opens), center the selected option.
  // Fires for each portal (desktop/mobile) so both stay in sync.
  const scrollListRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !value) return;
      const target = node.querySelector<HTMLElement>(
        `[data-option-value="${CSS.escape(value)}"]`,
      );
      if (!target) return;
      node.scrollTop =
        target.offsetTop - node.clientHeight / 2 + target.clientHeight / 2;
    },
    [value],
  );

  const searchInput = (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchPlaceholder ?? placeholder}
        className="w-full h-10 rounded-lg bg-surface border border-border pl-10 pr-9 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ring"
        autoFocus
      />
      {search && (
        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  const optionList = filteredGroups.length === 0 ? (
    <div className="py-8 text-center text-sm text-faint">{emptyMessage}</div>
  ) : (
    filteredGroups.map((group) => (
      <div key={group.label || "__flat"}>
        {group.label && (
          <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-surface/50 sticky top-0">
            {group.label}
          </div>
        )}
        {group.options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              data-option-value={opt}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer",
                selected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-surface",
              )}
            >
              {getOptionLabel(opt)}
              {selected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    ))
  );

  // Desktop dropdown — portal + fixed so it escapes scrollable ancestors (e.g., modal body)
  const desktopDropdown = open && triggerRect && typeof document !== "undefined" && createPortal(
    <div data-searchable-portal className="hidden sm:block fixed inset-0 z-9999">
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      <div
        className="absolute border border-border bg-elevated shadow-elevated rounded-xl overflow-hidden animate-scale-in"
        style={{
          top: triggerRect.bottom + 4,
          left: triggerRect.left,
          width: triggerRect.width,
        }}
      >
        {searchable && <div className="p-2 border-b border-border">{searchInput}</div>}
        <div ref={scrollListRef} className="overflow-y-auto max-h-64">{optionList}</div>
      </div>
    </div>,
    document.body,
  );

  // Mobile fullscreen (portal)
  const mobileFullscreen = open && typeof document !== "undefined" && createPortal(
    <div data-searchable-portal className="sm:hidden fixed inset-0 z-9999 bg-background flex flex-col">
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {searchable ? searchInput : (
          <span className="flex-1 text-sm font-medium text-foreground">{placeholder}</span>
        )}
      </div>
      <div ref={scrollListRef} className="flex-1 overflow-y-auto">{optionList}</div>
    </div>,
    document.body,
  );

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
      >
        <span className={value ? "text-foreground" : "text-faint"}>
          {value ? getOptionLabel(value) : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-faint transition-transform", open && "rotate-180")} />
      </button>

      {desktopDropdown}
      {mobileFullscreen}
    </div>
  );
}
