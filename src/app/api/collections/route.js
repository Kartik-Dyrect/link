import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Create Supabase client for API routes (with auth context)
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

// Create admin Supabase client (bypasses RLS for trusted server operations)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper function to sync collection with current user links
async function syncCollectionLinks(collectionId, userId) {
  try {
    const adminSupabase = createAdminClient();

    // Get all current user links
    const { data: currentLinks, error: linksError } = await adminSupabase
      .from("links")
      .select("id")
      .eq("user_id", userId);

    if (linksError) {
      console.error("Error fetching current user links:", linksError);
      return false;
    }

    // Get existing collection links
    const { data: existingCollectionLinks, error: existingError } =
      await adminSupabase
        .from("collection_links")
        .select("link_id")
        .eq("collection_id", collectionId);

    if (existingError) {
      console.error("Error fetching existing collection links:", existingError);
      return false;
    }

    // Clear all existing collection links
    const { error: deleteError } = await adminSupabase
      .from("collection_links")
      .delete()
      .eq("collection_id", collectionId);

    if (deleteError) {
      console.error("Error clearing collection links:", deleteError);
      return false;
    }

    // Add current user links to collection
    if (currentLinks && currentLinks.length > 0) {
      const newCollectionLinks = currentLinks.map((link) => ({
        collection_id: collectionId,
        link_id: link.id,
      }));

      const { error: insertError } = await adminSupabase
        .from("collection_links")
        .insert(newCollectionLinks);

      if (insertError) {
        console.error("Error adding new collection links:", insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error syncing collection links:", error);
    return false;
  }
}

// POST - Create or update a collection for sharing
export async function POST(request) {
  try {
    const supabase = createServerClient(request);

    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error in collections API:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name = "My Collection" } = await request.json();

    // Use admin client for database operations
    const adminSupabase = createAdminClient();

    // Check if user already has a collection
    const { data: existingCollections, error: queryError } = await adminSupabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);

    if (queryError) {
      console.error("Error querying existing collections:", queryError);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    let collection;

    // If user already has a collection, sync it and return it
    if (existingCollections && existingCollections.length > 0) {
      collection = existingCollections[0];

      // Sync the collection with current user links
      await syncCollectionLinks(collection.id, user.id);

      return NextResponse.json({ collection });
    }

    // Generate unique share ID
    const shareId = uuidv4().split("-")[0] + uuidv4().split("-")[0];

    const collectionData = {
      id: uuidv4(),
      user_id: user.id,
      share_id: shareId,
      name,
    };

    const { data, error } = await adminSupabase
      .from("collections")
      .insert([collectionData])
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error);
      return NextResponse.json(
        { error: "Failed to create collection" },
        { status: 500 }
      );
    }

    // Sync the new collection with current user links
    await syncCollectionLinks(data.id, user.id);

    return NextResponse.json({ collection: data });
  } catch (error) {
    console.error("Error in POST /api/collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get collection by share ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 });
    }

    // Use admin client for public share functionality
    const adminSupabase = createAdminClient();

    // Get collection
    const { data: collection, error: collectionError } = await adminSupabase
      .from("collections")
      .select("*")
      .eq("share_id", shareId)
      .single();

    if (collectionError || !collection) {
      console.error("Collection not found:", collectionError);
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Get collection links with inner join to ensure we only get existing links
    const { data: collectionLinks, error: linksError } = await adminSupabase
      .from("collection_links")
      .select(
        `
        links!inner (
          id,
          url,
          title,
          description,
          favicon,
          site_name,
          category,
          created_at
        )
      `
      )
      .eq("collection_id", collection.id);

    if (linksError) {
      console.error("Error fetching collection links:", linksError);
      return NextResponse.json(
        { error: "Failed to fetch collection links" },
        { status: 500 }
      );
    }

    // Extract and filter valid links
    const links =
      collectionLinks
        ?.map((cl) => cl.links)
        .filter((link) => link && link.id && link.url) || [];

    return NextResponse.json({
      collection: {
        ...collection,
        links,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
