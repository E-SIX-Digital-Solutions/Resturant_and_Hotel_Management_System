import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Attempt to read translations from the mock backend API endpoint
  try {
    // We fetch from localhost inside request context
    const res = await fetch(`http://localhost:${process.env.PORT || 3000}/api/translations?locale=${locale}`, {
      next: { revalidate: 3600 } // cache for 1 hour in Next.js
    });
    if (res.ok) {
      const messages = await res.json();
      console.log(`Successfully fetched messages for [${locale}] from backend API.`);
      return {
        locale,
        messages
      };
    }
  } catch (error) {
    // If backend fetch fails (e.g. during compilation when the local server is offline)
    // we fall back to loading the files directly.
    console.warn(`Backend translation fetch failed for [${locale}], using static file fallback:`);
  }

  // Static Fallback Imports (safeguards build compilation phase)
  const localMessages = locale === "am" 
    ? (await import("../../messages/am.json")).default
    : (await import("../../messages/en.json")).default;

  return {
    locale,
    messages: localMessages
  };
});
