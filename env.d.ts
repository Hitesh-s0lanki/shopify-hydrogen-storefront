/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';
import type {HydrogenEnv} from '@shopify/hydrogen';

// Extend the Env interface to include API keys
declare global {
  interface Env extends HydrogenEnv {
    OPENAI_API_KEY?: string;
    PINECONE_API_KEY?: string;
    PINECONE_INDEX?: string;
    PINECONE_INDEX_HOST?: string;
  }
}
