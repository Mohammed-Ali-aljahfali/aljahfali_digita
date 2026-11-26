import { createClient } from 'npm:@supabase/supabase-js@2.119.2';
import { createUploadHandler } from './handler.mjs';

Deno.serve(createUploadHandler({ createClient, env: (name: string) => Deno.env.get(name) }));
