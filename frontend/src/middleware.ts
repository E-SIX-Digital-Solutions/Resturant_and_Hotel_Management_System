import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclude assets, public files, and backend APIs
  matcher: [
    "/", 
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ]
};
