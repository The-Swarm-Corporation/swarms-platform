import arcjet, { detectBot } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

// Middleware configuration: Exclude static assets and specific API routes if needed
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/hello).*)",
  ],
};

// Initialize Arcjet with strict bot detection rules
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Ensure the key is set in your environment
  rules: [
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" for testing/logging
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Allow trusted bots like Google, Bing, etc.
        // Uncomment categories based on your needs:
        //"CATEGORY:MONITOR", // Allow uptime monitoring services
        "CATEGORY:PREVIEW", // Allow link previews (e.g., Slack, Discord)
        "CATEGORY:ARCHIVE",
        "CATEGORY:SOCIAL",
        "CATEGORY:OPTIMIZER",
      ],
    }),
  ],
});

// Secure middleware function
export default async function middleware(request: NextRequest) {
  const decision = await aj.protect(request);

  // Deny requests from hosting provider bots or untrusted sources
  if (
    decision.isDenied() &&
    decision.reason.isBot() &&
    decision.ip.isHosting()
  ) {
    return NextResponse.json(
      { error: "Forbidden - Hosting Provider Bot Detected" },
      { status: 403 }
    );
  }

  // Proceed with the request if no issues are detected
  return NextResponse.next();
}
