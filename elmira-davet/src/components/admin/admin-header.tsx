"use client";

import { Menu, Bell } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export function AdminHeader({
  onMenuToggle,
  title = "Yönetim Paneli",
  subtitle,
}: AdminHeaderProps) {
  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Menüyü Aç"
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-heading text-text-primary leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-muted hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/rezervasyonlar"
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          title="Rezervasyonlar"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold animate-pulse" />
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-semibold text-gold">
            ED
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-text-primary">Admin</p>
            <p className="text-[10px] text-text-muted">admin@elmira.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
