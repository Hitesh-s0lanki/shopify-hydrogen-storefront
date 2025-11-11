import { NextRequest, NextResponse } from "next/server";
import { predictiveSearch } from "@/modules/search/actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!term || term.length < 2) {
    return NextResponse.json({
      products: [],
      collections: [],
      queries: [],
    });
  }

  try {
    const results = await predictiveSearch(term, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Predictive search API error:", error);
    return NextResponse.json(
      { error: "Predictive search failed" },
      { status: 500 }
    );
  }
}

