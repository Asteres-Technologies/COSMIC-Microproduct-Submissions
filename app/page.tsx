"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  // SVG glass cutout effect with responsive positioning
  useEffect(() => {
    const updateSVGPositions = () => {
      const svg = document.getElementById('glass-cutout-svg') as unknown as SVGSVGElement;
      const heroNumber = document.querySelector('.hero-number') as HTMLElement;
      const classificationEl = document.querySelector('.classification-marking') as HTMLElement;
      
      if (!svg || !heroNumber || !classificationEl) return;

      // Get hero number position
      const heroRect = heroNumber.getBoundingClientRect();
      const heroX = heroRect.right;
      const heroY = heroRect.top + heroRect.height / 2;

      // Get classification position
      const classRect = classificationEl.getBoundingClientRect();

      // Update SVG viewBox to cover entire viewport
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
      svg.setAttribute('width', String(window.innerWidth));
      svg.setAttribute('height', String(window.innerHeight));

      // Update hero text positions
      const heroTexts = svg.querySelectorAll('.hero-text');
      heroTexts.forEach(text => {
        text.setAttribute('x', String(heroX));
        text.setAttribute('y', String(heroY));
      });

      // Update classification rect positions
      const classRects = svg.querySelectorAll('.classification-rect');
      classRects.forEach(rect => {
        rect.setAttribute('x', String(classRect.left));
        rect.setAttribute('y', String(classRect.top));
        rect.setAttribute('width', String(classRect.width));
        rect.setAttribute('height', String(classRect.height));
      });

      // Update filter region to cover entire viewport
      const filter = svg.querySelector('#inner-shadow-filter');
      if (filter) {
        filter.setAttribute('x', '0');
        filter.setAttribute('y', '0');
        filter.setAttribute('width', String(window.innerWidth));
        filter.setAttribute('height', String(window.innerHeight));
      }
    };

    // Wait for fonts and initial layout
    document.fonts.ready.then(() => {
      setTimeout(updateSVGPositions, 100);
    });

    window.addEventListener('resize', updateSVGPositions);
    return () => window.removeEventListener('resize', updateSVGPositions);
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
      {/* Glassmorphic background layers */}
      <div className="landing-background"></div>
      
      {/* Glass overlay with backdrop blur and CSS mask */}
      <div className="glass-overlay-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.65)',
        maskImage: 'url(#glass-mask)',
        WebkitMaskImage: 'url(#glass-mask)',
        pointerEvents: 'none',
        zIndex: 2
      }}>
        <svg 
          id="glass-cutout-svg" 
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Gradient stroke definition */}
            <linearGradient id="hero-gradient-stroke" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E7E7E7" stopOpacity="1" />
              <stop offset="100%" stopColor="#E1E1E1" stopOpacity="0" />
            </linearGradient>
            
            {/* Blur filter for cutout text */}
            <filter id="cutout-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
            
            {/* Inverted mask: white = visible glass, dark gray = mostly transparent cutout with subtle tint */}
            <mask id="glass-mask">
              {/* White background = glass layer visible everywhere */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              
              {/* Dark gray text = mostly transparent cutout with 3% glass tint */}
              <text 
                className="hero-text"
                x="0" 
                y="0"
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="Inter, sans-serif"
                fontWeight="800"
                fontSize="160"
                fill="#bebebe93"
                filter="url(#cutout-blur)"
              >
                01.
              </text>
              
              {/* Dark gray rect = mostly transparent cutout with 3% glass tint */}
              <rect 
                className="classification-rect"
                x="0" 
                y="0" 
                width="100" 
                height="40"
                rx="8"
                fill="#8d8d8dff"
                filter="url(#cutout-blur)"
              />
            </mask>
            
            {/* Inner shadow filter using feComposite "out" to prevent halo */}
            <filter 
              id="inner-shadow-filter" 
              filterUnits="userSpaceOnUse"
              x="0" 
              y="0" 
              width="100%" 
              height="100%"
            >
              {/* 1. Blur the shape */}
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              {/* 2. Shift it DOWN (Positive dy) */}
              <feOffset dx="0" dy="6" result="offsetBlur" />
              {/* 3. THE FIX: Clip the shadow so it ONLY shows inside the '01.' */}
              {/* This removes everything you see 'outside' the lines */}
              <feComposite in="offsetBlur" in2="SourceAlpha" operator="out" result="innerSliver" />
              {/* 4. Final Color pass */}
              <feFlood floodColor="black" floodOpacity="0.7" result="color" />
              <feComposite in="color" in2="innerSliver" operator="in" result="shadow" />
              <feComposite in="shadow" in2="SourceAlpha" operator="in" />
            </filter>
          </defs>
          
          {/* Hero number with subtle white tint - makes it look carved into glass */}
          <text 
            className="hero-text"
            x="0" 
            y="0"
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="800"
            fontSize="160"
            fill="rgba(255, 255, 255, 0.08)"
            stroke="url(#hero-gradient-stroke)"
            strokeWidth="2"
          >
            01.
          </text>
          
          {/* Classification rect with subtle white tint */}
          <rect 
            className="classification-rect"
            x="0" 
            y="0" 
            width="100" 
            height="40"
            rx="8"
            fill="rgba(255, 255, 255, 0.03)"
            stroke="url(#hero-gradient-stroke)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* NEW HERO PAGE LAYOUT */}
      <div className="hero-page-layout">
        {/* Classification marking - top center */}
        <div className="classification-marking">unclassified / public</div>

        {/* Vertical progress indicator - right rail */}
        <div className="progress-indicator">
          <div className="progress-marker active">01</div>
          <div className="progress-marker secondary">02</div>
          <div className="progress-marker tertiary">03</div>
          <div className="progress-marker quaternary">04</div>
        </div>

        {/* Hero number - left side */}
        <div className="hero-number">01.</div>

        {/* Flex spacer - grows to fill space */}
        <div className="flex-spacer"></div>

        {/* Main content block - right side */}
        <div className="main-content-block">
          <p className="section-notice">Ensure that all data and information submitted is unclassified and approved for public release as this is an open public portal.</p>
          <h1 className="main-heading">COSMIC Microproducts Portal</h1>
          <div className="decorator-line"></div>
          <p className="meta-info">A lightweight approach to delivering focused, time-boxed products for the space community</p>
          <p className="body-paragraph">
            This portal helps COSMIC members propose, track, and showcase small, time‑boxed projects. Design a clearly scoped microproduct (2–12 weeks), assemble a small team or go solo, then use the submission form to propose your idea and the browse page to find, follow, or join existing microproducts.
          </p>
        </div>

        {/* Bottom navigation - bottom right */}
        <nav className="bottom-nav">
          <Link href="/" data-text="HOME">HOME</Link>
          <Link href="/submit" data-text="SUBMIT PRODUCT">SUBMIT PRODUCT</Link>
          <Link href="/browse" data-text="BROWSE PRODUCTS">BROWSE PRODUCTS</Link>
          <a href="https://cosmicspace.org/news/" target="_blank" rel="noreferrer" data-text="NEWS">NEWS</a>
          <a href="#" data-text="DEBUG" onClick={(e) => { 
            e.preventDefault(); 
            document.body.classList.toggle('debug-mode');
            // Add width data attributes
            document.querySelectorAll('.hero-number, .flex-spacer, .main-content-block, .table-container').forEach(el => {
              el.setAttribute('data-width', `${(el as HTMLElement).offsetWidth}px`);
            });
          }}>DEBUG</a>
        </nav>
      </div>

      {/* EXISTING ELEMENTS - HIDDEN BUT PRESERVED */}
      <header className="hero hero-hidden">
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

      <section className="recent recent-hidden">
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

