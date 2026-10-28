"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
export default function ReturnPage(){
 const [token,setToken]=useState<string|null>(null);
 useEffect(()=>{setToken(new URLSearchParams(window.location.search).get("token")??"");},[]);
 const [data,setData]=useState<any>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{if(token===null)return;if(!token){setError("Missing return token.");setLoading(false);return;}fetch("/api/return?token="+encodeURIComponent(token),{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setData(d.experiment);}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[token]);
 return <main className="shell"><header className="topbar"><div className="brand"><span className="mark">✳</span>CLARITY <strong>ROOM</strong></div><span className="badge">PRIVATE EXPERIMENT RETURN</span></header><section className="workspace" style={{marginTop:65}}><div className="card"><span className="step">04 / YOUR LOCKED EXPERIMENT</span><h1>Return to your prediction.</h1>{loading&&<p>Loading your private experiment…</p>}{error&&<p role="alert">{error}</p>}{data&&<><p>Your original prediction is locked. It cannot be rewritten after the outcome.</p><div className="quote"><h3>Experiment</h3><p>{data.action}</p><p><strong>Duration:</strong> {data.duration}</p></div><div className="quote" style={{marginTop:14}}><h3>Original prediction · locked</h3><p>{data.prediction}</p></div><p className="fine">Saved {new Date(data.created_at).toLocaleString()}. This private link expires {new Date(data.expires_at).toLocaleDateString()}.</p><p className="fine">Outcome recording and Decision Map v2 are the next build stage.</p></>}<div className="actions"><Link href="/" style={{color:"#b7e0ca"}}>← Start a new decision</Link></div></div></section></main>;
}
