import Script from "next/script";

// Revalidados aqui também (defesa em profundidade): o valor só chega a
// virar JS/URL se bater exatamente com o formato esperado.
const META_PIXEL_RE = /^\d{6,20}$/;
const GOOGLE_TAG_RE = /^(G|AW|GT)-[A-Z0-9]{4,20}$/i;

export default function TrackingScripts({
  metaPixelId,
  googleTagId,
}: {
  metaPixelId?: string | null;
  googleTagId?: string | null;
}) {
  const pixel = metaPixelId && META_PIXEL_RE.test(metaPixelId) ? metaPixelId : null;
  const tag = googleTagId && GOOGLE_TAG_RE.test(googleTagId) ? googleTagId : null;

  return (
    <>
      {pixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', ${JSON.stringify(pixel)});
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixel)}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {tag && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tag)}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(tag)});
            `}
          </Script>
        </>
      )}
    </>
  );
}
