import { NextResponse } from "next/server";
import { db, ensureSchema, newToken, tokenHash } from "@/lib/storage";
import { isUnsafe } from "@/lib/analysis";
export const runtime="nodejs";
export const maxDuration=30;
export async function POST(req:Request) {
 try {
 const body=await req.json();
 const {source,findings,experiment,reviewed}=body??{};
 if(reviewed!==true||typeof source!=="string"||source.length<20||source.length>6000||isUnsafe(source)||!Array.isArray(findings)||findings.length>40) return NextResponse.json({error:"Review a valid Decision Map first."},{status:400});
 if(!experiment||["action","duration","prediction","safetyNote"].some(k=>typeof experiment[k]!=="string"||!experiment[k].trim())) return NextResponse.json({error:"Complete the experiment and prediction before locking."},{status:400});
 if(experiment.action.length>600||experiment.duration.length>120||experiment.prediction.length>600||experiment.safetyNote.length>1000) return NextResponse.json({error:"Experiment text is too long."},{status:400});
 for(const f of findings) if(!f||!["reported_fact","assumption","uncertainty","tradeoff"].includes(f.category)||typeof f.quote!=="string"||typeof f.start!=="number"||typeof f.end!=="number"||source.slice(f.start,f.end)!==f.quote||typeof f.text!=="string"||f.text.length>1000) return NextResponse.json({error:"A finding no longer matches its original source."},{status:400});
 await ensureSchema();
 const token=newToken(),sql=db();
 const rows=await sql`INSERT INTO clarity_experiments(token_hash,source_text,findings,action,duration,prediction,safety_note) VALUES(${tokenHash(token)},${source},${JSON.stringify(findings)}::jsonb,${experiment.action.trim()},${experiment.duration.trim()},${experiment.prediction.trim()},${experiment.safetyNote.trim()}) RETURNING created_at,expires_at`;
 return NextResponse.json({token,createdAt:rows[0].created_at,expiresAt:rows[0].expires_at},{headers:{"Cache-Control":"no-store"}});
 }catch {return NextResponse.json({error:"Unable to lock experiment. Please try again."},{status:500});}
}
