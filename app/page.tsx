"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HERO_CUTOUT_CONFIG } from '@/lib/hero-cutout-config';
import { sections } from '@/lib/sections-loader';
import { AnimationState, getAnimationStyle, ANIMATION_DURATION } from '@/lib/animations';

type Opportunity = {
  name: string;
  path: string;
  parsed?: any;
};

export default function Home() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(1);
  const [contentAnimationState, setContentAnimationState] = useState<AnimationState>('idle');

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

  // Wheel-based section navigation (no actual page scroll)
  // Dynamically handles any number of sections based on files in content/sections/
  useEffect(() => {
    const totalSections = sections.length;
    let scrollAccumulator = 0;
    const threshold = 300; // Amount of wheel delta needed to change sections
    let isTransitioning = false;

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;

      scrollAccumulator += e.deltaY;

      const changeSection = (newSection: number) => {
        isTransitioning = true;
        
        // Start hide animation
        setContentAnimationState('hiding');
        
        // After hide animation completes, change section and show
        setTimeout(() => {
          setCurrentSection(newSection);
          setContentAnimationState('showing');
          
          // Reset to idle after show animation completes
          setTimeout(() => {
            setContentAnimationState('idle');
            isTransitioning = false;
          }, ANIMATION_DURATION);
        }, ANIMATION_DURATION);
        
        scrollAccumulator = 0;
      };

      // Scroll down - next section (loops back to 1 after last section)
      if (scrollAccumulator > threshold) {
        const newSection = currentSection === totalSections ? 1 : currentSection + 1;
        changeSection(newSection);
      }
      // Scroll up - previous section (loops back to last section from 1)
      else if (scrollAccumulator < -threshold) {
        const newSection = currentSection === 1 ? totalSections : currentSection - 1;
        changeSection(newSection);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSection, sections.length]);

  // SVG glass cutout effect with responsive positioning
  useEffect(() => {
    const updateSVGPositions = () => {
      const svg = document.getElementById('glass-cutout-svg') as unknown as SVGSVGElement;
      const blackMaskSvg = document.getElementById('black-mask-svg') as unknown as SVGSVGElement;
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

      if (blackMaskSvg) {
        blackMaskSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
        blackMaskSvg.setAttribute('width', String(window.innerWidth));
        blackMaskSvg.setAttribute('height', String(window.innerHeight));
      }

      // Update hero text positions in both SVGs
      const heroTexts = document.querySelectorAll('.hero-text');
      heroTexts.forEach(text => {
        text.setAttribute('x', String(heroX));
        text.setAttribute('y', String(heroY));
      });

      // Update classification rect positions in both SVGs
      const classRects = document.querySelectorAll('.classification-rect');
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

  const currentContent = sections[currentSection - 1];

  return (
    <>
      {/* Inject animation keyframes */}
      <style jsx global>{`
        @keyframes content-hide {
          0% {
            filter: blur(0px);
            opacity: 1;
          }
          95% {
            filter: blur(1000px);
            opacity: 1;
          }
          100% {
            filter: blur(1000px);
            opacity: 0;
          }
        }

        @keyframes content-show {
          0% {
            filter: blur(1000px);
            opacity: 0;
          }
          5% {
            filter: blur(1000px);
            opacity: 1;
          }
          100% {
            filter: blur(0px);
            opacity: 1;
          }
        }
      `}</style>
      
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
                {currentSection < 10 ? `0${currentSection}.` : `${currentSection}.`}
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
          </defs>
          
          {/* Hero number with white tint and gradient stroke */}
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
            style={{ transition: 'opacity 400ms ease-in-out' }}
          >
            {currentSection < 10 ? `0${currentSection}.` : `${currentSection}.`}
          </text>
          
          {/* Classification rect with white tint and gradient stroke */}
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
          />
        </svg>
      </div>

      {/* NEW HERO PAGE LAYOUT */}
      <div className="hero-page-layout">
        <div className="classification-marking">unclassified / public</div>
        <div className="progress-indicator">
          {/* Show 5 positions: 2 above, active center, 2 below */}
          {/* Dynamically calculates section numbers based on total sections */}
          {[-2, -1, 0, 1, 2].map((offset) => {
            const totalSections = sections.length;
            const sectionNum = ((currentSection - 1 + offset + totalSections) % totalSections) + 1;
            const absOffset = Math.abs(offset);
            const opacityClass = absOffset === 0 ? 'active' : absOffset === 1 ? 'secondary' : 'tertiary';
            
            return (
              <div key={offset} className={`progress-marker ${opacityClass}`}>
                {sectionNum < 10 ? `0${sectionNum}` : sectionNum}
              </div>
            );
          })}
        </div>
        <div className="hero-number">{currentSection < 10 ? `0${currentSection}.` : `${currentSection}.`}</div>
        <div className="flex-spacer"></div>
        <div className="main-content-block" style={getAnimationStyle(contentAnimationState)}>
          <p className="section-notice">{currentContent.notice}</p>
          <h1 className="main-heading">{currentContent.heading}</h1>
          <div className="decorator-line"></div>
          <p className="meta-info">{currentContent.meta}</p>
          <p className="body-paragraph">
            {currentContent.body}
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
    </>
  );
}