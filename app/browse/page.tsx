'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Opportunity = {
  name: string;
  path: string;
  sha?: string;
  parsed?: any;
  raw?: string | null;
  error?: string;
};

export default function BrowsePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [joinForms, setJoinForms] = useState<Record<string, { name: string; email: string; submitting?: boolean; error?: string }>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/storage');
        let data = null;
        try { data = await res.json(); } catch (err) { console.error('Failed to parse /api/storage response JSON', err); data = null; }
        if (!mounted) return;
        if (data && data.success && Array.isArray(data.files)) {
          setOpportunities(data.files as Opportunity[]);
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
        <div className="table-container">
          {loading && <div>Loading...</div>}
          
          {!loading && opportunities.length === 0 && (
            <div>No opportunities found.</div>
          )}

          {/* Table rows */}
          {opportunities.map((opp) => {
            const p = opp.parsed || {};
            const status = (opp.name?.split('__')?.[0] ?? '').toLowerCase();
            const teamCount = p.team_members ? (Array.isArray(p.team_members) ? p.team_members.length : p.team_members.split(/\r?\n/).length) : 0;

            return (
              <div className="table-row" key={opp.path}>
                {/* Column 1: Title */}
                <div className="title">{p.title ?? opp.name}</div>
                
                {/* Column 2: Duration */}
                <div className="duration">{p.duration_weeks ?? '—'} Weeks</div>
                
                {/* Column 3: Members */}
                <div className="members">{teamCount} Members</div>
                
                {/* Column 4: Status */}
                <div className="status">{status.toUpperCase()}</div>
                
                {/* Column 5: Actions */}
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
          })}
        </div>

        {/* Bottom navigation - centered */}
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
  );
}
