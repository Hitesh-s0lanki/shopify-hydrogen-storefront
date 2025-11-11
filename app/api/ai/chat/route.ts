import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/modules/search/actions";
import { getRecommendedProducts } from "@/modules/home/actions";
import type { RecommendedProduct } from "@/modules/home/types";

// AI Chat Handler
// In production, integrate with OpenAI, Anthropic, or your preferred AI service
async function getAIResponse(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  // This is a mock AI response - replace with actual AI API call
  // Example with OpenAI:
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful shopping assistant for an e-commerce store. Help users find products, answer questions, and provide recommendations. Be friendly and concise. When users ask about products, search our catalog and show relevant items.'
        },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
  */

  // Mock intelligent responses based on keywords
  const lowerMessage = message.toLowerCase();

  // Product search intent
  if (
    lowerMessage.includes("find") ||
    lowerMessage.includes("search") ||
    lowerMessage.includes("looking for") ||
    lowerMessage.includes("need") ||
    lowerMessage.includes("want") ||
    lowerMessage.includes("show me") ||
    lowerMessage.includes("best sellers") ||
    lowerMessage.includes("bestseller") ||
    lowerMessage.includes("popular")
  ) {
    return "I found some great products for you! Here are my recommendations:";
  }

  // Sale/discount questions
  if (
    lowerMessage.includes("sale") ||
    lowerMessage.includes("discount") ||
    lowerMessage.includes("on sale") ||
    lowerMessage.includes("promo")
  ) {
    return "Let me check our current sales and promotions for you!";
  }

  // Gift recommendations
  if (
    lowerMessage.includes("gift") ||
    lowerMessage.includes("present") ||
    lowerMessage.includes("recommend")
  ) {
    return "I'd be happy to help you find the perfect gift! Let me show you some great options:";
  }

  // Price questions
  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("how much")
  ) {
    return "I can show you product prices. What product are you interested in?";
  }

  // Shipping questions
  if (
    lowerMessage.includes("shipping") ||
    lowerMessage.includes("delivery") ||
    lowerMessage.includes("ship")
  ) {
    return "We offer free shipping on orders over $50. Standard shipping typically takes 3-5 business days. Would you like to know more about our shipping options?";
  }

  // Return policy
  if (
    lowerMessage.includes("return") ||
    lowerMessage.includes("refund") ||
    lowerMessage.includes("exchange")
  ) {
    return "We have a 30-day return policy. Items must be in original condition with tags attached. You can find more details in our return policy page.";
  }

  // General greeting
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    return "Hello! I'm here to help you find the perfect products. What are you looking for today?";
  }

  // Help request
  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("assist") ||
    lowerMessage.includes("support")
  ) {
    return "I'm here to help! I can assist you with:\n• Finding products\n• Answering questions about our store\n• Providing product recommendations\n• Information about shipping and returns\n\nWhat would you like to know?";
  }

  // Default response
  return "I understand you're asking about: " +
    message +
    ". Let me help you with that. I can search for products, answer questions, or provide recommendations. What would you like to do?";
}

// Extract product search terms from message
function extractProductSearchTerms(message: string): string {
  // Simple keyword extraction - in production, use NLP/AI to extract better terms
  const lowerMessage = message.toLowerCase();

  // Remove common question words
  const questionWords = [
    "find",
    "search",
    "looking for",
    "need",
    "want",
    "show me",
    "do you have",
    "where can i find",
    "what",
    "which",
    "how",
  ];

  let searchTerm = message;
  questionWords.forEach((word) => {
    if (lowerMessage.includes(word)) {
      searchTerm = message
        .replace(new RegExp(word, "gi"), "")
        .trim()
        .replace(/[?.,!]/g, "")
        .trim();
    }
  });

  return searchTerm || message;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get AI response
    const aiResponse = await getAIResponse(message, conversationHistory || []);

    // Check if the message seems to be asking for products
    const lowerMessage = message.toLowerCase();
    const isProductSearch =
      lowerMessage.includes("find") ||
      lowerMessage.includes("search") ||
      lowerMessage.includes("looking for") ||
      lowerMessage.includes("need") ||
      lowerMessage.includes("want") ||
      lowerMessage.includes("show me") ||
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("suggest") ||
      lowerMessage.includes("best sellers") ||
      lowerMessage.includes("bestseller") ||
      lowerMessage.includes("popular") ||
      lowerMessage.includes("gift") ||
      lowerMessage.includes("sale") ||
      lowerMessage.includes("discount");

    let products: any[] = [];

    if (isProductSearch) {
      try {
        // Handle special queries
        let searchTerm = extractProductSearchTerms(message);
        
        // For "best sellers" or "popular", search for recently updated products
        if (lowerMessage.includes("best sellers") || lowerMessage.includes("bestseller") || lowerMessage.includes("popular")) {
          searchTerm = ""; // Empty search to get all products, sorted by relevance
        }
        
        // For "sale" or "discount", search for products with compareAtPrice
        if (lowerMessage.includes("sale") || lowerMessage.includes("discount")) {
          searchTerm = searchTerm || "sale";
        }

        if (searchTerm) {
          const searchResults = await searchProducts(searchTerm, 3);
          products = searchResults.products.nodes || [];
        } else {
          // Get recommended products if no specific search term (for best sellers, popular, etc.)
          const recommended = await getRecommendedProducts();
          products = recommended.slice(0, 3).map((p: RecommendedProduct) => ({
            __typename: "Product" as const,
            id: p.id,
            title: p.title,
            handle: p.handle,
            selectedOrFirstAvailableVariant: {
              id: p.id,
              image: p.featuredImage
                ? {
                    url: p.featuredImage.url,
                    altText: p.featuredImage.altText,
                    width: p.featuredImage.width,
                    height: p.featuredImage.height,
                  }
                : null,
              price: p.priceRange.minVariantPrice,
            },
          }));
        }
      } catch (error) {
        console.error("Product search error:", error);
        // Continue without products
      }
    }

    return NextResponse.json({
      response: aiResponse,
      products: products,
    });
  } catch (error) {
    console.error("AI chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

