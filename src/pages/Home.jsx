import API from "../api";
import { useEffect, useState } from "react";

export default function Home(){
  const [health, setHealth] = useState("…");

  useEffect(()=>{ (async()=>{
    try{ await API.health(); setHealth("OK"); } catch{ setHealth("Down"); }
  })(); },[]);

  return (
    <div className="grid" style={{gap:20}}>
      {/* HERO */}
      <div className="hero">
        <div className="card">
          <h1 className="h1">Build, target, and <span>delight</span> your customers.</h1>
          <p className="lead" style={{marginTop:8}}>
            Segment customers with flexible rules, launch personalized campaigns, and see delivery results in one place.
          </p>
          <div style={{display:'flex', gap:10, marginTop:16}}>
            <a href="/segments" className="btn primary">Create a Segment</a>
            <a href="/customers" className="btn">Add Customers</a>
          </div>
          <p className="muted" style={{marginTop:12, fontSize:12}}>Backend: {health}</p>
        </div>

        <div className="hero-img">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
            alt="Team working"
          />
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid cols-3">
        <div className="card">
          <div className="section-title">Smart Segments</div>
          <p className="muted">Mix AND/OR rules like spend, visits, or last activity to target exactly who you need.</p>
          <div className="feat-img">
            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop" alt="analytics"/>
          </div>
        </div>

        <div className="card">
          <div className="section-title">One-click Campaigns</div>
          <p className="muted">Create a campaign for any segment and send via a vendor API with tracked receipts.</p>
          <div className="feat-img">
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop" alt="campaigns"/>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Delivery Insights</div>
          <p className="muted">View sent/failed counts per campaign and keep the latest activity on top.</p>
          <div className="feat-img">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop" alt="insights"/>
          </div>
        </div>
      </div>


            {/* CTA STRIP */}
            <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap'}}>
              <div>
                <div className="section-title" style={{marginBottom:6}}>Ready to reach your audience?</div>
                <div className="muted">Start by defining who to target, then craft a message.</div>
              </div>
              <div style={{display:'flex', gap:10}}>
                <a href="/segments" className="btn primary">New Segment</a>
                <a href="/campaigns" className="btn ghost">Create Campaign</a>
              </div>
            </div>
          </div>
  );
}
