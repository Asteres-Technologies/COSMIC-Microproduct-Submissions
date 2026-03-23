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
  const scrollTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isFilterTransitioning = useRef(false);
  const filterTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Detail panel state
  const [viewingOpp, setViewingOpp] = useState<Opportunity | null>(null);
  const [detailAnimState, setDetailAnimState] = useState<AnimationState>('idle');
  const [tableVisible, setTableVisible] = useState(true);
  const [detailSection, setDetailSection] = useState(0);
  const isDetailScrolling = useRef(false);
  const detailTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Join panel state
  const [joiningOpp, setJoiningOpp] = useState<Opportunity | null>(null);
  const [joinAnimState, setJoinAnimState] = useState<AnimationState>('idle');
  const [joinFormData, setJoinFormData] = useState({ name: '', email: '' });
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinResult, setJoinResult] = useState<{ success: boolean; message: string } | null>(null);

  // Restore filter + scroll from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('browse-state');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.filter) setActiveFilter(state.filter);
        if (typeof state.windowStart === 'number') setWindowStart(state.windowStart);
      }
    } catch {}
  }, []);

  // Persist filter + scroll to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('browse-state', JSON.stringify({
        filter: activeFilter,
        windowStart,
      }));
    } catch {}
  }, [activeFilter, windowStart]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/storage');
        let data = null;
        try { data = await res.json(); } catch (err) { console.error('Failed to parse /api/storage response JSON', err); data = null; }
        if (!mounted) return;
        if (data && data.success && Array.isArray(data.files)) {
          const real = data.files as Opportunity[];
          const mocks: Opportunity[] = [
            { name: 'approved__2026-02-01-orbital-debris-tracker.yaml', path: 'mock/1', parsed: { title: 'Orbital Debris Tracking Dashboard', purpose: 'Build a real-time visualization tool for tracking orbital debris using publicly available TLE data. The dashboard will display debris density maps, conjunction alerts, and historical trend analysis to support space situational awareness research.', duration_weeks: 6, output_type: 'Software Prototype', focus_area: 'Space Safety', lead_name: 'Marcus Chen', deliverable: 'Web-based dashboard with live debris tracking', milestones: 'Week 1: Data pipeline setup\nWeek 2-3: Visualization engine\nWeek 4-5: Alert system\nWeek 6: Testing and deployment', team_members: [{ name: 'Marcus Chen' }, { name: 'Sarah Kim' }, { name: 'Dev Patel' }], dependencies: 'CelesTrak TLE API access' } },
            { name: 'pending__2026-02-10-lunar-comms-protocol.yaml', path: 'mock/2', parsed: { title: 'Lunar Surface Communications Protocol', purpose: 'Define a lightweight communications protocol optimized for lunar surface operations, addressing high-latency relay scenarios and power-constrained transceivers for small robotic assets.', duration_weeks: 10, output_type: 'Technical Specification', focus_area: 'Communications', lead_name: 'Aisha Patel', deliverable: 'Protocol specification document with reference implementation notes', milestones: 'Week 1-2: Requirements gathering\nWeek 3-5: Protocol design\nWeek 6-8: Simulation testing\nWeek 9-10: Documentation', team_members: [{ name: 'Aisha Patel' }, { name: 'James Wright' }], dependencies: 'None' } },
            { name: 'approved__2026-01-20-radiation-ml-model.yaml', path: 'mock/3', parsed: { title: 'ML Radiation Exposure Forecasting', purpose: 'Develop a machine learning model that predicts radiation exposure levels for crewed missions based on solar activity data, orbital parameters, and shielding configurations.', duration_weeks: 8, output_type: 'Research Paper', focus_area: 'Research & Technology', lead_name: 'Elena Vasquez', deliverable: 'Trained model with validation results and research paper', milestones: 'Week 1-2: Data collection\nWeek 3-4: Model architecture\nWeek 5-6: Training and validation\nWeek 7-8: Paper writing', team_members: [{ name: 'Elena Vasquez' }, { name: 'Tom Nakamura' }, { name: 'Lisa Park' }, { name: 'Raj Gupta' }], dependencies: 'NASA SPE dataset access' } },
            { name: 'pending__2026-03-01-supply-chain-sim.yaml', path: 'mock/4', parsed: { title: 'Cislunar Supply Chain Simulator', purpose: 'Create a discrete-event simulation framework for modeling cislunar supply chain logistics, including propellant depots, transfer vehicles, and surface storage facilities.', duration_weeks: 12, output_type: 'Software Prototype', focus_area: 'Logistics', lead_name: 'Jordan Blake', deliverable: 'Simulation framework with sample scenarios', milestones: 'Week 1-3: Architecture design\nWeek 4-7: Core simulation engine\nWeek 8-10: Scenario modeling\nWeek 11-12: Validation and docs', team_members: [{ name: 'Jordan Blake' }, { name: 'Nina Kowalski' }], dependencies: 'None' } },
            { name: 'approved__2026-02-15-thermal-analysis-tool.yaml', path: 'mock/5', parsed: { title: 'Spacecraft Thermal Analysis Toolkit', purpose: 'Build an open-source thermal analysis toolkit for preliminary spacecraft design, supporting common orbital thermal environments and basic component-level modeling.', duration_weeks: 8, output_type: 'Software Prototype', focus_area: 'Engineering Tools', lead_name: 'Chris Donovan', deliverable: 'Python toolkit with CLI and documentation', milestones: 'Week 1-2: Thermal model library\nWeek 3-4: Solver implementation\nWeek 5-6: CLI and visualization\nWeek 7-8: Testing and docs', team_members: [{ name: 'Chris Donovan' }, { name: 'Amy Zhang' }, { name: 'Oscar Reyes' }], dependencies: 'None' } },
            { name: 'pending__2026-02-20-mission-planning-ai.yaml', path: 'mock/6', parsed: { title: 'AI-Assisted Mission Planning', purpose: 'Explore using large language models to assist mission planners in generating preliminary mission architectures from natural language descriptions of mission objectives and constraints.', duration_weeks: 6, output_type: 'Whitepaper', focus_area: 'Research & Technology', lead_name: 'Priya Sharma', deliverable: 'Whitepaper with proof-of-concept demonstrations', milestones: 'Week 1: Literature review\nWeek 2-3: Prompt engineering\nWeek 4-5: Case studies\nWeek 6: Paper finalization', team_members: [{ name: 'Priya Sharma' }], dependencies: 'OpenAI API access' } },
            { name: 'approved__2026-01-28-ground-ops-automation.yaml', path: 'mock/7', parsed: { title: 'Ground Operations Automation Framework', purpose: 'Design an automation framework for routine ground station operations including antenna scheduling, pass planning, and telemetry processing to reduce operator workload.', duration_weeks: 10, output_type: 'Technical Specification', focus_area: 'Ground Systems', lead_name: 'Mike Torres', deliverable: 'Framework specification with integration guide', milestones: 'Week 1-2: Current ops analysis\nWeek 3-5: Framework design\nWeek 6-8: Prototype automation scripts\nWeek 9-10: Documentation', team_members: [{ name: 'Mike Torres' }, { name: 'Karen Liu' }, { name: 'Ben Okafor' }], dependencies: 'Ground station access for testing' } },
          ];
          setOpportunities([...real, ...mocks]);
        } else {
          setOpportunities([]);
        }
      } catch (e) {
        setOpportunities([]);
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
        // Include detail view fields if visible
        document.querySelectorAll('.detail-section-content .detail-field').forEach(el => {
          const htmlEl = el as HTMLElement;
          if (first) { smokeEffectRef.current!.initFromElement(htmlEl); first = false; }
          else smokeEffectRef.current!.addFromElement(htmlEl);
        });
        smokeEffectRef.current.startHide();
      }

      // CSS hide on all content
      setHeadingAnimState('hiding');
      setFilterBarAnimState('hiding');
      setScrollDotsAnimState('hiding');
      setRowAnimStates(prev => prev.map(() => 'hiding'));
      setDetailAnimState('hiding');
      setJoinAnimState('hiding');
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
        // Clear pending timers, snap any mid-show rows to idle
        scrollTimers.current.forEach(t => clearTimeout(t));
        scrollTimers.current = [];
        setRowAnimStates(prev => prev.map(s => s === 'showing' ? 'idle' : s));

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

        scrollTimers.current.push(setTimeout(() => {
          const lastSlot = MAX_VISIBLE_ROWS - 1;
          setRowsRevealed(prev => {
            const next = new Set(prev);
            next.delete(lastSlot);
            return next;
          });

          setWindowStart(prev => (prev + 1) % totalRows);

          isScrollTransitioning.current = false;

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

              scrollTimers.current.push(setTimeout(() => {
                setRowAnimStates(prev => {
                  const next = [...prev];
                  next[lastSlot] = 'idle';
                  return next;
                });
              }, ANIMATION_DURATION));
            });
          });
        }, ANIMATION_DURATION / 4));

      // Scroll up — hide bottom row, reveal new top row (wraps)
      } else if (scrollAccumulator < -threshold) {
        // Clear pending timers, snap any mid-show rows to idle
        scrollTimers.current.forEach(t => clearTimeout(t));
        scrollTimers.current = [];
        setRowAnimStates(prev => prev.map(s => s === 'showing' ? 'idle' : s));

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

        scrollTimers.current.push(setTimeout(() => {
          setRowsRevealed(prev => {
            const next = new Set(prev);
            next.delete(0);
            return next;
          });

          setWindowStart(prev => (prev - 1 + totalRows) % totalRows);

          isScrollTransitioning.current = false;

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

              scrollTimers.current.push(setTimeout(() => {
                setRowAnimStates(prev => {
                  const next = [...prev];
                  next[0] = 'idle';
                  return next;
                });
              }, ANIMATION_DURATION));
            });
          });
        }, ANIMATION_DURATION / 4));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [windowStart, opportunities.length, activeFilter]);

  // Wheel-based detail section scrolling (like home page)
  useEffect(() => {
    if (!viewingOpp) return;
    const detailSections = getDetailSections(viewingOpp);
    const totalSections = detailSections.length;
    if (totalSections <= 1) return;

    let scrollAccumulator = 0;
    const threshold = 300;

    const handleDetailWheel = (e: WheelEvent) => {
      // Block only during hide→swap, allow interrupt during show
      if (isDetailScrolling.current) return;
      scrollAccumulator += e.deltaY;

      const changeSection = (newSection: number) => {
        // Clear pending timers from previous transition
        detailTimers.current.forEach(t => clearTimeout(t));
        detailTimers.current = [];

        // Snap to idle if mid-show
        setDetailAnimState('idle');

        isDetailScrolling.current = true;

        // Smoke hide current section fields
        if (smokeEffectRef.current) {
          const fields = document.querySelectorAll('.detail-section-content .detail-field') as NodeListOf<HTMLElement>;
          if (fields.length > 0) {
            smokeEffectRef.current.initFromElement(fields[0]);
            for (let i = 1; i < fields.length; i++) {
              smokeEffectRef.current.addFromElement(fields[i]);
            }
            smokeEffectRef.current.startHide();
          }
        }
        setDetailAnimState('hiding');

        // At overlap point, swap section and show new content
        detailTimers.current.push(setTimeout(() => {
          isDetailScrolling.current = false;
          setDetailSection(newSection);
          setDetailAnimState('showing');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (smokeEffectRef.current) {
                const fields = document.querySelectorAll('.detail-section-content .detail-field') as NodeListOf<HTMLElement>;
                if (fields.length > 0) {
                  smokeEffectRef.current.initFromElement(fields[0]);
                  for (let i = 1; i < fields.length; i++) {
                    smokeEffectRef.current.addFromElement(fields[i]);
                  }
                  smokeEffectRef.current.startShow();
                }
              }
            });
          });

          detailTimers.current.push(setTimeout(() => {
            setDetailAnimState('idle');
          }, ANIMATION_DURATION));
        }, ANIMATION_DURATION / 2));

        scrollAccumulator = 0;
      };

      if (scrollAccumulator > threshold) {
        const next = detailSection === totalSections - 1 ? 0 : detailSection + 1;
        changeSection(next);
      } else if (scrollAccumulator < -threshold) {
        const prev = detailSection === 0 ? totalSections - 1 : detailSection - 1;
        changeSection(prev);
      }
    };

    window.addEventListener('wheel', handleDetailWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleDetailWheel);
  }, [viewingOpp, detailSection]);

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

  // Build detail sections from opportunity data
  const getDetailSections = (opp: Opportunity | null) => {
    if (!opp) return [];
    const p = opp.parsed || {};
    const status = (opp.name?.split('__')?.[0] ?? '').toUpperCase();
    const title = p.title ?? opp.name;
    const secs: { label: string; content: React.ReactNode }[] = [];

    // Max chars per section body — roughly what fits in the viewport
    const MAX_CHARS = 600;

    // Helper: split text into chunks that break at paragraph/line boundaries
    const chunkText = (text: string): string[] => {
      if (text.length <= MAX_CHARS) return [text];
      const chunks: string[] = [];
      let remaining = text;
      while (remaining.length > 0) {
        if (remaining.length <= MAX_CHARS) {
          chunks.push(remaining);
          break;
        }
        // Find a good break point — last double newline, single newline, or space before limit
        let breakAt = remaining.lastIndexOf('\n\n', MAX_CHARS);
        if (breakAt < MAX_CHARS * 0.3) breakAt = remaining.lastIndexOf('\n', MAX_CHARS);
        if (breakAt < MAX_CHARS * 0.3) breakAt = remaining.lastIndexOf(' ', MAX_CHARS);
        if (breakAt < MAX_CHARS * 0.3) breakAt = MAX_CHARS;
        chunks.push(remaining.slice(0, breakAt).trimEnd());
        remaining = remaining.slice(breakAt).trimStart();
      }
      return chunks;
    };

    // Helper: convert URLs to links, replace ":" with bold " | ", strip bullet hyphens
    const linkify = (text: string): React.ReactNode => {
      // Strip leading bullet markers from each line
      const lines = text.split('\n');
      const processed = lines.map((line) => {
        return line.replace(/^\s*[-–•]\s+/, '');
      }).join('\n');

      // Split by URLs first
      const urlParts = processed.split(/(https?:\/\/[^\s]+)/g);

      return urlParts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return <a key={`u${i}`} href={part} target="_blank" rel="noreferrer" style={{ color: '#696A6F', textDecoration: 'underline' }}>{part}</a>;
        }
        // Replace first ":" on each line with bold " | "
        const lineSegs = part.split('\n');
        const hasLabels = lineSegs.some(l => { const ci = l.indexOf(':'); return ci > 0 && ci < 60; });
        return lineSegs.map((line, li) => {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0 && colonIdx < 60) {
            const label = line.slice(0, colonIdx);
            const value = line.slice(colonIdx + 1).trimStart();
            return (
              <div key={`${i}-${li}`} style={{ display: 'block', marginTop: '12px', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: '16px' }}> | </span>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{value}</span>
              </div>
            );
          }
          if (hasLabels) {
            return <div key={`${i}-${li}`} style={{ fontSize: '12px', fontWeight: 400 }}>{line}</div>;
          }
          return <div key={`${i}-${li}`}>{line}</div>;
        });
      });
    };

    // Helper: push one or more sections for a text field
    const pushTextSections = (label: string, heading: string, text: string, preWrap?: boolean) => {
      const chunks = chunkText(text);
      chunks.forEach((chunk, i) => {
        const displayHeading = chunks.length > 1 ? `${heading} (${i + 1}/${chunks.length})` : heading;
        secs.push({
          label: `${label}-${i}`,
          content: (
            <>
              <p className="detail-field section-notice">{title}</p>
              <h1 className="detail-field main-heading">{displayHeading}</h1>
              <div className="decorator-line"></div>
              <div className="detail-field body-paragraph" style={preWrap ? { whiteSpace: 'pre-wrap' } : undefined}>{linkify(chunk)}</div>
            </>
          ),
        });
      });
    };

    // Section 1: Overview (always fits)
    secs.push({
      label: 'overview',
      content: (
        <>
          <p className="detail-field section-notice">{status}</p>
          <h1 className="detail-field main-heading">{title}</h1>
          <div className="decorator-line"></div>
          <p className="detail-field meta-info">
            {p.duration_weeks ? `${p.duration_weeks} weeks` : '—'} · {p.output_type ?? '—'} · {p.focus_area ?? '—'}
          </p>
          <div className="detail-field body-paragraph" style={{ marginTop: '12px' }}>
            <span style={{ fontWeight: 700 }}>Lead</span>
            <span style={{ fontWeight: 700 }}> | </span>
            <span>{p.lead_name ?? '—'}</span>
          </div>
          {p.deliverable && (
            <div className="detail-field" style={{ marginTop: '20px' }}>
              <div className="body-paragraph" style={{ fontWeight: 700, marginBottom: '8px' }}>Deliverable</div>
              <div className="decorator-line"></div>
              <div className="body-paragraph">{p.deliverable}</div>
            </div>
          )}
        </>
      ),
    });

    // Description — may chunk
    if (p.purpose) {
      pushTextSections('description', 'Description', p.purpose);
    }

    // Timeline — may chunk (pre-wrap)
    if (p.milestones) {
      pushTextSections('timeline', 'Timeline', p.milestones, true);
    }

    // Team
    if (p.team_members) {
      let members = Array.isArray(p.team_members)
        ? p.team_members.map((m: any) => typeof m === 'string' ? m : m.name).join(' · ')
        : typeof p.team_members === 'string'
          ? p.team_members.split(/\r?\n/).map((line: string) => line.split('<')[0].trim()).join(' · ')
          : '—';
      if (p.lead_name && !members.includes(p.lead_name)) {
        members = p.lead_name + ' · ' + members;
      }
      pushTextSections('team', 'Team', members);
    }

    // Dependencies
    if (p.dependencies) {
      pushTextSections('dependencies', 'Dependencies', p.dependencies);
    }

    return secs;
  };

  // View detail — smoke hide table, show detail panel
  const handleView = (opp: Opportunity) => {
    if (viewingOpp) return;

    // Smoke hide all visible rows
    if (smokeEffectRef.current) {
      let first = true;
      document.querySelectorAll('.table-row .title').forEach(el => {
        const htmlEl = el as HTMLElement;
        if (first) { smokeEffectRef.current!.initFromElement(htmlEl); first = false; }
        else smokeEffectRef.current!.addFromElement(htmlEl);
      });
      smokeEffectRef.current.startHide();
    }

    setHeadingAnimState('hiding');
    setFilterBarAnimState('hiding');
    setScrollDotsAnimState('hiding');
    setRowAnimStates(prev => prev.map(() => 'hiding'));

    setTimeout(() => {
      setTableVisible(false);
      setViewingOpp(opp);
      setDetailSection(0);
      setDetailAnimState('showing');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const detailEls = document.querySelectorAll('.detail-section-content .detail-field') as NodeListOf<HTMLElement>;
          if (detailEls.length > 0 && smokeEffectRef.current) {
            smokeEffectRef.current.initFromElement(detailEls[0]);
            for (let i = 1; i < detailEls.length; i++) {
              smokeEffectRef.current.addFromElement(detailEls[i]);
            }
            smokeEffectRef.current.startShow();
          }
        });
      });

      setTimeout(() => setDetailAnimState('idle'), ANIMATION_DURATION);
    }, ANIMATION_DURATION / 4);
  };

  // Close detail — smoke hide detail, show table (fast, no stagger)
  const handleCloseDetail = () => {
    if (!viewingOpp) return;

    // Smoke hide detail fields
    if (smokeEffectRef.current) {
      const detailEls = document.querySelectorAll('.detail-section-content .detail-field') as NodeListOf<HTMLElement>;
      if (detailEls.length > 0) {
        smokeEffectRef.current.initFromElement(detailEls[0]);
        for (let i = 1; i < detailEls.length; i++) {
          smokeEffectRef.current.addFromElement(detailEls[i]);
        }
        smokeEffectRef.current.startHide();
      }
    }
    setDetailAnimState('hiding');

    setTimeout(() => {
      setViewingOpp(null);
      setDetailAnimState('idle');
      setTableVisible(true);

      // Show table back — all at once (fast return)
      setHeadingAnimState('showing');
      setFilterBarAnimState('showing');
      setScrollDotsAnimState('showing');
      const visibleCount = Math.min(getSortedOpportunities().length, MAX_VISIBLE_ROWS);
      setRowsRevealed(new Set(Array.from({ length: visibleCount }, (_, i) => i)));
      setRowAnimStates(new Array(visibleCount).fill('showing'));

      requestAnimationFrame(() => {
        // Smoke show heading
        const headingEl = document.querySelector('.browse-heading') as HTMLElement;
        if (headingEl && smokeEffectRef.current) {
          smokeEffectRef.current.initFromElement(headingEl);
          smokeEffectRef.current.startShow();
        }
        // Smoke show all row titles at once
        let first = true;
        document.querySelectorAll('.table-row .title').forEach(el => {
          const htmlEl = el as HTMLElement;
          if (first && smokeEffectRef.current) {
            smokeEffectRef.current.initFromElement(htmlEl);
            first = false;
          } else if (smokeEffectRef.current) {
            smokeEffectRef.current.addFromElement(htmlEl);
          }
        });
        if (smokeEffectRef.current) smokeEffectRef.current.startShow();
      });

      setTimeout(() => {
        setHeadingAnimState('idle');
        setFilterBarAnimState('idle');
        setScrollDotsAnimState('idle');
        setRowAnimStates(prev => prev.map(() => 'idle'));
      }, ANIMATION_DURATION);
    }, ANIMATION_DURATION / 4);
  };

  // Join panel — smoke hide table, show join form
  const handleJoin = (opp: Opportunity) => {
    if (joiningOpp || viewingOpp) return;

    if (smokeEffectRef.current) {
      let first = true;
      document.querySelectorAll('.table-row .title').forEach(el => {
        const htmlEl = el as HTMLElement;
        if (first) { smokeEffectRef.current!.initFromElement(htmlEl); first = false; }
        else smokeEffectRef.current!.addFromElement(htmlEl);
      });
      smokeEffectRef.current.startHide();
    }

    setHeadingAnimState('hiding');
    setFilterBarAnimState('hiding');
    setScrollDotsAnimState('hiding');
    setRowAnimStates(prev => prev.map(() => 'hiding'));

    setTimeout(() => {
      setTableVisible(false);
      setJoiningOpp(opp);
      setJoinFormData({ name: '', email: '' });
      setJoinSubmitting(false);
      setJoinResult(null);
      setJoinAnimState('showing');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const fields = document.querySelectorAll('.join-panel .detail-field') as NodeListOf<HTMLElement>;
          if (fields.length > 0 && smokeEffectRef.current) {
            smokeEffectRef.current.initFromElement(fields[0]);
            for (let i = 1; i < fields.length; i++) smokeEffectRef.current.addFromElement(fields[i]);
            smokeEffectRef.current.startShow();
          }
        });
      });

      setTimeout(() => setJoinAnimState('idle'), ANIMATION_DURATION);
    }, ANIMATION_DURATION / 4);
  };

  const handleCloseJoin = () => {
    if (!joiningOpp) return;

    if (smokeEffectRef.current) {
      const fields = document.querySelectorAll('.join-panel .detail-field') as NodeListOf<HTMLElement>;
      if (fields.length > 0) {
        smokeEffectRef.current.initFromElement(fields[0]);
        for (let i = 1; i < fields.length; i++) smokeEffectRef.current.addFromElement(fields[i]);
        smokeEffectRef.current.startHide();
      }
    }
    setJoinAnimState('hiding');

    setTimeout(() => {
      setJoiningOpp(null);
      setJoinAnimState('idle');
      setTableVisible(true);

      setHeadingAnimState('showing');
      setFilterBarAnimState('showing');
      setScrollDotsAnimState('showing');
      const visibleCount = Math.min(getSortedOpportunities().length, MAX_VISIBLE_ROWS);
      setRowsRevealed(new Set(Array.from({ length: visibleCount }, (_, i) => i)));
      setRowAnimStates(new Array(visibleCount).fill('showing'));

      requestAnimationFrame(() => {
        const headingEl = document.querySelector('.browse-heading') as HTMLElement;
        if (headingEl && smokeEffectRef.current) {
          smokeEffectRef.current.initFromElement(headingEl);
          smokeEffectRef.current.startShow();
        }
        let first = true;
        document.querySelectorAll('.table-row .title').forEach(el => {
          const htmlEl = el as HTMLElement;
          if (first && smokeEffectRef.current) { smokeEffectRef.current.initFromElement(htmlEl); first = false; }
          else if (smokeEffectRef.current) smokeEffectRef.current.addFromElement(htmlEl);
        });
        if (smokeEffectRef.current) smokeEffectRef.current.startShow();
      });

      setTimeout(() => {
        setHeadingAnimState('idle');
        setFilterBarAnimState('idle');
        setScrollDotsAnimState('idle');
        setRowAnimStates(prev => prev.map(() => 'idle'));
      }, ANIMATION_DURATION);
    }, ANIMATION_DURATION / 4);
  };

  const handleJoinSubmit = async () => {
    if (!joiningOpp || joinSubmitting) return;
    setJoinSubmitting(true);
    setJoinResult(null);
    try {
      const res = await fetch('/api/storage/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: joiningOpp.name, name: joinFormData.name, email: joinFormData.email })
      });
      let data = null;
      try { data = await res.json(); } catch { data = null; }
      if (data && data.success) {
        setJoined(prev => ({ ...prev, [joiningOpp.name]: true }));
        setJoinResult({ success: true, message: 'Successfully joined!' });
      } else {
        const msg = data?.error ? (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : 'Failed to join';
        setJoinResult({ success: false, message: msg });
      }
    } catch (err) {
      setJoinResult({ success: false, message: (err as Error).message });
    } finally {
      setJoinSubmitting(false);
    }
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
        @keyframes content-show-a {
          0% { filter: blur(100px); opacity: 0; }
          1% { filter: blur(100px); opacity: 1; }
          100% { filter: none; opacity: 1; }
        }
        @keyframes content-show-b {
          0% { filter: blur(100px); opacity: 0; }
          1% { filter: blur(100px); opacity: 1; }
          100% { filter: none; opacity: 1; }
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
        {tableVisible && (
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
                    <button className="btn-view" onClick={() => handleView(opp)}>VIEW</button>
                    {!joined[opp.name] && (
                      <button className="btn-join" onClick={() => handleJoin(opp)}>JOIN</button>
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
        )}

        {/* Detail panel - right-aligned, section-based like home page */}
        {viewingOpp && (() => {
          const detailSections = getDetailSections(viewingOpp);
          const currentDetailContent = detailSections[detailSection];
          const totalSections = detailSections.length;
          return (
            <div className="detail-panel">
              <button className="detail-back" onClick={handleCloseDetail}>← BACK</button>
              <div className="detail-progress">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const total = detailSections.length;
                  const sectionNum = ((detailSection + offset + total) % total) + 1;
                  const absOffset = Math.abs(offset);
                  const cls = absOffset === 0 ? 'active' : absOffset === 1 ? 'secondary' : 'tertiary';
                  return (
                    <div key={offset} className={`detail-progress-marker ${cls}`}>
                      {sectionNum < 10 ? `0${sectionNum}` : sectionNum}
                    </div>
                  );
                })}
              </div>
              <div className="detail-section-content" style={
                detailAnimState === 'showing'
                  ? { animation: `content-show-${detailSection % 2 === 0 ? 'a' : 'b'} ${ANIMATION_DURATION}ms ease-in-out forwards`, filter: 'blur(100px)', opacity: 0 }
                  : getAnimationStyle(detailAnimState)
              }>
                {currentDetailContent?.content}
              </div>
            </div>
          );
        })()}

        {/* Join panel — form view like detail panel */}
        {joiningOpp && (() => {
          const p = joiningOpp.parsed || {};
          const title = p.title ?? joiningOpp.name;
          return (
            <div className="detail-panel join-panel">
              <button className="detail-back" onClick={handleCloseJoin}>← BACK</button>
              <div className="detail-section-content" style={getAnimationStyle(joinAnimState)}>
                <p className="detail-field section-notice">Join Team</p>
                <h1 className="detail-field main-heading">{title}</h1>
                <div className="decorator-line"></div>
                <p className="detail-field body-paragraph" style={{ marginBottom: '40px', opacity: 0.6 }}>Enter your details to join this microproduct.</p>

                <div className="detail-field submit-form-group">
                  <label htmlFor="join-name">Name *</label>
                  <input type="text" id="join-name" value={joinFormData.name} onChange={e => setJoinFormData(prev => ({ ...prev, name: e.target.value }))} required />
                </div>

                <div className="detail-field submit-form-group">
                  <label htmlFor="join-email">Email *</label>
                  <input type="email" id="join-email" value={joinFormData.email} onChange={e => setJoinFormData(prev => ({ ...prev, email: e.target.value }))} required />
                </div>

                <button className="detail-field submit-btn" onClick={handleJoinSubmit} disabled={joinSubmitting || !joinFormData.name.trim()}>
                  {joinSubmitting ? 'Submitting...' : 'Submit Member'}
                </button>
                {joinResult && (
                  <div className={`detail-field submit-alert ${joinResult.success ? 'success' : 'error'}`}>
                    {joinResult.message}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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
