/**
 * Pinecone REST API Client
 *
 * Workers-compatible implementation using fetch API instead of Node.js SDK.
 * This version works in Cloudflare Workers environment.
 */

// Type definitions
interface Document {
  content: string;
  category?: string;
  [key: string]: any;
}

interface SearchHit {
  _id: string;
  _score: number;
  fields: Record<string, any>;
  metadata?: Record<string, any>;
}

interface SearchResults {
  result: {
    hits: SearchHit[];
    matches?: number;
  };
}

interface ProductData {
  id: string;
  title: string;
  handle: string;
  priceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    width: number;
    height: number;
  };
  description?: string;
  vendor?: string;
}

interface CollectionData {
  id: string;
  title: string;
  handle: string;
  image?: {
    id: string;
    url: string;
    altText?: string | null;
    width: number;
    height: number;
  };
  description?: string;
}

interface ExportData {
  success: boolean;
  message?: string;
  data?: {
    products?: ProductData[];
    collections?: CollectionData[];
  };
}

/**
 * Pinecone REST API Client - Workers compatible
 */
export class PineconeRestClient {
  private apiKey: string;
  private indexName: string;
  private baseUrl: string;

  constructor(apiKey?: string, indexName?: string, indexHost?: string) {
    this.apiKey =
      apiKey ||
      (typeof process !== 'undefined' && process.env?.PINECONE_API_KEY) ||
      '';
    if (!this.apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    this.indexName = indexName || 'quickstart';

    // Get index host from parameter or environment variable
    // Format: https://{index-name}-{project-id}.svc.{environment}.pinecone.io
    // You can find this in Pinecone dashboard under your index settings
    this.baseUrl =
      indexHost ||
      (typeof process !== 'undefined' && process.env?.PINECONE_INDEX_HOST) ||
      '';

    if (!this.baseUrl) {
      throw new Error(
        'PINECONE_INDEX_HOST environment variable is required. ' +
          'Format: https://{index-name}-{project-id}.svc.{environment}.pinecone.io. ' +
          'Find this in your Pinecone dashboard under index settings.',
      );
    }

    // Remove trailing slash if present
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  /**
   * Get the index name
   */
  getIndexName(): string {
    return this.indexName;
  }

  /**
   * Make authenticated request to Pinecone API
   */
  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Pinecone API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response;
  }

  /**
   * Check if index exists
   */
  async indexExists(): Promise<boolean> {
    try {
      // Use describe_index_stats endpoint
      const response = await this.request('/describe_index_stats');
      await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    const response = await this.request('/describe_index_stats');
    return response.json();
  }

  /**
   * Wait for records to be indexed (eventual consistency)
   */
  async waitForRecords(
    namespace: string,
    expectedCount: number,
    maxWaitSeconds = 300,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const stats = await this.getIndexStats();
      const count = stats.namespaces?.[namespace]?.recordCount ?? 0;

      if (count >= expectedCount) {
        console.warn(`✓ All ${count} records indexed`);
        return;
      }

      console.warn(`⏳ Indexed ${count}/${expectedCount} records, waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error(
      `Timeout: Records not fully indexed after ${maxWaitSeconds}s`,
    );
  }

  /**
   * Exponential backoff retry pattern
   */
  private async exponentialBackoffRetry<T>(
    func: () => Promise<T>,
    maxRetries = 5,
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await func();
      } catch (error: any) {
        const statusCode = error.status || error.statusCode;

        if (statusCode && (statusCode >= 500 || statusCode === 429)) {
          if (attempt < maxRetries - 1) {
            const delay = Math.min(2 ** attempt * 1000, 60000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Upsert records into a namespace
   */
  async upsertRecords(
    namespace: string,
    records: Array<Record<string, any>>,
    batchSize = 96,
  ): Promise<void> {
    // Batch processing to respect limits (96 for text records)
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.exponentialBackoffRetry(async () => {
        const response = await this.request(`/vectors/upsert`, {
          method: 'POST',
          body: JSON.stringify({
            namespace,
            records: batch,
          }),
        });
        if (!response.ok) {
          throw new Error(`Upsert failed: ${response.statusText}`);
        }
      });
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Search records with reranking
   */
  async searchWithRerank(
    namespace: string,
    queryText: string,
    topK = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResults> {
    const queryOptions: any = {
      topK: topK * 2,
      inputs: {
        text: queryText,
      },
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    const response = await this.request(`/query`, {
      method: 'POST',
      body: JSON.stringify({
        namespace,
        query: queryOptions,
        rerank: {
          model: 'bge-reranker-v2-m3',
          topN: topK,
          rankFields: ['content'],
        },
      }),
    });

    return response.json() as Promise<SearchResults>;
  }

  /**
   * Search products
   */
  async searchProducts(
    query: string,
    topK = 10,
    filters?: Record<string, any>,
  ): Promise<SearchResults> {
    const namespace = 'shopify-data';
    const filter = filters
      ? {...filters, type: {$eq: 'product'}}
      : {type: {$eq: 'product'}};

    return this.searchWithRerank(namespace, query, topK, filter);
  }

  /**
   * Search collections
   */
  async searchCollections(
    query: string,
    topK = 10,
    filters?: Record<string, any>,
  ): Promise<SearchResults> {
    const namespace = 'shopify-data';
    const filter = filters
      ? {...filters, type: {$eq: 'collection'}}
      : {type: {$eq: 'collection'}};

    return this.searchWithRerank(namespace, query, topK, filter);
  }

  /**
   * Format search results
   */
  formatSearchResults(results: SearchResults): Array<{
    id: string;
    score: number;
    content: string;
    metadata: Record<string, any>;
  }> {
    const formatted: Array<{
      id: string;
      score: number;
      content: string;
      metadata: Record<string, any>;
    }> = [];

    for (const hit of results.result.hits) {
      const fields = hit.fields as Record<string, any>;
      formatted.push({
        id: hit._id,
        score: hit._score,
        content: String(fields?.content ?? ''),
        metadata: fields || {},
      });
    }

    return formatted;
  }

  /**
   * Ingest data from JSON (for Workers - data must be passed, not read from filesystem)
   */
  async ingestDataFromJson(
    jsonData: ExportData,
    namespace: string = 'shopify-data',
  ): Promise<{products: number; collections: number}> {
    let totalProducts = 0;
    let totalCollections = 0;
    const allRecords: Array<Record<string, any>> = [];

    // Process products
    if (jsonData.data?.products && Array.isArray(jsonData.data.products)) {
      for (const product of jsonData.data.products) {
        const contentParts: string[] = [
          product.title,
          product.handle,
          product.description || '',
          product.vendor || '',
        ];

        if (product.priceRange?.minVariantPrice) {
          contentParts.push(
            `Price: ${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`,
          );
        }

        if (product.featuredImage?.altText) {
          contentParts.push(product.featuredImage.altText);
        }

        const content = contentParts.filter(Boolean).join(' ');

        const record: Record<string, any> = {
          _id: `product_${product.id.replace(/[^a-zA-Z0-9]/g, '_')}`,
          content,
          type: 'product',
          product_id: product.id,
          product_title: product.title,
          product_handle: product.handle,
          product_price: product.priceRange?.minVariantPrice?.amount || '0',
          product_currency:
            product.priceRange?.minVariantPrice?.currencyCode || 'USD',
          product_image_url: product.featuredImage?.url || '',
          product_image_alt: product.featuredImage?.altText || '',
        };

        allRecords.push(record);
        totalProducts++;
      }
    }

    // Process collections
    if (
      jsonData.data?.collections &&
      Array.isArray(jsonData.data.collections)
    ) {
      for (const collection of jsonData.data.collections) {
        const contentParts: string[] = [
          collection.title,
          collection.handle,
          collection.description || '',
        ];

        if (collection.image?.altText) {
          contentParts.push(collection.image.altText);
        }

        const content = contentParts.filter(Boolean).join(' ');

        const record: Record<string, any> = {
          _id: `collection_${collection.id.replace(/[^a-zA-Z0-9]/g, '_')}`,
          content,
          type: 'collection',
          collection_id: collection.id,
          collection_title: collection.title,
          collection_handle: collection.handle,
          collection_image_url: collection.image?.url || '',
          collection_image_alt: collection.image?.altText || '',
        };

        allRecords.push(record);
        totalCollections++;
      }
    }

    if (allRecords.length === 0) {
      console.warn('No products or collections found in JSON data');
      return {products: 0, collections: 0};
    }

    console.warn(
      `Ingesting ${allRecords.length} records (${totalProducts} products, ${totalCollections} collections)...`,
    );
    await this.upsertRecords(namespace, allRecords);

    console.warn('Waiting for records to be indexed...');
    await this.waitForRecords(namespace, allRecords.length);

    console.warn(
      `✓ Successfully ingested ${totalProducts} products and ${totalCollections} collections`,
    );

    return {
      products: totalProducts,
      collections: totalCollections,
    };
  }
}

// Export singleton instance
let pineconeRestClient: PineconeRestClient | null = null;

/**
 * Get or create Pinecone REST client instance (Workers compatible)
 */
export function getPineconeRestClient(
  apiKey?: string,
  indexName?: string,
  indexHost?: string,
): PineconeRestClient {
  if (!pineconeRestClient) {
    pineconeRestClient = new PineconeRestClient(apiKey, indexName, indexHost);
  }
  return pineconeRestClient;
}

// Export types
export type {
  Document,
  SearchHit,
  SearchResults,
  ProductData,
  CollectionData,
  ExportData,
};
