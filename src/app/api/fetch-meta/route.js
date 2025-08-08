import { getLinkPreview } from "link-preview-js";
import { categorizeLink } from "@/lib/categorizeLink";
import { NextResponse } from "next/server";

export async function POST(request) {
  let originalUrl = "";

  try {
    const { url } = await request.json();
    originalUrl = url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Valid URL is required" },
        { status: 400 }
      );
    }

    // Basic URL validation and sanitization
    let validUrl;
    try {
      validUrl = new URL(url.startsWith("http") ? url : `https://${url}`);

      // Security: Only allow http/https protocols
      if (!["http:", "https:"].includes(validUrl.protocol)) {
        return NextResponse.json(
          { error: "Only HTTP and HTTPS URLs are allowed" },
          { status: 400 }
        );
      }

      // Security: Block common internal/local addresses
      const hostname = validUrl.hostname.toLowerCase();
      const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
      const isLocalNetwork =
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.");

      if (blockedHosts.includes(hostname) || isLocalNetwork) {
        return NextResponse.json(
          { error: "Local and internal URLs are not allowed" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch metadata with security constraints
    const preview = await getLinkPreview(validUrl.toString(), {
      timeout: 10000,
      followRedirects: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkCollector/1.0)",
      },
    });

    const metadata = {
      url: validUrl.toString(),
      title: preview.title || preview.siteName || "Untitled",
      description: preview.description || "",
      favicon: preview.favicons?.[0] || preview.images?.[0] || "",
      siteName: preview.siteName || extractDomain(validUrl.toString()),
    };

    metadata.category = categorizeLink(metadata.url, metadata.siteName);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);

    // Return basic metadata if preview fails
    const fallbackUrl = originalUrl.startsWith("http")
      ? originalUrl
      : `https://${originalUrl}`;

    return NextResponse.json({
      url: fallbackUrl,
      title: extractDomain(fallbackUrl),
      description: "",
      favicon: "",
      siteName: extractDomain(fallbackUrl),
      category: categorizeLink(fallbackUrl, ""),
    });
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Site";
  }
}
