"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-white hover:bg-brand-dark"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
        >
          <p className="truncate px-3 py-2 text-xs text-foreground/60">{email}</p>
          <button
            role="menuitem"
            onClick={signOut}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-accent-ink hover:bg-brand-soft/50"
          >
            Sair do painel admin
          </button>
        </div>
      )}
    </div>
  );
}
