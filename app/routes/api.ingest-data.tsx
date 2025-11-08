import type {Route} from './+types/api.ingest-data';
import {getPineconeRestClient} from '~/lib/pinecone-rest';

/**
 * Route to ingest data from JSON files into Pinecone
 *
 * This route reads product and collection data from app/data/*.json files
 * and ingests them into Pinecone for semantic search.
 *
 * Usage:
 * - POST /api/ingest-data - Ingest data with default settings
 * - POST /api/ingest-data?dataDir=app/data&namespace=shopify-data - Custom directory and namespace
 *
 * Request body (optional):
 * {
 *   "dataDir": "app/data",
 *   "namespace": "shopify-data"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "products": 15,
 *   "collections": 3,
 *   "message": "Successfully ingested 15 products and 3 collections"
 * }
 */
export async function action({request, context}: Route.ActionArgs) {
  try {
    const {env} = context;

    // Get Pinecone API key and index host from environment
    const apiKey =
      env.PINECONE_API_KEY ||
      (typeof process !== 'undefined' && process.env?.PINECONE_API_KEY) ||
      '';
    const indexHost =
      env.PINECONE_INDEX_HOST ||
      (typeof process !== 'undefined' && process.env?.PINECONE_INDEX_HOST) ||
      '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pinecone API key is not configured',
          hint: 'Make sure PINECONE_API_KEY is set in your .env file and restart the dev server',
        }),
        {
          status: 500,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    if (!indexHost) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pinecone index host is not configured',
          hint:
            'Make sure PINECONE_INDEX_HOST is set in your .env file. ' +
            'Format: https://{index-name}-{project-id}.svc.{environment}.pinecone.io. ' +
            'Find this in your Pinecone dashboard under index settings.',
        }),
        {
          status: 500,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    // Parse request body and query parameters
    const url = new URL(request.url);
    let body: {namespace?: string; useExportEndpoint?: boolean} = {};

    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = (await request.json()) as {
          namespace?: string;
          useExportEndpoint?: boolean;
        };
      }
    } catch {
      // Body parsing failed, use query params instead
    }

    // Get parameters from body or query params, with defaults
    const namespace =
      body.namespace || url.searchParams.get('namespace') || 'shopify-data';
    const useExportEndpoint =
      body.useExportEndpoint !== false &&
      url.searchParams.get('useExportEndpoint') !== 'false';

    // Get Pinecone REST client (Workers compatible)
    const client = getPineconeRestClient(apiKey, undefined, indexHost);
    const indexExists = await client.indexExists();

    if (!indexExists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pinecone index does not exist',
          hint:
            'Please create the index using Pinecone CLI:\n' +
            'pc index create -n quickstart -m cosine -c aws -r us-east-1 \\\n' +
            '  --model llama-text-embed-v2 --field_map text=content',
          indexName: client.getIndexName(),
        }),
        {
          status: 400,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    // Fetch data from export endpoint or use provided data
    let jsonData;
    if (useExportEndpoint) {
      try {
        // Fetch from the export-data endpoint
        const baseUrl = new URL(request.url).origin;
        const exportResponse = await fetch(`${baseUrl}/api/export-data`);
        if (!exportResponse.ok) {
          throw new Error('Failed to fetch data from export endpoint');
        }
        jsonData = (await exportResponse.json()) as any;
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to fetch data from export endpoint',
            details: error instanceof Error ? error.message : 'Unknown error',
            hint: 'Make sure /api/export-data endpoint is accessible',
          }),
          {
            status: 500,
            headers: {'Content-Type': 'application/json'},
          },
        );
      }
    } else {
      // Try to get data from request body
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const requestBody = (await request.json()) as any;
          if (requestBody.data) {
            jsonData = requestBody;
          }
        }
      } catch {
        // Ignore
      }

      if (!jsonData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No data provided',
            hint: 'Either set useExportEndpoint=true to fetch from /api/export-data, or provide data in request body',
          }),
          {
            status: 400,
            headers: {'Content-Type': 'application/json'},
          },
        );
      }
    }

    // Ingest data from JSON
    const result = await client.ingestDataFromJson(jsonData, namespace);

    return new Response(
      JSON.stringify({
        success: true,
        products: result.products,
        collections: result.collections,
        total: result.products + result.collections,
        message: `Successfully ingested ${result.products} products and ${result.collections} collections`,
        namespace,
      }),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    );
  } catch (error) {
    console.error('Error ingesting data:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while ingesting data',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack:
          error instanceof Error && process.env.NODE_ENV === 'development'
            ? error.stack
            : undefined,
      }),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }
}

/**
 * GET endpoint to check ingestion status and provide information
 */
export async function loader({context}: Route.LoaderArgs) {
  try {
    const {env} = context;

    // Get Pinecone API key and index host from environment
    const apiKey =
      env.PINECONE_API_KEY ||
      (typeof process !== 'undefined' && process.env?.PINECONE_API_KEY) ||
      '';
    const indexHost =
      env.PINECONE_INDEX_HOST ||
      (typeof process !== 'undefined' && process.env?.PINECONE_INDEX_HOST) ||
      '';

    if (!apiKey || !indexHost) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pinecone configuration is incomplete',
          hint: 'Make sure both PINECONE_API_KEY and PINECONE_INDEX_HOST are set in your .env file',
        }),
        {
          status: 500,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    const client = getPineconeRestClient(apiKey, indexHost, indexHost);
    const indexExists = await client.indexExists();

    if (!indexExists) {
      return new Response(
        JSON.stringify({
          success: false,
          indexExists: false,
          message: 'Pinecone index does not exist',
          hint: 'Create the index using: pc index create -n quickstart -m cosine -c aws -r us-east-1 --model llama-text-embed-v2 --field_map text=content',
        }),
        {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    // Get index statistics
    const stats = await client.getIndexStats();
    const namespace = 'shopify-data';
    const namespaceStats = stats.namespaces?.[namespace];

    return new Response(
      JSON.stringify({
        success: true,
        indexExists: true,
        indexName: client.getIndexName(),
        stats: {
          totalRecords: stats.totalRecordCount || 0,
          namespaces: Object.keys(stats.namespaces || {}),
          namespaceStats: namespaceStats
            ? {
                recordCount: namespaceStats.recordCount || 0,
              }
            : null,
        },
        usage: {
          ingest: 'POST /api/ingest-data',
          ingestWithParams:
            'POST /api/ingest-data?dataDir=app/data&namespace=shopify-data',
          requestBody: {
            dataDir: 'app/data (optional)',
            namespace: 'shopify-data (optional)',
          },
        },
      }),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    );
  } catch (error) {
    console.error('Error getting ingestion status:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while checking status',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }
}
