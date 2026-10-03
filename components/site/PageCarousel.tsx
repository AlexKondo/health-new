import ImageCarousel from "@/components/site/ImageCarousel";
import { getPagePhotos } from "@/lib/content";

export default async function PageCarousel({
  slug,
  enabled = true,
  intervalSeconds = 3,
}: {
  slug: string;
  enabled?: boolean;
  intervalSeconds?: number;
}) {
  if (!enabled) return null;
  const photos = await getPagePhotos(slug);
  if (photos.length === 0) return null;
  return (
    <div className="mt-10">
      <ImageCarousel images={photos} intervalSeconds={intervalSeconds} />
    </div>
  );
}
