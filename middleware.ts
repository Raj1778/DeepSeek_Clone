import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - static files
     * - API routes
     * - Next.js internals
     */
    "/((?!_next/image|_next/static|favicon.ico|api|.*\\..*).*)",
  ],
};
