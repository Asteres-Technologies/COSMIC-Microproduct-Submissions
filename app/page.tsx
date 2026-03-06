"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HERO_CUTOUT_CONFIG } from '@/lib/hero-cutout-config';

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
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
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
    <div className="landing-container" style={{
      // @ts-ignore
      '--cutout-blur': `${HERO_CUTOUT_CONFIG.cutoutBlur}px`
    }}>
      {/* Glassmorphic background layers */}
      <div className="landing-background"></div>
      
      {/* Gradient overlay - bottom-left dark, top-right transparent */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to top right, rgba(30, 37, 44, 0.98), rgba(144, 181, 216, 0.38), transparent)',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>
      
      {/* Glass overlay with backdrop blur and CSS mask */}
      <div className="glass-overlay-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(15px)',
        background: 'rgba(255, 255, 255, 0.56)',
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
            <linearGradient id="hero-gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e7e7e7b6" stopOpacity="1" />
              <stop offset="100%" stopColor="#5a5a5a21" stopOpacity="1" />
            </linearGradient>
            
            {/* Blur filter for cutout area */}
            <filter id="cutout-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation={HERO_CUTOUT_CONFIG.cutoutBlur} />
            </filter>
            
            {/* Inverted mask: white = visible glass, dark gray = engraved look */}
            <mask id="glass-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <text 
                className="hero-text"
                x="0" 
                y="0"
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="Inter, sans-serif"
                fontWeight="800"
                fontSize={HERO_CUTOUT_CONFIG.fontSize}
                fill={HERO_CUTOUT_CONFIG.maskFill} 
              >
                01.
              </text>
              <rect 
                className="classification-rect"
                x="0" 
                y="0" 
                width="100" 
                height="40"
                rx="8"
                fill="#333333"
              />
            </mask>
            
            {/* Correct Inner Shadow Filter */}
            <filter id="inner-shadow-filter" x="-50%" y="-50%" width="200%" height="200%">
              {/* 1. Blur the shape */}
              <feGaussianBlur in="SourceAlpha" stdDeviation={HERO_CUTOUT_CONFIG.shadowBlur} result="blur" />
              {/* 2. Shift it down/right */}
              <feOffset dx={HERO_CUTOUT_CONFIG.shadowOffsetX} dy={HERO_CUTOUT_CONFIG.shadowOffsetY} result="offsetBlur" />
              {/* 3. Subtract original shape to leave only the inner ledge */}
              <feComposite in="offsetBlur" in2="SourceAlpha" operator="out" result="innerSliver" />
              {/* 4. Color it black */}
              <feFlood floodColor="black" floodOpacity={HERO_CUTOUT_CONFIG.shadowOpacity} result="blackColor" />
              <feComposite in="blackColor" in2="innerSliver" operator="in" result="finalShadow" />
              {/* 5. Clip it to stay inside the number boundaries */}
              <feComposite in="finalShadow" in2="SourceAlpha" operator="in" result="clippedShadow" />
              {/* 6. Merge: Put shadow ON TOP of the white fill */}
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="clippedShadow" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Hero number with white tint and shadow ledge */}
          <text 
            className="hero-text"
            x="0" 
            y="0"
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="800"
            fontSize={HERO_CUTOUT_CONFIG.fontSize}
            fill={HERO_CUTOUT_CONFIG.fillColor}
            stroke="url(#hero-gradient-stroke)"
            strokeWidth={HERO_CUTOUT_CONFIG.strokeWidth}
            filter="url(#inner-shadow-filter)"
          >
            01.
          </text>
          
          {/* Classification rect with white tint and shadow ledge */}
          <rect 
            className="classification-rect"
            x="0" 
            y="0" 
            width="100" 
            height="40"
            rx="8"
            fill="rgba(255, 255, 255, 0.03)"
            stroke="url(#hero-gradient-stroke)"
            strokeWidth="2"
            filter="url(#inner-shadow-filter)"
          />
        </svg>
      </div>

      {/* NEW HERO PAGE LAYOUT */}
      <div className="hero-page-layout">
        <div className="classification-marking">unclassified / public</div>
        <div className="progress-indicator">
          <div className="progress-marker active">01</div>
          <div className="progress-marker secondary">02</div>
          <div className="progress-marker tertiary">03</div>
          <div className="progress-marker quaternary">04</div>
        </div>
        <div className="hero-number">01.</div>
        <div className="flex-spacer"></div>
        <div className="main-content-block">
          <p className="section-notice">Ensure that all data and information submitted is unclassified and approved for public release as this is an open public portal.</p>
          <h1 className="main-heading">COSMIC Microproducts Portal</h1>
          <div className="decorator-line"></div>
          <p className="meta-info">A lightweight approach to delivering focused, time-boxed products for the space community</p>
          <p className="body-paragraph">
            This portal helps COSMIC members propose, track, and showcase small, time‑boxed projects. Design a clearly scoped microproduct (2–12 weeks), assemble a small team or go solo, then use the submission form to propose your idea and the browse page to find, follow, or join existing microproducts.
          </p>
        </div>
        <nav className="bottom-nav">
          <Link href="/" data-text="HOME">HOME</Link>
          <Link href="/submit" data-text="SUBMIT PRODUCT">SUBMIT PRODUCT</Link>
          <Link href="/browse" data-text="BROWSE PRODUCTS">BROWSE PRODUCTS</Link>
          <a href="https://cosmicspace.org/news/" target="_blank" rel="noreferrer" data-text="NEWS">NEWS</a>
          <a href="#" data-text="DEBUG" onClick={(e) => { 
            e.preventDefault(); 
            document.body.classList.toggle('debug-mode');
            document.querySelectorAll('.hero-number, .flex-spacer, .main-content-block, .table-container').forEach(el => {
              el.setAttribute('data-width', `${(el as HTMLElement).offsetWidth}px`);
            });
          }}>DEBUG</a>
        </nav>
      </div>

      {/* EXISTING ELEMENTS - FULLY RESTORED */}
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
          <div className="stat"><div className="stat-num">{loading ? '—' : stats.total}</div><div className="stat-label">Total submissions</div></div>
          <div className="stat"><div className="stat-num">{loading ? '—' : stats.pending}</div><div className="stat-label">Pending review</div></div>
          <div className="stat"><div className="stat-num">{loading ? '—' : stats.approved}</div><div className="stat-label">Approved</div></div>
          <div className="stat"><div className="stat-num">{loading ? '—' : stats['in-progress']}</div><div className="stat-label">In progress</div></div>
          <div className="stat"><div className="stat-num">{loading ? '—' : stats.completed}</div><div className="stat-label">Completed</div></div>
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