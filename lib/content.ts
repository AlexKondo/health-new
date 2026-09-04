/**
 * Camada de acesso a conteúdo. Lê do Supabase quando configurado; caso
 * contrário (preview local sem credenciais) cai para os JSON de seed
 * empacotados em content/seed. Server-only.
 */
import { createClient } from "@/lib/supabase/server";

import testimonialsSeed from "@/content/seed/testimonials.json";
import faqSeed from "@/content/seed/faq.json";
import segmentsSeed from "@/content/seed/segments.json";
import activitiesSeed from "@/content/seed/activities.json";
import bannersSeed from "@/content/seed/banners.json";
import partnersSeed from "@/content/seed/partners.json";
import pagesSeed from "@/content/seed/pages.json";

export type Testimonial = (typeof testimonialsSeed)[number];
export type Faq = (typeof faqSeed)[number];
export type Segment = (typeof segmentsSeed)[number];
export type Activity = (typeof activitiesSeed)[number];
export type Banner = (typeof bannersSeed)[number];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseEnabled = !!url && !url.includes("YOUR_PROJECT");

async function fromSupabase<T>(
  run: (sb: Awaited<ReturnType<typeof createClient>>) => PromiseLike<{ data: T[] | null; error: unknown }>,
  fallback: T[],
): Promise<T[]> {
  if (!supabaseEnabled) return fallback;
  try {
    const sb = await createClient();
    const { data, error } = await run(sb);
    if (error || !data || data.length === 0) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export const getTestimonials = () =>
  fromSupabase<Testimonial>(
    (sb) => sb.from("testimonials").select("*").eq("published", true).order("sort_order"),
    testimonialsSeed,
  );

export const getFaq = () =>
  fromSupabase<Faq>(
    (sb) => sb.from("faq").select("*").eq("published", true).order("sort_order"),
    faqSeed,
  );

export const getSegments = () =>
  fromSupabase<Segment>((sb) => sb.from("segments").select("*").order("sort_order"), segmentsSeed);

export const getActivities = () =>
  fromSupabase<Activity>((sb) => sb.from("activities").select("*").order("sort_order"), activitiesSeed);

export const getActiveBanners = () =>
  fromSupabase<Banner>((sb) => sb.from("active_banners").select("*"), bannersSeed);

export const getPartners = () =>
  fromSupabase((sb) => sb.from("partners").select("*").order("sort_order"), partnersSeed as never[]);

export async function getSegment(slug: string): Promise<Segment | null> {
  const all = await getSegments();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getActivity(slug: string): Promise<Activity | null> {
  const all = await getActivities();
  return all.find((a) => a.slug === slug) ?? null;
}

// Páginas institucionais/legais são estáticas (vêm do build de conteúdo).
export type ContentPage = (typeof pagesSeed)[number];
export const getPages = (): ContentPage[] => pagesSeed;
export const getPage = (slug: string): ContentPage | null =>
  pagesSeed.find((p) => p.slug === slug) ?? null;
