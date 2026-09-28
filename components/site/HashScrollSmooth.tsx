"use client";

import { useEffect } from "react";

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const el = document.querySelector(hash);
  if (!el) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

/**
 * Rola suavemente até a âncora (#sobre-nos, #agendar, ...) quando ela existe
 * na URL — só isso. Não usa scroll-behavior: smooth no CSS global porque
 * isso também "suaviza" o reset de scroll que o Next faz ao navegar pra
 * qualquer página nova (mesmo sem âncora), o que parecia a página rolando
 * sozinha e rápido demais antes de travar no topo.
 */
export default function HashScrollSmooth() {
  useEffect(() => {
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
