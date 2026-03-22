'use client'

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimationState, getAnimationStyle, ANIMATION_DURATION } from '@/lib/animations';
import { SmokeEffect } from '@/lib/smoke-effect';
import { ContentTransition } from '@/lib/content-transition';

type Opportunity = {
  name: string;
  path: string;
  sha?: string;
  parsed?: any;
  raw?: string | null;
  error?: string;
};

const MOCK_OPPORTUNITIES: Opportunity[] = [
  { name: 'approved__2025-03-01__orbital-debris-tracker', path: 'mock/1', parsed: { title: 'Orbital Debris Tracker', purpose: 'Real-time tracking of orbital debris using open data', duration_weeks: 8, team_members: ['Alice Chen', 'Bob Martinez', 'Carol Wu'], lead_name: 'Alice Chen', focus_area: 'Space Safety', output_type: 'Web App', deliverable: 'Interactive debris map' } },
  { name: 'in-progress__2025-02-15__spectrum-analyzer', path: 'mock/2', parsed: { title: 'RF Spectrum Analyzer', purpose: 'Lightweight spectrum analysis tool for ground stations', duration_weeks: 6, team_members: ['Dan Kowalski', 'Eve Nakamura'], lead_name: 'Dan Kowalski', focus_area: 'Communications', output_type: 'Desktop Tool', deliverable: 'Standalone analyzer' } },
  { name: 'pending__2025-03-10__launch-window-calc', path: 'mock/3', parsed: { title: 'Launch Window Calculator', purpose: 'Compute optimal launch windows for LEO missions', duration_weeks: 4, team_members: ['Frank Osei'], lead_name: 'Frank Osei', focus_area: 'Mission Planning', output_type: 'API', deliverable: 'REST endpoint' } },
  { name: 'approved__2025-01-20__thermal-model-lite', path: 'mock/4', parsed: { title: 'Thermal Model Lite', purpose: 'Simplified thermal modeling for small satellites', duration_weeks: 10, team_members: ['Grace Liu', 'Hank Petrov', 'Ines Moreau', 'Jake Odom'], lead_name: 'Grace Liu', focus_area: 'Thermal Engineering', output_type: 'Python Library', deliverable: 'pip package' } },
  { name: 'completed__2025-01-05__link-budget-tool', path: 'mock/5', parsed: { title: 'Link Budget Tool', purpose: 'Quick link budget calculations for S-band and X-band', duration_weeks: 3, team_members: ['Karen Singh', 'Leo Brandt'], lead_name: 'Karen Singh', focus_area: 'Communications', output_type: 'Web App', deliverable: 'Calculator page' } },
  { name: 'in-progress__2025-02-28__ground-station-dash', path: 'mock/6', parsed: { title: 'Ground Station Dashboard', purpose: 'Monitoring dashboard for distributed ground station network', duration_weeks: 12, team_members: ['Mia Torres', 'Noah Kim', 'Olivia Jansen'], lead_name: 'Mia Torres', focus_area: 'Ground Systems', output_type: 'Web App', deliverable: 'Live dashboard' } },
  { name: 'pending__2025-03-18__attitude-sim', path: 'mock/7', parsed: { title: 'Attitude Control Simulator', purpose: 'Browser-based attitude determination and control sim', duration_weeks: 8, team_members: ['Paul Reeves', 'Quinn Zhao', 'Rita Holm', 'Sam Ito', 'Tina Voss'], lead_name: 'Paul Reeves', focus_area: 'GNC', output_type: 'Web App', deliverable: '3D sim viewer' } },
];

