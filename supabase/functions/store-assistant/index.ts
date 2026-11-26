import { createClient } from 'npm:@supabase/supabase-js@2.119.2';
import './knowledge.js';
import { createAssistantHandler } from './handler.mjs';

Deno.serve(createAssistantHandler({
  createClient,
  env: (name: string) => Deno.env.get(name),
  knowledge: (globalThis as typeof globalThis & { StoreAssistantKnowledge?: unknown }).StoreAssistantKnowledge
}));
