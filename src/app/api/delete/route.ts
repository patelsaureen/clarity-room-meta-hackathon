import { NextResponse } from "next/server";
import { db,ensureSchema,tokenHash } from "@/lib/storage";
export const runtime="nodejs";
export async function POST(req:Request){
 let token:unknown;
 try{token=(await req.json()).token;}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
 if(typeof token!=="string"||!/^[a-zA-Z0-9_-]{43}$/.test(token))return NextResponse.json({error:"Invalid private return token."},{status:400});
 try{
  await ensureSchema();const sql=db();
  const removed=await sql`DELETE FROM clarity_experiments WHERE token_hash=${tokenHash(token)} RETURNING id`;
  return NextResponse.json({deleted:removed.length===1},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Deletion unavailable. Please try again."},{status:500});}
}
