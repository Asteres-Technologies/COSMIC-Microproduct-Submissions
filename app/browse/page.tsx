'use client'

import { useEffect, useState } from 'react';
import './browse.css';

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
        <div key={i} className="member">{m.name}{m.email ? ` <${m.email}>` : ''}</div>
      ));
    }
    if (typeof tm === 'string') {
      return tm.split(/\r?\n/).map((line: string, i: number) => (
        <div key={i} className="member">{line}</div>
      ));
    }
    return null;
  };

  return (
    <div className="submit-container">
      <h1>Browse Microproducts</h1>
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
                  <div className="section-body">{p.lead_name ?? '—'} {p.lead_email ? `(${p.lead_email})` : ''}</div>
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
  );
}
