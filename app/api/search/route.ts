import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/modules/search/actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get("q");
  const first = parseInt(searchParams.get("first") || "5");

  if (!term || term.length < 2) {
    return NextResponse.json({
      products: { nodes: [] },
      pages: { nodes: [] },
      articles: { nodes: [] },
    });
  }

  try {
    const results = await searchProducts(term, first);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

