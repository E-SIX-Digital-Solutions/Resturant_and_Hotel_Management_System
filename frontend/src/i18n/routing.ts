import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "am"],
  defaultLocale: "en",
  // Hides the locale segment from URLs completely, making it look natural
  localePrefix: "never"
});
