"use client";
import { useState, useEffect, useRef } from "react";
import type { Analysis, Finding } from "@/lib/analysis";
import { segmentTranscript, quoteMatches } from "@/lib/transcript";

const example = "I was offered a team lead role. It pays more, but I worry I will spend all day in meetings. I enjoy helping teammates one-on-one. I don't know how much time the role actually spends in meetings.";
const categories: Finding["category"][] = ["reported_fact","assumption","uncertainty","tradeoff"];
const labels: Record<Finding["category"],string> = {reported_fact:"User-reported facts",assumption:"Assumptions",uncertainty:"Uncertainties",tradeoff:"Trade-offs"};

export default function Home() {
 const [consent,setConsent]=useState(false);
 const [input,setInput]=useState("");
 const [source,setSource]=useState<string|null>(null);
 const [map,setMap]=useState<(Analysis & {degraded?:boolean})|null>(null);
 const [findings,setFindings]=useState<Finding[]>([]);
 const [experiment,setExperiment]=useState({action:"",duration:"",prediction:"",safetyNote:""});
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [reviewed,setReviewed]=useState(false);
 const [returnToken,setReturnToken]=useState("");
 const [locking,setLocking]=useState(false);
 const [voiceStatus,setVoiceStatus]=useState(""),[voicePhase,setVoicePhase]=useState<"idle"|"requesting"|"listening">("idle"),[voiceSupported,setVoiceSupported]=useState(false),[voiceSeconds,setVoiceSeconds]=useState(0);
 const recognitionRef=useRef<any>(null);
 useEffect(()=>{const w=window as any;setVoiceSupported(Boolean(w.SpeechRecognition||w.webkitSpeechRecognition));return()=>{recognitionRef.current?.abort();};},[]);
 useEffect(()=>{if(voicePhase!=="listening")return;const id=window.setInterval(()=>setVoiceSeconds(s=>s+1),1000);return()=>window.clearInterval(id);},[voicePhase]);
 function toggleVoice(){
  if(voicePhase==="listening"){recognitionRef.current?.stop();setVoicePhase("idle");setVoiceStatus("Recording stopped. Review and edit your transcript before continuing.");return;}
  if(voicePhase==="requesting")return;
  const w=window as any;const Recognition=w.SpeechRecognition||w.webkitSpeechRecognition;
  if(!Recognition){setVoiceStatus("Voice transcription is unavailable in this browser. Type your decision instead.");return;}
  const rec=new Recognition();rec.lang="en-US";rec.continuous=true;rec.interimResults=false;
  rec.onstart=()=>{setVoicePhase("listening");setVoiceStatus("Listening. Your words will appear in the editable text box.");};
  rec.onresult=(event:any)=>{let spoken="";for(let i=event.resultIndex;i<event.results.length;i++){if(event.results[i].isFinal)spoken+=event.results[i][0].transcript+" ";}if(spoken)setInput(prev=>(prev.trim()?prev.trim()+" ":"")+spoken.trim());};
  rec.onerror=(event:any)=>{setVoicePhase("idle");setVoiceStatus(event.error==="not-allowed"?"Microphone denied. Allow microphone access in your browser's site permissions, then select Retry microphone. You can always type.":event.error==="no-speech"?"No speech detected. Select Retry microphone or type your decision.":"Voice stopped. Select Retry microphone or type your decision.");};
  rec.onend=()=>setVoicePhase("idle");
  recognitionRef.current=rec;setVoiceSeconds(0);setVoicePhase("requesting");setVoiceStatus("Requesting microphone permission…");
  try{rec.start();}catch{setVoicePhase("idle");setVoiceStatus("Could not start microphone. Check your browser's site permissions, then retry or type.");}
 }

 const segments=segmentTranscript(source??"");
 const updateFinding=(id:string, patch:Partial<Finding>)=>{setReviewed(false);setFindings(items=>items.map(f=>f.id===id?{...f,...patch}:f));};
 const reset=()=>{setReturnToken("");setInput("");setSource(null);setMap(null);setFindings([]);setError("");setReviewed(false);};
 async function lockPrediction(){
  if(!source||!reviewed||locking)return;
  setLocking(true);setError("");
  try{const res=await fetch("/api/lock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({source,findings,experiment,reviewed}),cache:"no-store"});const data=await res.json();if(!res.ok)throw new Error(data.error??"Lock failed.");setReturnToken(data.token);}
  catch(e){setError(e instanceof Error?e.message:"Lock failed.");}
  finally{setLocking(false);}
 }
 async function analyze(){
  if(!source||loading)return;
  setLoading(true);setError("");setMap(null);setReviewed(false);
  try{
   const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:source}),cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(typeof data.error==="string"?data.error:"Analysis failed.");
   if(!Array.isArray(data.findings))throw new Error("Invalid response from analysis.");
   setMap(data as Analysis);
   setFindings(data.findings);
   setExperiment({action:data.experiment?.action??"",duration:data.experiment?.duration??"",prediction:data.experiment?.prediction??"",safetyNote:data.experiment?.safetyNote??""});
  }catch(e){setError(e instanceof Error?e.message:"Analysis failed.");}
  finally{setLoading(false);}
 }
 return <main className="shell">
  <header className="topbar"><div className="brand"><span className="mark">✳</span><span>CLARITY <strong>ROOM</strong></span></div><span className="badge">META AI · EXPERIMENTAL BUILD</span></header>
  <section className="hero"><div className="eyebrow">A BETTER WAY TO DECIDE</div><h1>Clarity begins with<br/><em>one small experiment.</em></h1><p>Not an answer handed to you. A clearer picture of what you know, what you assume, and what you could safely test.</p></section>
  <section className="workspace">
   {!consent?<div className="card"><span className="step">BEFORE WE BEGIN</span><h2>Your decision stays yours.</h2><p>Non-clinical decision reflection only; not therapy, medical advice or emergency support. When you analyze, your text is sent to Meta AI. Do not enter sensitive personal information. If you lock an experiment, its text and prediction are stored for 30 days and accessible through a private return link.</p><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I understand and want to continue.</label></div>
   :source===null?<div className="card"><span className="step">01 / DESCRIBE</span><h2>What's the decision on your mind?</h2><p>Describe the situation naturally. You can correct your words before analysis.</p><label className="field-label" htmlFor="decision">YOUR WORDS</label><textarea id="decision" maxLength={6000} value={input} onChange={e=>setInput(e.target.value)} placeholder="I have an opportunity, but I'm not sure…"/><div className="actions">{voiceSupported&&<button className="secondary" type="button" disabled={voicePhase==="requesting"} onClick={toggleVoice}>{voicePhase==="listening"?`■ Stop recording (${Math.floor(voiceSeconds/60)}:${String(voiceSeconds%60).padStart(2,"0")})`:voicePhase==="requesting"?"Requesting microphone…":voiceStatus.includes("denied")||voiceStatus.includes("Could not start")?"🎙 Retry microphone":"🎙 Speak my decision"}</button>}<button className="secondary" onClick={()=>setInput(example)}>Try example</button><button disabled={input.trim().length<20} onClick={()=>setSource(input.trim())}>Continue →</button></div><p className="fine" role="status" style={{whiteSpace:"normal",overflowWrap:"anywhere",maxWidth:"100%",lineHeight:1.6}}>{voiceStatus||"Voice transcription is available on supported browsers. Review and edit the transcript before continuing; typed input always works."}</p></div>
   :<div className="card"><span className="step">{map?"03 / DECISION MAP V1 · REVIEW":"02 / VERIFY & ANALYZE"}</span><h2>{map?"Your first Decision Map":"Make sure we heard you correctly."}</h2>
    {!map&&<><p>These segments reference your original text, not AI conclusions.</p><div className="quote-list">{segments.map(s=><div className="quote" key={s.id}><small>{s.id} · {s.start}–{s.end} · {quoteMatches(source,s)?"Exact source match":"Mismatch"}</small><p>“{s.text}”</p></div>)}</div></>}
    {error&&<p role="alert" style={{color:"#ffc4b6"}}>{error}</p>}
    {map&&<><p>Powered by Meta Muse Spark ({map.model}). These are user-reported statements, not independently verified facts. Every displayed finding has an exact quote from your input. Review classifications and remove anything inaccurate.</p>
     {map.degraded&&<p role="status">One analysis role failed. This map may be incomplete.</p>}
     <div className="map-grid">{categories.map(category=><section key={category} className="map-column" aria-label={labels[category]}><h3>{labels[category]}</h3>{findings.filter(f=>f.category===category).length===0&&<p className="fine">No findings yet.</p>}{findings.filter(f=>f.category===category).map(f=><div className="quote" key={f.id}><p>{f.text}</p><small>“{f.quote}”<details className="provenance"><summary>Source details</summary>Characters {f.start}–{f.end} · {f.source}</details></small><label className="field-label" htmlFor={"category-"+f.id}>CLASSIFICATION</label><select id={"category-"+f.id} value={f.category} onChange={e=>updateFinding(f.id,{category:e.target.value as Finding["category"]})}>{categories.map(c=><option key={c} value={c}>{labels[c]}</option>)}</select><button className="secondary mini" onClick={()=>{setReviewed(false);setFindings(items=>items.filter(item=>item.id!==f.id));}}>Remove finding</button></div>)}</section>)}</div>
     {map.rejected>0&&<p className="fine">{map.rejected} unsupported or malformed findings were rejected by source validation.</p>}
     <section className="quote-list"><h3>One small, reversible experiment</h3>{map.experiment?<div className="quote"><label className="field-label" htmlFor="action">ACTION — EDIT BEFORE APPROVING</label><textarea className="compact" id="action" value={experiment.action} onChange={e=>{setReviewed(false);setExperiment({...experiment,action:e.target.value});}} maxLength={600}/><label className="field-label" htmlFor="duration">DURATION</label><input id="duration" value={experiment.duration} onChange={e=>{setReviewed(false);setExperiment({...experiment,duration:e.target.value});}} maxLength={120}/><label className="field-label" htmlFor="prediction">YOUR PREDICTION — NOT LOCKED</label><textarea className="compact" id="prediction" value={experiment.prediction} onChange={e=>{setReviewed(false);setExperiment({...experiment,prediction:e.target.value});}} maxLength={600}/><p className="fine">Safety note: {experiment.safetyNote}</p></div>:<p>No safe experiment was generated. Edit your original words to try again.</p>}</section>
     <label className="consent"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> I've reviewed this draft map and the experiment.</label>
     {reviewed&&!returnToken&&<button disabled={locking||!map.experiment||!experiment.action.trim()||!experiment.duration.trim()||!experiment.prediction.trim()} onClick={lockPrediction}>{locking?"Securing your prediction…":"🔒 Lock my prediction"}</button>}
     {returnToken&&<div className="quote" role="status"><h3>Prediction locked</h3><p>Your original prediction is saved and cannot be edited. Save this private link to return after your experiment. Anyone with the link can view it.</p><input readOnly aria-label="Private return link" value={typeof window==="undefined"?"":`${window.location.origin}/return?token=${returnToken}`}/><button className="secondary mini" onClick={()=>navigator.clipboard.writeText(`${window.location.origin}/return?token=${returnToken}`)}>Copy private return link</button></div>}
     <p className="fine">Nonclinical decision experiment. Locked experiments expire after 30 days. Avoid high-stakes decisions.</p>
    </>}
    <div className="actions"><button className="secondary" disabled={loading} onClick={()=>{setInput(source);setSource(null);setMap(null);setError("");setReturnToken("");}}>← Edit my words</button>{map?<button onClick={reset}>Start over</button>:<button disabled={loading} onClick={analyze}>{loading?"Analyzing with Meta AI…":"Analyze with Meta AI →"}</button>}</div>
   </div>}
  </section><footer>BUILT FOR THE META GLOBAL AI DEVELOPER HACKATHON 2026 · NEW, STANDALONE WORK</footer>
 </main>;
}
