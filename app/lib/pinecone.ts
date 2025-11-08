import {Pinecone, Index} from '@pinecone-database/pinecone';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pinecone Service
 *
 * Comprehensive implementation of Pinecone operations following AGENTS.md best practices.
 * This service handles all data operations including ingestion from JSON files.
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
 * PineconeClient - Main service class for Pinecone operations
 */
export class PineconeClient {
  private pc: Pinecone;
  private indexName: string;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    this.pc = new Pinecone({apiKey});
    this.indexName = process.env.PINECONE_INDEX || 'quickstart';
  }

  /**
   * Get the Pinecone index instance
   */
  getIndex(): Index {
    return this.pc.index(this.indexName);
  }

  /**
   * Get the index name
   */
  getIndexName(): string {
    return this.indexName;
  }

  /**
   * Check if index exists
   */
  async indexExists(): Promise<boolean> {
    try {
      const indexList = await this.pc.listIndexes();
      return (
        indexList.indexes?.some((idx) => idx.name === this.indexName) ?? false
      );
    } catch (error) {
      console.error('Error checking index existence:', error);
      return false;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats() {
    try {
      const index = this.getIndex();
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('Error getting index stats:', error);
      throw error;
    }
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
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Check every 5 seconds
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

        // Only retry transient errors
        if (statusCode && (statusCode >= 500 || statusCode === 429)) {
          if (attempt < maxRetries - 1) {
            const delay = Math.min(2 ** attempt * 1000, 60000); // Exponential backoff, cap at 60s
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        } else {
          throw error; // Don't retry client errors (4xx except 429)
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
    const index = this.getIndex();

    // Batch processing to respect limits (96 for text records)
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.exponentialBackoffRetry(async () => {
        await index.namespace(namespace).upsertRecords(batch);
      });
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Update existing records
   */
  async updateRecords(
    namespace: string,
    records: Array<Record<string, any>>,
  ): Promise<void> {
    // Updates use the same upsert operation with existing IDs
    await this.upsertRecords(namespace, records);
  }

  /**
   * Fetch records by IDs
   */
  async fetchRecords(
    namespace: string,
    ids: string[],
  ): Promise<Record<string, any>> {
    try {
      const index = this.getIndex();
      const result = await index.namespace(namespace).fetch(ids);
      return result.records || {};
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  /**
   * List all record IDs (paginated)
   */
  async listAllIds(namespace: string, prefix?: string): Promise<string[]> {
    const index = this.getIndex();
    const allIds: string[] = [];
    let paginationToken: string | undefined = undefined;

    while (true) {
      const result = await index.namespace(namespace).listPaginated({
        prefix,
        limit: 1000,
        paginationToken,
      });

      allIds.push(...(result.vectors?.map((record) => record.id ?? '') ?? []));

      if (!result.pagination || !result.pagination.next) {
        break;
      }
      paginationToken = result.pagination.next;
    }

    return allIds;
  }

  /**
   * Semantic search with reranking (best practice)
   */
  async searchWithRerank(
    namespace: string,
    queryText: string,
    topK = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResults> {
    const index = this.getIndex();

    const queryOptions: any = {
      topK: topK * 2, // More candidates for reranking
      inputs: {
        text: queryText,
      },
    };

    // Only add filter if provided
    if (filter) {
      queryOptions.filter = filter;
    }

    const results = await index.namespace(namespace).searchRecords({
      query: queryOptions,
      rerank: {
        model: 'bge-reranker-v2-m3',
        topN: topK,
        rankFields: ['content'],
      },
    });

    return results as SearchResults;
  }

  /**
   * Semantic search without reranking
   */
  async search(
    namespace: string,
    queryText: string,
    topK = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResults> {
    const index = this.getIndex();

    const queryOptions: any = {
      topK,
      inputs: {
        text: queryText,
      },
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    const results = await index.namespace(namespace).searchRecords({
      query: queryOptions,
    });

    return results as SearchResults;
  }

  /**
   * Lexical search (keyword-based)
   */
  async lexicalSearch(
    namespace: string,
    queryText: string,
    topK = 5,
    requiredTerms?: string[],
  ): Promise<SearchResults> {
    const index = this.getIndex();

    const queryOptions: any = {
      inputs: {text: queryText},
      topK,
    };

    if (requiredTerms && requiredTerms.length > 0) {
      queryOptions.matchTerms = requiredTerms;
    }

    const results = await index.namespace(namespace).searchRecords({
      query: queryOptions,
    });

    return results as SearchResults;
  }

  /**
   * Delete records by IDs
   */
  async deleteRecords(namespace: string, ids: string[]): Promise<void> {
    try {
      const index = this.getIndex();
      await index.namespace(namespace).deleteMany(ids);
    } catch (error) {
      console.error('Error deleting records:', error);
      throw error;
    }
  }

  /**
   * Delete entire namespace
   */
  async deleteNamespace(namespace: string): Promise<void> {
    try {
      const index = this.getIndex();
      await index.namespace(namespace).deleteAll();
    } catch (error) {
      console.error('Error deleting namespace:', error);
      throw error;
    }
  }

  /**
   * Ingest data from JSON files in /data directory
   *
   * This method reads JSON files from app/data/ and ingests product and collection data
   * into Pinecone with proper formatting for semantic search.
   */
  async ingestDataFromFiles(
    dataDir: string = 'app/data',
    namespace: string = 'shopify-data',
  ): Promise<{products: number; collections: number}> {
    try {
      const fullPath = path.resolve(process.cwd(), dataDir);

      // Check if directory exists
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Data directory not found: ${fullPath}`);
      }

      // Find all JSON files in the directory
      const files = fs
        .readdirSync(fullPath)
        .filter((file) => file.endsWith('.json'));

      if (files.length === 0) {
        throw new Error(`No JSON files found in ${fullPath}`);
      }

      let totalProducts = 0;
      let totalCollections = 0;
      const allRecords: Array<Record<string, any>> = [];

      // Process each JSON file
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data: ExportData = JSON.parse(fileContent) as ExportData;

        // Process products
        if (data.data?.products && Array.isArray(data.data.products)) {
          for (const product of data.data.products) {
            // Create searchable content from product data
            const contentParts: string[] = [
              product.title,
              product.handle,
              product.description || '',
              product.vendor || '',
            ];

            // Add price information
            if (product.priceRange?.minVariantPrice) {
              contentParts.push(
                `Price: ${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`,
              );
            }

            // Add image alt text if available
            if (product.featuredImage?.altText) {
              contentParts.push(product.featuredImage.altText);
            }

            const content = contentParts.filter(Boolean).join(' ');

            // Create record with flat metadata structure (no nested objects)
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
        if (data.data?.collections && Array.isArray(data.data.collections)) {
          for (const collection of data.data.collections) {
            // Create searchable content from collection data
            const contentParts: string[] = [
              collection.title,
              collection.handle,
              collection.description || '',
            ];

            // Add image alt text if available
            if (collection.image?.altText) {
              contentParts.push(collection.image.altText);
            }

            const content = contentParts.filter(Boolean).join(' ');

            // Create record with flat metadata structure
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
      }

      if (allRecords.length === 0) {
        console.warn('No products or collections found in JSON files');
        return {products: 0, collections: 0};
      }

      // Upsert all records in batches
      console.warn(
        `Ingesting ${allRecords.length} records (${totalProducts} products, ${totalCollections} collections)...`,
      );
      await this.upsertRecords(namespace, allRecords);

      // Wait for records to be indexed
      console.warn('Waiting for records to be indexed...');
      await this.waitForRecords(namespace, allRecords.length);

      console.warn(
        `✓ Successfully ingested ${totalProducts} products and ${totalCollections} collections`,
      );

      return {
        products: totalProducts,
        collections: totalCollections,
      };
    } catch (error) {
      console.error('Error ingesting data from files:', error);
      throw error;
    }
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
   * Get formatted search results
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
}

// Export singleton instance
let pineconeClient: PineconeClient | null = null;

/**
 * Get or create Pinecone client instance
 */
export function getPineconeClient(): PineconeClient {
  if (!pineconeClient) {
    pineconeClient = new PineconeClient();
  }
  return pineconeClient;
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
