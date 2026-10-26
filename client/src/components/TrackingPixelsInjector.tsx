import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export default function TrackingPixelsInjector() {
  const pixelsQuery = trpc.abandonedCart.getPublicStorePixels.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const pixels = pixelsQuery.data;

  useEffect(() => {
    if (!pixels || !pixels.enabled) return;

    // 1. Meta (Facebook) Pixel
    if (pixels.metaPixelId && !document.getElementById("meta-pixel-script")) {
      const script = document.createElement("script");
      script.id = "meta-pixel-script";
      script.async = true;
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixels.metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

    // 2. TikTok Pixel
    if (pixels.tiktokPixelId && !document.getElementById("tiktok-pixel-script")) {
      const script = document.createElement("script");
      script.id = "tiktok-pixel-script";
      script.async = true;
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndVerify=function(t,e){return function(){t[e]=ttq[e]}};for(var e=0;e<ttq.methods.length;e++)ttq[e](ttq,ttq.methods[e]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq[n](e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${pixels.tiktokPixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
    }

    // 3. Google Analytics 4 (GA4)
    if (pixels.gaMeasurementId && !document.getElementById("ga4-script")) {
      const scriptGtag = document.createElement("script");
      scriptGtag.id = "ga4-script";
      scriptGtag.async = true;
      scriptGtag.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.gaMeasurementId}`;
      document.head.appendChild(scriptGtag);

      const scriptConfig = document.createElement("script");
      scriptConfig.id = "ga4-config-script";
      scriptConfig.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${pixels.gaMeasurementId}');
      `;
      document.head.appendChild(scriptConfig);
    }

    // 4. Google Tag Manager (GTM)
    if (pixels.gtmContainerId && !document.getElementById("gtm-script")) {
      const scriptGtm = document.createElement("script");
      scriptGtm.id = "gtm-script";
      scriptGtm.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${pixels.gtmContainerId}');
      `;
      document.head.appendChild(scriptGtm);
    }
  }, [pixels]);

  return null;
}

/** Helper function to trigger standard e-commerce events across all configured pixels */
export function trackEcommerceEvent(eventName: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase", data?: any) {
  if (typeof window === "undefined") return;

  // Meta Pixel
  if (window.fbq) {
    try {
      window.fbq("track", eventName, data);
    } catch (e) {
      console.warn("[MetaPixel] Event track failed:", e);
    }
  }

  // TikTok Pixel
  if (window.ttq) {
    try {
      window.ttq.track(eventName, data);
    } catch (e) {
      console.warn("[TikTokPixel] Event track failed:", e);
    }
  }

  // Google Analytics 4
  if (window.gtag) {
    try {
      window.gtag("event", eventName.toLowerCase(), data);
    } catch (e) {
      console.warn("[GA4] Event track failed:", e);
    }
  }
}
