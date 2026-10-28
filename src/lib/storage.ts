import { neon } from "@neondatabase/serverless";
import { createHash, randomBytes } from "node:crypto";

export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function newToken() { return randomBytes(32).toString("base64url"); }
export function db() {
 const url=process.env.DATABASE_URL;
 if(!url) throw new Error("Database connection unavailable");
 return neon(url);
}
export async function ensureSchema() {
 const sql=db();
 await sql`CREATE TABLE IF NOT EXISTS clarity_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  source_text text NOT NULL,
  findings jsonb NOT NULL,
  action text NOT NULL,
  duration text NOT NULL,
  prediction text NOT NULL,
  safety_note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  outcome_text text,
  returned_at timestamptz,
  map_v2 jsonb
 )`;
 await sql`CREATE OR REPLACE FUNCTION clarity_guard_lock() RETURNS trigger LANGUAGE plpgsql AS $$
 BEGIN
 IF NEW.token_hash IS DISTINCT FROM OLD.token_hash OR NEW.source_text IS DISTINCT FROM OLD.source_text OR NEW.findings IS DISTINCT FROM OLD.findings OR NEW.action IS DISTINCT FROM OLD.action OR NEW.duration IS DISTINCT FROM OLD.duration OR NEW.prediction IS DISTINCT FROM OLD.prediction OR NEW.safety_note IS DISTINCT FROM OLD.safety_note OR NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
 RAISE EXCEPTION 'Locked prediction cannot be modified';
 END IF;
 RETURN NEW;
 END $$`;
 await sql`DELETE FROM clarity_experiments WHERE expires_at <= now()`;
 await sql`DO $ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'clarity_immutable_lock') THEN CREATE TRIGGER clarity_immutable_lock BEFORE UPDATE ON clarity_experiments FOR EACH ROW EXECUTE FUNCTION clarity_guard_lock(); END IF; END $$`;
}
