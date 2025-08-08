import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Create Supabase client for API routes
function createServerClient(request) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: request.headers.get("Authorization") ?? "",
        },
      },
    }
  );
}

// GET - Get user's links
export async function GET(request) {
  try {
    const supabase = createServerClient(request);

    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error in GET /api/links:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching links for authenticated user:", user.id);

    const { data: links, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching links:", error);
      return NextResponse.json(
        { error: "Failed to fetch links" },
        { status: 500 }
      );
    }

    console.log("Successfully fetched links:", links?.length || 0);
    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error in GET /api/links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new link
export async function POST(request) {
  try {
    const supabase = createServerClient(request);

    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, title, description, favicon, siteName, category } =
      await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const linkData = {
      id: uuidv4(),
      user_id: user.id,
      url,
      title: title || "Untitled",
      description: description || "",
      favicon: favicon || "",
      site_name: siteName || "",
      category: category || "General",
    };

    const { data, error } = await supabase
      .from("links")
      .insert([linkData])
      .select()
      .single();

    if (error) {
      console.error("Error creating link:", error);
      return NextResponse.json(
        { error: "Failed to create link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ link: data });
  } catch (error) {
    console.error("Error in POST /api/links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a link
export async function DELETE(request) {
  try {
    const supabase = createServerClient(request);

    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("id");

    if (!linkId) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", linkId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting link:", error);
      return NextResponse.json(
        { error: "Failed to delete link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