export default function BrowsePage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [joinForms, setJoinForms] = useState<Record<string, { name: string; email: string; submitting?: boolean; error?: string }>>({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'length' | 'members' | 'status' | null>(null);
  const [filterBarAnimState, setFilterBarAnimState] = useState<AnimationState>('showing');
  const [pillAnimStates, setPillAnimStates] = useState<AnimationState[]>(['idle', 'idle', 'idle']);
  const [scrollDotsAnimState, setScrollDotsAnimState] = useState<AnimationState>('idle');
  const [scrollDotsVisible, setScrollDotsVisible] = useState(false);

  // Animation state
  const [headingAnimState, setHeadingAnimState] = useState<AnimationState>('showing');
  const [rowAnimStates, setRowAnimStates] = useState<AnimationState[]>([]);
  const [rowsRevealed, setRowsRevealed] = useState<Set<number>>(new Set());
  const smokeCanvasRef = useRef<HTMLCanvasElement>(null);
  const smokeEffectRef = useRef<SmokeEffect | null>(null);
  const transitionRef = useRef<ContentTransition | null>(null);

  // Max visible rows
  const MAX_VISIBLE_ROWS = 7;
  const [windowStart, setWindowStart] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isScrollTransitioning = useRef(false);
  const isFilterTransitioning = useRef(false);
  const filterTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/storage');
        let data = null;
        try { data = await res.json(); } catch (err) { console.error('Failed to parse /api/storage response JSON', err); data = null; }
        if (!mounted) return;
        if (data && data.success && Array.isArray(data.files)) {
          setOpportunities([...data.files as Opportunity[], ...MOCK_OPPORTUNITIES]);
        } else {
          setOpportunities(MOCK_OPPORTUNITIES);
        }
      } catch (e) {
        setOpportunities(MOCK_OPPORTUNITIES);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false };
  }, []);

  // Initialize smoke effect + content transition
  useEffect(() => {
    if (smokeCanvasRef.current && !smokeEffectRef.current) {
      smokeEffectRef.current = new SmokeEffect(smokeCanvasRef.current);
      transitionRef.current = new ContentTransition(smokeEffectRef.current);
    }
    return () => {
      if (smokeEffectRef.current) {
        smokeEffectRef.current.stop();
        smokeEffectRef.current = null;
        transitionRef.current = null;
      }
    };
  }, []);

  // Staggered entry animation when data loads
  useEffect(() => {
    if (loading || opportunities.length === 0) return;
    const visibleCount = Math.min(getSortedOpportunities().length, MAX_VISIBLE_ROWS);
    setRowAnimStates(new Array(visibleCount).fill('idle'));

    // Heading smoke show
    requestAnimationFrame(() => {
      const headingEl = document.querySelector('.browse-heading') as HTMLElement;
      if (headingEl && smokeEffectRef.current) {
        smokeEffectRef.current.initFromElement(headingEl);
        smokeEffectRef.current.startShow();
      }
    });

    // Filter trigger button — show alongside heading
    setFilterBarAnimState('showing');
    requestAnimationFrame(() => {
      const triggerEl = document.querySelector('.filter-trigger') as HTMLElement;
      if (triggerEl && smokeEffectRef.current) {
        smokeEffectRef.current.initFromElement(triggerEl);
        smokeEffectRef.current.startShow();
      }
    });
    setTimeout(() => setFilterBarAnimState('idle'), ANIMATION_DURATION);

    // Stagger rows in — each gets its own smoke group
    const timers: ReturnType<typeof setTimeout>[] = [];
    const rowStartDelay = ANIMATION_DURATION / 2;
    const staggerDelay = ANIMATION_DURATION / 2;

    for (let i = 0; i < visibleCount; i++) {
      timers.push(setTimeout(() => {
        setRowsRevealed(prev => new Set(prev).add(i));
        setRowAnimStates(prev => {
          const next = [...prev];
          next[i] = 'showing';
          return next;
        });

        requestAnimationFrame(() => {
          const rows = document.querySelectorAll('.table-row');
          const row = rows[i] as HTMLElement;
          if (row && smokeEffectRef.current) {
            const titleEl = row.querySelector('.title') as HTMLElement;
            if (titleEl) {
              smokeEffectRef.current.initFromElement(titleEl);
              smokeEffectRef.current.startShow();
            }
          }
        });

        timers.push(setTimeout(() => {
          setRowAnimStates(prev => {
            const next = [...prev];
            next[i] = 'idle';
            return next;
          });
        }, ANIMATION_DURATION));
      }, rowStartDelay + (i * staggerDelay)));
    }

    // Scroll dots — show after last row starts
    const scrollDotsDelay = rowStartDelay + (visibleCount * staggerDelay);
    timers.push(setTimeout(() => {
      setScrollDotsVisible(true);
      setScrollDotsAnimState('showing');
      timers.push(setTimeout(() => setScrollDotsAnimState('idle'), ANIMATION_DURATION));
    }, scrollDotsDelay));

    timers.push(setTimeout(() => setHeadingAnimState('idle'), ANIMATION_DURATION));

    return () => { timers.forEach(t => clearTimeout(t)); };
  }, [loading, opportunities.length]);

  // Page exit: intercept nav link clicks
  useEffect(() => {
    let exiting = false;
    const handleClick = (e: MouseEvent) => {
      if (exiting) return;
      const link = (e.target as HTMLElement).closest('.bottom-nav a[href]') as HTMLAnchorElement;
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      exiting = true;

      // Gather visible text elements and fire smoke hide
      if (smokeEffectRef.current) {
        let first = true;
        const headingEl = document.querySelector('.browse-heading') as HTMLElement;
        if (headingEl) {
          smokeEffectRef.current.initFromElement(headingEl);
          first = false;
        }
        // Include filter trigger
        const triggerEl = document.querySelector('.filter-trigger') as HTMLElement;
        if (triggerEl) {
          if (first) { smokeEffectRef.current.initFromElement(triggerEl); first = false; }
          else smokeEffectRef.current.addFromElement(triggerEl);
        }
        // Include visible filter pills
        if (filtersVisible) {
          document.querySelectorAll('.filter-pill').forEach(el => {
            if (first) { smokeEffectRef.current!.initFromElement(el as HTMLElement); first = false; }
            else smokeEffectRef.current!.addFromElement(el as HTMLElement);
          });
        }
        document.querySelectorAll('.table-row .title').forEach(el => {
          const htmlEl = el as HTMLElement;
          const r = htmlEl.getBoundingClientRect();
          if (r.width === 0) return;
          if (first) {
            smokeEffectRef.current!.initFromElement(htmlEl);
            first = false;
          } else {
            smokeEffectRef.current!.addFromElement(htmlEl);
          }
        });
        smokeEffectRef.current.startHide();
      }

      // CSS hide on all content
      setHeadingAnimState('hiding');
      setFilterBarAnimState('hiding');
      setScrollDotsAnimState('hiding');
      setRowAnimStates(prev => prev.map(() => 'hiding'));
      if (filtersVisible) {
        setPillAnimStates(prev => prev.map(() => 'hiding' as AnimationState));
      }

      setTimeout(() => router.push(href), ANIMATION_DURATION / 2);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [router]);

  // Wheel-based table scrolling with smoke animations
  useEffect(() => {
    const sorted = getSortedOpportunities();
    const totalRows = sorted.length;
    if (totalRows <= MAX_VISIBLE_ROWS) return;

    let scrollAccumulator = 0;
    const threshold = 200;

    const handleWheel = (e: WheelEvent) => {
      if (!tableContainerRef.current?.contains(e.target as Node)) return;
      if (isScrollTransitioning.current) return;

      scrollAccumulator += e.deltaY;

      // Scroll down — hide top row, reveal new bottom row (wraps)
      if (scrollAccumulator > threshold) {
        isScrollTransitioning.current = true;
        scrollAccumulator = 0;

        setRowAnimStates(prev => {
          const next = [...prev];
          next[0] = 'hiding';
          return next;
        });

        const rows = document.querySelectorAll('.table-row');
        const topRow = rows[0] as HTMLElement;
        if (topRow && smokeEffectRef.current) {
          const titleEl = topRow.querySelector('.title') as HTMLElement;
          if (titleEl) {
            smokeEffectRef.current.initFromElement(titleEl);
            smokeEffectRef.current.startHide();
          }
        }

        setTimeout(() => {
          const lastSlot = MAX_VISIBLE_ROWS - 1;
          setRowsRevealed(prev => {
            const next = new Set(prev);
            next.delete(lastSlot);
            return next;
          });

          setWindowStart(prev => (prev + 1) % totalRows);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setRowsRevealed(prev => new Set(prev).add(lastSlot));
              setRowAnimStates(prev => {
                const next = [...prev];
                for (let i = 0; i < next.length; i++) next[i] = 'idle';
                next[lastSlot] = 'showing';
                return next;
              });

              const newRows = document.querySelectorAll('.table-row');
              const bottomRow = newRows[lastSlot] as HTMLElement;
              if (bottomRow && smokeEffectRef.current) {
                const titleEl = bottomRow.querySelector('.title') as HTMLElement;
                if (titleEl) {
                  smokeEffectRef.current.initFromElement(titleEl);
                  smokeEffectRef.current.startShow();
                }
              }

              setTimeout(() => {
                setRowAnimStates(prev => {
                  const next = [...prev];
                  next[lastSlot] = 'idle';
                  return next;
                });
                isScrollTransitioning.current = false;
              }, ANIMATION_DURATION);
            });
          });
        }, ANIMATION_DURATION / 4);

      // Scroll up — hide bottom row, reveal new top row (wraps)
      } else if (scrollAccumulator < -threshold) {
        isScrollTransitioning.current = true;
        scrollAccumulator = 0;

        const lastSlot = MAX_VISIBLE_ROWS - 1;

        setRowAnimStates(prev => {
          const next = [...prev];
          next[lastSlot] = 'hiding';
          return next;
        });

        const rows = document.querySelectorAll('.table-row');
        const bottomRow = rows[lastSlot] as HTMLElement;
        if (bottomRow && smokeEffectRef.current) {
          const titleEl = bottomRow.querySelector('.title') as HTMLElement;
          if (titleEl) {
            smokeEffectRef.current.initFromElement(titleEl);
            smokeEffectRef.current.startHide();
          }
        }

        setTimeout(() => {
          setRowsRevealed(prev => {
            const next = new Set(prev);
            next.delete(0);
            return next;
          });

          setWindowStart(prev => (prev - 1 + totalRows) % totalRows);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setRowsRevealed(prev => new Set(prev).add(0));
              setRowAnimStates(prev => {
                const next = [...prev];
                for (let i = 0; i < next.length; i++) next[i] = 'idle';
                next[0] = 'showing';
                return next;
              });

              const newRows = document.querySelectorAll('.table-row');
              const topRow = newRows[0] as HTMLElement;
              if (topRow && smokeEffectRef.current) {
                const titleEl = topRow.querySelector('.title') as HTMLElement;
                if (titleEl) {
                  smokeEffectRef.current.initFromElement(titleEl);
                  smokeEffectRef.current.startShow();
                }
              }

              setTimeout(() => {
                setRowAnimStates(prev => {
                  const next = [...prev];
                  next[0] = 'idle';
                  return next;
                });
                isScrollTransitioning.current = false;
              }, ANIMATION_DURATION);
            });
          });
        }, ANIMATION_DURATION / 4);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [windowStart, opportunities.length, activeFilter]);

  // SVG glass cutout effect for classification marking
  useEffect(() => {
    const updateSVGPositions = () => {
      const svg = document.getElementById('glass-cutout-svg') as unknown as SVGSVGElement;
      const classificationEl = document.querySelector('.classification-marking') as HTMLElement;
      
      if (!svg || !classificationEl) return;

      // Get classification position
      const classRect = classificationEl.getBoundingClientRect();

      // Update SVG viewBox to cover entire viewport
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
      svg.setAttribute('width', String(window.innerWidth));
      svg.setAttribute('height', String(window.innerHeight));

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

  const startJoin = (filename: string) => {
    setJoinForms(prev => ({ ...prev, [filename]: { name: '', email: '' } }));
  };

  const cancelJoin = (filename: string) => {
    setJoinForms(prev => {
      const copy = { ...prev };
      delete copy[filename];
      return copy;
    });
  };

  const submitJoin = async (filename: string) => {
    const form = joinForms[filename];
    if (!form) return;
    setJoinForms(prev => ({ ...prev, [filename]: { ...form, submitting: true, error: undefined } }));
    try {
      const res = await fetch('/api/storage/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, name: form.name, email: form.email })
      });
        let data = null;
        try { data = await res.json(); } catch (err) { console.error('Failed to parse /api/storage/join response JSON', err); data = null; }
        if (data && data.success) {
        setJoined(prev => ({ ...prev, [filename]: true }));
        cancelJoin(filename);
      } else {
          let msg = 'Failed to join';
          if (data) {
            if (typeof data.error === 'string') {
              msg = data.error;
            } else if (Array.isArray(data.error)) {
              msg = data.error.map((e: any) => {
                if (e && e.path) {
                  const path = Array.isArray(e.path) ? e.path.join('.') : String(e.path);
                  return `${path}: ${e.message || JSON.stringify(e)}`;
                }
                return e && e.message ? e.message : String(e);
              }).join('; ');
            } else if (data.error && data.error.message) {
              msg = data.error.message;
            } else if (data.error) {
              msg = String(data.error);
            }
          }
          setJoinForms(prev => ({ ...prev, [filename]: { ...form, submitting: false, error: msg } }));
      }
    } catch (err) {
        setJoinForms(prev => ({ ...prev, [filename]: { ...form, submitting: false, error: (err as Error).message } }));
    }
  };

  const handleFilterClick = (filter: 'length' | 'members' | 'status') => {
    if (isFilterTransitioning.current) return;
    const newFilter = activeFilter === filter ? null : filter;
    if (newFilter === activeFilter) return;

    isFilterTransitioning.current = true;
    // Clear any pending filter timers
    filterTimers.current.forEach(t => clearTimeout(t));
    filterTimers.current = [];

    // Smoke hide all visible rows
    const rows = document.querySelectorAll('.table-row');
    rows.forEach((row, i) => {
      const titleEl = row.querySelector('.title') as HTMLElement;
      if (titleEl && smokeEffectRef.current) {
        if (i === 0) smokeEffectRef.current.initFromElement(titleEl);
        else smokeEffectRef.current.addFromElement(titleEl);
      }
    });
    if (smokeEffectRef.current) smokeEffectRef.current.startHide();

    // CSS hide all rows
    setRowAnimStates(prev => prev.map(() => 'hiding'));

    // At overlap point, swap filter and stagger show new rows
    filterTimers.current.push(setTimeout(() => {
      // Reset rows to hidden
      setRowsRevealed(new Set());
      setWindowStart(0);
      setActiveFilter(newFilter);

      const visibleCount = Math.min(opportunities.length, MAX_VISIBLE_ROWS);
      setRowAnimStates(new Array(visibleCount).fill('idle'));

      // Stagger show new sorted rows
      const staggerDelay = ANIMATION_DURATION / 2;
      for (let i = 0; i < visibleCount; i++) {
        filterTimers.current.push(setTimeout(() => {
          setRowsRevealed(prev => new Set(prev).add(i));
          setRowAnimStates(prev => {
            const next = [...prev];
            next[i] = 'showing';
            return next;
          });

          requestAnimationFrame(() => {
            const newRows = document.querySelectorAll('.table-row');
            const row = newRows[i] as HTMLElement;
            if (row && smokeEffectRef.current) {
              const titleEl = row.querySelector('.title') as HTMLElement;
              if (titleEl) {
                smokeEffectRef.current.initFromElement(titleEl);
                smokeEffectRef.current.startShow();
              }
            }
          });

          filterTimers.current.push(setTimeout(() => {
            setRowAnimStates(prev => {
              const next = [...prev];
              next[i] = 'idle';
              return next;
            });
            if (i === visibleCount - 1) {
              isFilterTransitioning.current = false;
            }
          }, ANIMATION_DURATION));
        }, i * staggerDelay));
      }
    }, ANIMATION_DURATION / 4));
  };

  const getSortedOpportunities = () => {
    const opps = [...opportunities];
    
    if (activeFilter === 'length') {
      return opps.sort((a, b) => {
        const durationA = a.parsed?.duration_weeks ?? 0;
        const durationB = b.parsed?.duration_weeks ?? 0;
        if (durationA !== durationB) {
          return durationB - durationA; // Descending by duration
        }
        // Secondary sort: alphabetical by title
        const titleA = a.parsed?.title ?? a.name ?? '';
        const titleB = b.parsed?.title ?? b.name ?? '';
        return titleA.localeCompare(titleB);
      });
    }
    
    if (activeFilter === 'members') {
      return opps.sort((a, b) => {
        const countA = a.parsed?.team_members ? (Array.isArray(a.parsed.team_members) ? a.parsed.team_members.length : a.parsed.team_members.split(/\r?\n/).length) : 0;
        const countB = b.parsed?.team_members ? (Array.isArray(b.parsed.team_members) ? b.parsed.team_members.length : b.parsed.team_members.split(/\r?\n/).length) : 0;
        if (countA !== countB) {
          return countB - countA; // Descending by member count
        }
        // Secondary sort: alphabetical by title
        const titleA = a.parsed?.title ?? a.name ?? '';
        const titleB = b.parsed?.title ?? b.name ?? '';
        return titleA.localeCompare(titleB);
      });
    }
    
    if (activeFilter === 'status') {
      return opps.sort((a, b) => {
        const statusA = (a.name?.split('__')?.[0] ?? '').toLowerCase();
        const statusB = (b.name?.split('__')?.[0] ?? '').toLowerCase();
        if (statusA !== statusB) {
          return statusA.localeCompare(statusB);
        }
        const titleA = a.parsed?.title ?? a.name ?? '';
        const titleB = b.parsed?.title ?? b.name ?? '';
        return titleA.localeCompare(titleB);
      });
    }
    
    return opps; // Default order
  };

  const renderTeam = (rawOrParsed: any) => {
    if (!rawOrParsed) return null;
    const tm = rawOrParsed.team_members;
    if (!tm) return null;
    if (Array.isArray(tm)) {
      return tm.map((m: any, i: number) => (
        <div key={i} className="member">{m.name}</div>
      ));
    }
    if (typeof tm === 'string') {
      return tm.split(/\r?\n/).map((line: string, i: number) => (
        <div key={i} className="member">{line.split('<')[0].trim()}</div>
      ));
    }
    return null;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes content-hide {
          0% { opacity: 1; }
          1% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes content-show {
          0% { filter: blur(100px); opacity: 0; }
          1% { filter: blur(100px); opacity: 1; }
          100% { filter: blur(0px); opacity: 1; }
        }
      `}</style>

      <canvas
        ref={smokeCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 3,
          willChange: 'contents',
        }}
      />

    <div className="browse-container">
      {/* Glassmorphic background layers */}
      <div className="browse-background"></div>
      
      {/* Gradient overlay - bottom dark to top transparent */}
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
      
      {/* Glass overlay with backdrop blur - NO CUTOUTS */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(15px)',
        background: 'rgba(255, 255, 255, 0.56)',
        pointerEvents: 'none',
        zIndex: 2
      }}></div>

      {/* NEW BROWSE PAGE LAYOUT */}
      <div className="browse-page-layout">
        {/* Classification marking - top center */}
        <div className="classification-marking">unclassified / public</div>

        {/* Table container - centered */}
        <div className="table-container" ref={tableContainerRef}>
          {/* Page heading */}
          <h1 className="browse-heading" style={getAnimationStyle(headingAnimState)}>Browse Microproducts</h1>
          
          {/* Filter bar */}
          {!loading && (
            <div className="filter-bar" style={getAnimationStyle(filterBarAnimState)}>
              <div className={`filter-pills ${filtersVisible ? 'visible' : ''}`}>
                <button 
                  className={`filter-pill ${activeFilter === 'length' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('length')}
                  style={filtersVisible ? (pillAnimStates[0] === 'idle' ? {} : pillAnimStates[0] === 'showing' ? getAnimationStyle('showing') : { opacity: 0 }) : { opacity: 0 }}
                >
                  project length
                </button>
                <button 
                  className={`filter-pill ${activeFilter === 'members' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('members')}
                  style={filtersVisible ? (pillAnimStates[1] === 'idle' ? {} : pillAnimStates[1] === 'showing' ? getAnimationStyle('showing') : { opacity: 0 }) : { opacity: 0 }}
                >
                  members
                </button>
                <button 
                  className={`filter-pill ${activeFilter === 'status' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('status')}
                  style={filtersVisible ? (pillAnimStates[2] === 'idle' ? {} : pillAnimStates[2] === 'showing' ? getAnimationStyle('showing') : { opacity: 0 }) : { opacity: 0 }}
                >
                  status
                </button>
              </div>
              
              <button 
                className="filter-trigger"
                onClick={() => {
                  if (!filtersVisible) {
                    // Set pills to hidden state before making visible
                    setPillAnimStates(['hiding', 'hiding', 'hiding']);
                    setFiltersVisible(true);
                    // After React renders the pills, stagger show them
                    requestAnimationFrame(() => {
                      const pillEls = document.querySelectorAll('.filter-pill');
                      pillEls.forEach((el, i) => {
                        setTimeout(() => {
                          setPillAnimStates(prev => {
                            const next = [...prev];
                            next[i] = 'showing';
                            return next;
                          });
                          if (smokeEffectRef.current) {
                            smokeEffectRef.current.initFromElement(el as HTMLElement);
                            smokeEffectRef.current.startShow();
                          }
                          setTimeout(() => {
                            setPillAnimStates(prev => {
                              const next = [...prev];
                              next[i] = 'idle';
                              return next;
                            });
                          }, ANIMATION_DURATION);
                        }, i * 150);
                      });
                    });
                  } else {
                    // Hide pills with staggered smoke (reverse order)
                    const pillEls = document.querySelectorAll('.filter-pill');
                    const count = pillEls.length;
                    pillEls.forEach((el, i) => {
                      const reverseI = count - 1 - i;
                      setTimeout(() => {
                        setPillAnimStates(prev => {
                          const next = [...prev];
                          next[i] = 'hiding';
                          return next;
                        });
                        if (smokeEffectRef.current) {
                          smokeEffectRef.current.initFromElement(el as HTMLElement);
                          smokeEffectRef.current.startHide();
                        }
                      }, reverseI * 150);
                    });
                    setTimeout(() => {
                      setFiltersVisible(false);
                      setPillAnimStates(['idle', 'idle', 'idle']);
                    }, count * 150 + ANIMATION_DURATION / 2);
                  }
                }}
              >
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="7" height="1" fill="#696A6F"/>
                  <rect y="3" width="5" height="1" fill="#696A6F"/>
                  <rect y="6" width="3" height="1" fill="#696A6F"/>
                </svg>
                <span>filters</span>
              </button>
            </div>
          )}
          
          {!loading && opportunities.length === 0 && (
            <div>No opportunities found.</div>
          )}

          {/* Table rows */}
          <div className="table-rows-wrapper">
          <div className="table-rows-container">
          {(() => {
            const sorted = getSortedOpportunities();
            const total = sorted.length;
            const visibleCount = Math.min(total, MAX_VISIBLE_ROWS);
            return Array.from({ length: visibleCount }, (_, index) => {
              const dataIndex = (windowStart + index) % total;
              const opp = sorted[dataIndex];
              const p = opp.parsed || {};
              const status = (opp.name?.split('__')?.[0] ?? '').toLowerCase();
              const teamCount = p.team_members ? (Array.isArray(p.team_members) ? p.team_members.length : p.team_members.split(/\r?\n/).length) : 0;
              const rowAnim = rowAnimStates[index] || 'idle';
              const isRevealed = rowsRevealed.has(index);
              const rowStyle: React.CSSProperties = !isRevealed
                ? { opacity: 0, top: `${index * 48}px` }
                : { ...getAnimationStyle(rowAnim), top: `${index * 48}px` };

              return (
                <div className="table-row" key={`${opp.path}-${dataIndex}`} style={rowStyle}>
                  <div className="title">{p.title ?? opp.name}</div>
                  <div className="duration">{p.duration_weeks ?? '—'} Weeks</div>
                  <div className="members">{teamCount} Members</div>
                  <div className={`status ${status === 'approved' ? 'approved' : 'pending'}`}>{status.toUpperCase()}</div>
                  <div className="actions">
                    <button className="btn-view">VIEW</button>
                    {!joined[opp.name] && !joinForms[opp.name] && (
                      <button className="btn-join" onClick={() => startJoin(opp.name)}>JOIN</button>
                    )}
                    {joined[opp.name] && (
                      <button className="btn-join" disabled>JOINED</button>
                    )}
                  </div>
                </div>
              );
            });
          })()}
          </div>

          {/* Scroll indicator - right side dots */}
          {(() => {
            const total = getSortedOpportunities().length;
            if (total <= MAX_VISIBLE_ROWS) return null;
            const MAX_DOTS = 28;
            const dotCount = Math.min(total, MAX_DOTS);
            const current = windowStart % total;
            const activeDot = Math.round((current / total) * dotCount) % dotCount;
            return (
              <div className="scroll-indicator" style={scrollDotsVisible ? getAnimationStyle(scrollDotsAnimState) : { opacity: 0 }}>
                {Array.from({ length: dotCount }, (_, i) => {
                  const dist = Math.abs(i - activeDot);
                  const sizeClass = dist === 0 ? 'dot-lg' : dist <= 2 ? 'dot-md' : dist <= 5 ? 'dot-sm' : 'dot-xs';
                  return (
                    <div key={i} className={`scroll-dot ${sizeClass} ${i === activeDot ? 'active' : ''}`} />
                  );
                })}
              </div>
            );
          })()}
          </div>
        </div>
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
              el.setAttribute('data-width', `${el.offsetWidth}px`);
            });
          }}>DEBUG</a>
        </nav>
      </div>

      {/* OLD LAYOUT - HIDDEN BUT PRESERVED */}
      <div className="browse-old-layout" style={{ display: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <h1>Browse Microproducts</h1>
          <Link href="/" className="home-btn">Home</Link>
        </div>
        <p className="subtitle">Explore current opportunities and join a team.</p>

        {loading && <div>Loading...</div>}

        {!loading && opportunities.length === 0 && (
          <div>No opportunities found.</div>
        )}

        <div className="cards">
          {opportunities.map((opp) => {
            const p = opp.parsed || {};
            const status = (opp.name?.split('__')?.[0] ?? '').toLowerCase();
            const statusClass = status.replace(/[^a-z0-9-_]/g, '') || 'unknown';

            return (
              <div className="card" key={opp.path}>
                <div className="card-header">
                  <h3 className="title">{p.title ?? opp.name}</h3>
                  <div className={`status ${statusClass}`}>{status}</div>
                </div>

                <div className="card-section">
                      <h4 className="md-heading">Description</h4>
                      <div className="section-body">{p.purpose ?? '—'}</div>
                    </div>

                <div className="card-section">
                  <h4 className="md-heading">Deliverable</h4>
                  <div className="section-body">{p.deliverable ?? '—'}</div>
                </div>

                <div className="card-grid">
                  <div className="card-section">
                    <h4 className="md-heading">Timeline</h4>
                    <div className="section-body" style={{ whiteSpace: 'pre-wrap' }}>{p.milestones ?? '—'}</div>
                  </div>

                  <div className="card-section">
                    <h4 className="md-heading">Metadata</h4>
                    <div className="section-body small">
                      <div><strong>Output:</strong> {p.output_type ?? '—'}</div>
                      <div><strong>Duration:</strong> {p.duration_weeks ?? '—'} weeks</div>
                      <div><strong>Focus:</strong> {p.focus_area ?? '—'}</div>
                    </div>
                  </div>

                  <div className="card-section">
                    <h4 className="md-heading">Lead</h4>
                    <div className="section-body">{p.lead_name ?? '—'}</div>
                  </div>

                  <div className="card-section">
                    <h4 className="md-heading">Team</h4>
                    <div className="section-body team-list">{renderTeam(p) ?? '—'}</div>
                  </div>

                  {p.dependencies && (
                    <div className="card-section full-width">
                      <h4 className="md-heading">Dependencies</h4>
                      <div className="section-body">{p.dependencies}</div>
                    </div>
                  )}
                </div>

                {/* Join form area */}
                {joinForms[opp.name] && (
                  <div className="card-section join-form">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={joinForms[opp.name].name}
                      onChange={(e) => setJoinForms(prev => ({ ...prev, [opp.name]: { ...prev[opp.name], name: e.target.value } }))}
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={joinForms[opp.name].email}
                      onChange={(e) => setJoinForms(prev => ({ ...prev, [opp.name]: { ...prev[opp.name], email: e.target.value } }))}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button className="join-btn" onClick={() => submitJoin(opp.name)} disabled={!!joinForms[opp.name].submitting}>
                        <span className="btn-label">{joinForms[opp.name].submitting ? 'Joining...' : 'Submit'}</span>
                      </button>
                      <button className="submit-btn" onClick={() => cancelJoin(opp.name)}><span className="btn-label">Cancel</span></button>
                    </div>
                    {joinForms[opp.name].error && <div className="alert error" style={{ marginTop: '0.5rem' }}>{joinForms[opp.name].error}</div>}
                  </div>
                )}

                <div className="card-actions">
                  <div />
                  {!joined[opp.name] && !joinForms[opp.name] && (
                    <button className="join-btn" onClick={() => startJoin(opp.name)}><span className="btn-label">Join</span></button>
                  )}
                  {joined[opp.name] && (
                    <button className="join-btn" disabled><span className="btn-label">Joined</span></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
