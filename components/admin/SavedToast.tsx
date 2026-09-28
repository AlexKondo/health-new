"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function SavedToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("saved") !== "1") return;
    setVisible(true);

    // Tira o ?saved=1 da URL pra não reaparecer num refresh ou "voltar".
    const rest = new URLSearchParams(searchParams);
    rest.delete("saved");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg">
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M7.6 13.4 4.3 10l-1.4 1.4 4.7 4.7L17.1 6.6l-1.4-1.4z" />
      </svg>
      Salvo com sucesso!
    </div>
  );
}

export default function SavedToast() {
  return (
    <Suspense fallback={null}>
      <SavedToastInner />
    </Suspense>
  );
}
