"use client";

import Link from "next/link";
import { Package } from "lucide-react";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Package className="h-5 w-5" />
      </span>
      <div className="flex flex-col leading-tight">
        <span>STOCKINO</span>
        <span className="text-xs font-normal text-muted-foreground">
          Gestion universelle
        </span>
      </div>
    </Link>
  );
}


