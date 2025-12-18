"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './page.css';

type Opportunity = {
  name: string;
  path: string;
  parsed?: any;
};

export default function Home() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/storage');
        const data = await res.json().catch(() => null);
        if (!mounted) return;
        if (data && Array.isArray(data.files)) setOpps(data.files as Opportunity[]);
        else setOpps([]);
      } catch (err) {
        setOpps([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const stats = {
    total: opps.length,
    pending: opps.filter(o => (o.name?.split('__')?.[0] ?? '').toLowerCase() === 'pending').length,
    approved: opps.filter(o => (o.name?.split('__')?.[0] ?? '').toLowerCase() === 'approved').length,
    'in-progress': opps.filter(o => (o.name?.split('__')?.[0] ?? '').toLowerCase() === 'in-progress').length,
    completed: opps.filter(o => (o.name?.split('__')?.[0] ?? '').toLowerCase() === 'completed').length,
  };

  const parseDateFromName = (name?: string) => {
    if (!name) return undefined;
    const m = name.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? new Date(m[1]) : undefined;
  };

  const recent = opps
    .filter(o => {
      const status = (o.name?.split('__')?.[0] ?? '').toLowerCase();
      return ['approved','in-progress','completed'].includes(status);
    })
    .map(o => ({
      ...o,
      status: (o.name?.split('__')?.[0] ?? '').toLowerCase(),
      date: parseDateFromName(o.name) || new Date(0)
    }))
    .sort((a,b) => b.date.getTime() - a.date.getTime())
    .slice(0,5);

  return (
    <div className="landing-container">
      <header className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">COSMIC Microproducts Portal</h1>
          <p className="hero-sub">A lightweight approach to delivering focused, time-boxed products for the space community</p>
          <p className="hero-desc">
            This portal helps COSMIC members propose, track, and showcase small, time‑boxed projects. Design a clearly scoped microproduct (2–12 weeks), assemble a small team or go solo, then use the submission form to propose your idea and the browse page to find, follow, or join existing microproducts.
            <br />
            <br />
            <b>Ensure that all data and information submitted is unclassified and approved for public release as this is an open public portal.</b>
          </p>
          <section className="what">
            <h2>What is a Microproduct?</h2>
            <ul>
              <li>A microproduct is a focused deliverable with a clearly defined scope.</li>
              <li>Microproducts typically run for two to twelve weeks.</li>
              <li>Each microproduct is owned and led by an individual or a small team.</li>
              <li>Microproducts can start without broad consensus.</li>
              <li>They are lightweight efforts for rapid insights.</li>
              <li>Work is broken into small, low-commitment tasks that volunteers can pick up.</li>
              <li>Every microproduct has a clear leader responsible for delivery and coordination.</li>
            </ul>
          </section>

          <div className="hero-cta">
            <Link href="/submit" className="primary-cta"><span className="btn-label">Submit a Microproduct</span></Link>
            <Link href="/browse" className="secondary-cta">Browse All Microproducts</Link>
            <a className="tertiary-cta" href="https://cosmicspace.org/news/" target="_blank" rel="noreferrer">News</a>
          </div>
        </div>
        <aside className="hero-stats">
          <div className="stat">
            <div className="stat-num">{loading ? '—' : stats.total}</div>
            <div className="stat-label">Total submissions</div>
          </div>
          <div className="stat">
            <div className="stat-num">{loading ? '—' : stats.pending}</div>
            <div className="stat-label">Pending review</div>
          </div>
          <div className="stat">
            <div className="stat-num">{loading ? '—' : stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat">
            <div className="stat-num">{loading ? '—' : stats['in-progress']}</div>
            <div className="stat-label">In progress</div>
          </div>
          <div className="stat">
            <div className="stat-num">{loading ? '—' : stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </aside>
      </header>

      

      <section className="recent">
        <h2>Recent Activity</h2>
        {recent.length === 0 && <div>No recent activity.</div>}
        <ul className="recent-list">
          {recent.map(r => (
            <li key={r.path} className="recent-item neu-inset">
              <div className="recent-left">
                <div className={`badge ${r.status.replace(/[^a-z0-9-]/g,'')}`}>{r.status}</div>
                <div className="recent-title">{r.parsed?.title ?? r.name}</div>
              </div>
              <div className="recent-meta">
                <div>{r.parsed?.lead_name ?? '—'}</div>
                <div className="muted">{r.parsed?.focus_area ?? '—'}</div>
                <div className="muted">{r.date instanceof Date && r.date.getTime() ? r.date.toISOString().slice(0,10) : '—'}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      
    </div>
  );
}

