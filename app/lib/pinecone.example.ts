/**
 * Pinecone Service Usage Examples
 *
 * This file demonstrates how to use the PineconeClient for various operations.
 * See app/lib/pinecone.ts for the full implementation.
 */

import {getPineconeClient} from './pinecone';

/**
 * Example 1: Ingest data from JSON files
 */
export async function ingestDataExample() {
  const client = getPineconeClient();

  // Ingest all JSON files from app/data directory
  const result = await client.ingestDataFromFiles('app/data', 'shopify-data');

  console.log(
    `Ingested ${result.products} products and ${result.collections} collections`,
  );
  return result;
}

/**
 * Example 2: Search for products
 */
export async function searchProductsExample() {
  const client = getPineconeClient();

  // Search for products matching a query
  const results = await client.searchProducts('snowboard', 10);

  // Format and display results
  const formatted = client.formatSearchResults(results);
  console.log('Search results:', formatted);

  return formatted;
}

/**
 * Example 3: Search for collections
 */
export async function searchCollectionsExample() {
  const client = getPineconeClient();

  // Search for collections
  const results = await client.searchCollections('hydrogen', 5);

  const formatted = client.formatSearchResults(results);
  console.log('Collection results:', formatted);

  return formatted;
}

/**
 * Example 4: Search with filters
 */
export async function searchWithFiltersExample() {
  const client = getPineconeClient();

  // Search products with price filter
  const results = await client.searchProducts('snowboard', 10, {
    $and: [{product_price: {$gte: '500'}}, {product_currency: {$eq: 'USD'}}],
  });

  return client.formatSearchResults(results);
}

/**
 * Example 5: Upsert custom records
 */
export async function upsertCustomRecordsExample() {
  const client = getPineconeClient();

  const records = [
    {
      _id: 'custom_1',
      content: 'This is a custom product description for semantic search',
      type: 'product',
      category: 'electronics',
      price: '99.99',
      currency: 'USD',
    },
    {
      _id: 'custom_2',
      content: 'Another product with detailed description',
      type: 'product',
      category: 'clothing',
      price: '49.99',
      currency: 'USD',
    },
  ];

  await client.upsertRecords('shopify-data', records);
  console.log('Custom records upserted');
}

/**
 * Example 6: Fetch specific records
 */
export async function fetchRecordsExample() {
  const client = getPineconeClient();

  const records = await client.fetchRecords('shopify-data', [
    'product_gid_shopify_Product_8275108987063',
    'collection_gid_shopify_Collection_318752981175',
  ]);

  console.log('Fetched records:', records);
  return records;
}

/**
 * Example 7: List all record IDs
 */
export async function listAllIdsExample() {
  const client = getPineconeClient();

  // List all product IDs
  const productIds = await client.listAllIds('shopify-data', 'product_');

  // List all collection IDs
  const collectionIds = await client.listAllIds('shopify-data', 'collection_');

  console.log(
    `Found ${productIds.length} products and ${collectionIds.length} collections`,
  );

  return {productIds, collectionIds};
}

/**
 * Example 8: Get index statistics
 */
export async function getStatsExample() {
  const client = getPineconeClient();

  const stats = await client.getIndexStats();
  console.log('Index stats:', stats);

  return stats;
}

/**
 * Example 9: Delete specific records
 */
export async function deleteRecordsExample() {
  const client = getPineconeClient();

  const idsToDelete = ['product_custom_1', 'product_custom_2'];
  await client.deleteRecords('shopify-data', idsToDelete);

  console.log('Records deleted');
}

/**
 * Example 10: Complete workflow - Ingest and search
 */
export async function completeWorkflowExample() {
  const client = getPineconeClient();

  try {
    // Step 1: Check if index exists
    const exists = await client.indexExists();
    if (!exists) {
      console.error(
        'Index does not exist. Please create it using Pinecone CLI:',
      );
      console.error(
        'pc index create -n quickstart -m cosine -c aws -r us-east-1 --model llama-text-embed-v2 --field_map text=content',
      );
      return;
    }

    // Step 2: Ingest data from JSON files
    console.log('Step 1: Ingesting data...');
    const ingestResult = await client.ingestDataFromFiles();
    console.log(
      `✓ Ingested ${ingestResult.products} products and ${ingestResult.collections} collections`,
    );

    // Step 3: Search for products
    console.log('\nStep 2: Searching for products...');
    const productResults = await client.searchProducts('snowboard', 5);
    const formattedProducts = client.formatSearchResults(productResults);
    console.log(`✓ Found ${formattedProducts.length} products`);

    // Step 4: Search for collections
    console.log('\nStep 3: Searching for collections...');
    const collectionResults = await client.searchCollections('hydrogen', 3);
    const formattedCollections = client.formatSearchResults(collectionResults);
    console.log(`✓ Found ${formattedCollections.length} collections`);

    // Step 5: Get index statistics
    console.log('\nStep 4: Getting index statistics...');
    const stats = await client.getIndexStats();
    console.log(`✓ Total records: ${stats.totalRecordCount}`);

    return {
      ingestResult,
      products: formattedProducts,
      collections: formattedCollections,
      stats,
    };
  } catch (error) {
    console.error('Error in workflow:', error);
    throw error;
  }
}
