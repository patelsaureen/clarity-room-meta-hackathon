import { NextResponse } from "next/server";
import { db, ensureSchema, tokenHash } from "@/lib/storage";
export const runtime="nodejs";
export async function GET(req:Request) {
 const token=new URL(req.url).searchParams.get("token")??"";
 if(!/^[a-zA-Z0-9_-]{43}$/.test(token)) return NextResponse.json({error:"Invalid return link."},{status:400});
 try {
 await ensureSchema();const sql=db();
 const rows=await sql`SELECT source_text,findings,action,duration,prediction,safety_note,created_at,expires_at,outcome_text,returned_at,map_v2 FROM clarity_experiments WHERE token_hash=${tokenHash(token)} AND expires_at>now() LIMIT 1`;
 if(!rows.length)return NextResponse.json({error:"Return link expired or unavailable."},{status:404});
 return NextResponse.json({experiment:rows[0]},{headers:{"Cache-Control":"no-store, private"}});
 }catch{return NextResponse.json({error:"Unable to load saved experiment."},{status:500});}
}
