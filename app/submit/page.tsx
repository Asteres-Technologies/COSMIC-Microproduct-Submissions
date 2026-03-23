'use client'

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { microproductSchema } from '@/lib/microproduct-schema';
import { AnimationState, getAnimationStyle, ANIMATION_DURATION } from '@/lib/animations';
import { SmokeEffect } from '@/lib/smoke-effect';

type FormData = {
  title: string;
  purpose: string;
  deliverable: string;
  output_type: string;
  scope: string;
  target_audience: string;
  releasability: string;
  duration_weeks: number;
  milestones: string;
  effort_estimate: string;
  lead_name: string;
  lead_email: string;
  team_members: { name: string; email: string }[];
  focus_area: string;
  dependencies: string;
};

export default function SubmitPage() {
  const router = useRouter();
  const [contentAnimState, setContentAnimState] = useState<AnimationState>('showing');
  const smokeCanvasRef = useRef<HTMLCanvasElement>(null);
  const smokeEffectRef = useRef<SmokeEffect | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '', purpose: '', deliverable: '', output_type: 'Framework Document',
    scope: '', target_audience: '', releasability: 'public', duration_weeks: 4,
    milestones: '', effort_estimate: '', lead_name: '', lead_email: '',
    team_members: [], focus_area: 'Research & Technology', dependencies: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Smoke effect init
  useEffect(() => {
    if (smokeCanvasRef.current && !smokeEffectRef.current) {
      smokeEffectRef.current = new SmokeEffect(smokeCanvasRef.current);
    }
    return () => {
      if (smokeEffectRef.current) { smokeEffectRef.current.stop(); smokeEffectRef.current = null; }
    };
  }, []);

  // Entry animation
  useEffect(() => {
    requestAnimationFrame(() => {
      const heading = document.querySelector('.submit-form-container .main-heading') as HTMLElement;
      if (heading && smokeEffectRef.current) {
        smokeEffectRef.current.initFromElement(heading);
        smokeEffectRef.current.startShow();
      }
    });
    setTimeout(() => setContentAnimState('idle'), ANIMATION_DURATION);
  }, []);

  // Page exit
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

      if (smokeEffectRef.current) {
        const heading = document.querySelector('.submit-form-container .main-heading') as HTMLElement;
        if (heading) {
          smokeEffectRef.current.initFromElement(heading);
          smokeEffectRef.current.startHide();
        }
      }
      setContentAnimState('hiding');
      setTimeout(() => router.push(href), ANIMATION_DURATION / 2);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [router]);

  const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const addTeamMember = () => setFormData(prev => ({ ...prev, team_members: [...prev.team_members, { name: '', email: '' }] }));
  const updateTeamMember = (i: number, field: 'name' | 'email', value: string) => {
    setFormData(prev => { const copy = prev.team_members.map(m => ({ ...m })); copy[i][field] = value; return { ...prev, team_members: copy }; });
  };
  const removeTeamMember = (i: number) => setFormData(prev => ({ ...prev, team_members: prev.team_members.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setFieldErrors({});

    const schemaResult = microproductSchema.safeParse(formData);
    if (!schemaResult.success) {
      const errs: Record<string, string> = {};
      (schemaResult.error.issues as any[]).forEach((issue: any) => {
        const field = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path);
        errs[field] = issue.message;
      });
      setFieldErrors(errs);
      setResult({ success: false, message: 'Please fix validation errors before submitting.' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try { data = await response.json(); } catch { data = null; }
      }

      if ((data && data.success) || response.ok) {
        setResult({ success: true, message: 'Microproduct submitted successfully!' });
        setFormData({
          title: '', purpose: '', deliverable: '', output_type: 'Framework Document',
          scope: '', target_audience: '', releasability: 'public', duration_weeks: 4,
          milestones: '', effort_estimate: '', lead_name: '', lead_email: '',
          team_members: [], focus_area: 'Research & Technology', dependencies: ''
        });
      } else {
        const msg = data && data.error ? data.error : `Submission failed (${response.status})`;
        if (data && Array.isArray(data.details)) {
          const errs: Record<string, string> = {};
          data.details.forEach((d: any) => { if (d.field) errs[d.field] = d.message; });
          setFieldErrors(errs);
        }
        setResult({ success: false, message: msg });
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : String(error) });
    } finally {
      setSubmitting(false);
    }
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
          100% { filter: none; opacity: 1; }
        }
      `}</style>

      <canvas ref={smokeCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 3, willChange: 'contents' }} />

      <div className="browse-container">
        {/* Background layers */}
        <div className="browse-background"></div>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(to top right, rgba(30, 37, 44, 0.98), rgba(144, 181, 216, 0.38), transparent)', pointerEvents: 'none', zIndex: 1 }}></div>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(15px)', background: 'rgba(255, 255, 255, 0.56)', pointerEvents: 'none', zIndex: 2 }}></div>

        <div className="classification-marking" style={{ position: 'fixed', top: 50, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>unclassified / public</div>

        <div className="submit-page-layout">
          <div className="submit-form-container" style={getAnimationStyle(contentAnimState)}>
            <p className="section-notice">New Submission</p>
            <h1 className="main-heading">Submit a Microproduct</h1>
            <div className="decorator-line"></div>
            <p className="body-paragraph" style={{ marginBottom: '40px', opacity: 0.6 }}>Propose a focused deliverable that can be completed in 2–12 weeks.</p>

            <form onSubmit={handleSubmit}>
              {/* Section 1: Product Overview */}
              <div className="submit-section">
                <div className="submit-section-title">What are you building?</div>

                <div className="submit-form-group">
                  <label htmlFor="title">Product Title *</label>
                  <input type="text" id="title" name="title" value={formData.title} className={fieldErrors.title ? 'input-error' : ''} onChange={handleChange} required />
                  {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
                </div>

                <div className="submit-form-group">
                  <label htmlFor="purpose">Purpose *</label>
                  <textarea id="purpose" name="purpose" value={formData.purpose} className={fieldErrors.purpose ? 'input-error' : ''} onChange={handleChange} rows={4} required />
                  {fieldErrors.purpose && <div className="field-error">{fieldErrors.purpose}</div>}
                </div>

                <div className="submit-form-group">
                  <label htmlFor="deliverable">Deliverable *</label>
                  <input type="text" id="deliverable" name="deliverable" value={formData.deliverable} className={fieldErrors.deliverable ? 'input-error' : ''} onChange={handleChange} placeholder="e.g., Reference architecture document" required />
                  {fieldErrors.deliverable && <div className="field-error">{fieldErrors.deliverable}</div>}
                </div>

                <div className="submit-form-group">
                  <label>Output Type *</label>
                  <div className="submit-dropdown">
                    <div className={`submit-dropdown-trigger ${openDropdown === 'output_type' ? 'open' : ''}`} onClick={() => setOpenDropdown(openDropdown === 'output_type' ? null : 'output_type')}>
                      {formData.output_type}
                    </div>
                    {openDropdown === 'output_type' && (
                      <div className="submit-dropdown-menu">
                        {['Database', 'Framework Document', 'Analysis Report', 'Whitepaper', 'Architecture Document', 'Other'].map(opt => (
                          <div key={opt} className={`submit-dropdown-option ${formData.output_type === opt ? 'selected' : ''}`} onClick={() => { setFormData(prev => ({ ...prev, output_type: opt })); setOpenDropdown(null); }}>{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Scope & Audience */}
              <div className="submit-section">
                <div className="submit-section-title">Who is this for?</div>

                <div className="submit-form-group">
                  <label htmlFor="scope">Scope *</label>
                  <textarea id="scope" name="scope" value={formData.scope} className={fieldErrors.scope ? 'input-error' : ''} onChange={handleChange} rows={4} required />
                  {fieldErrors.scope && <div className="field-error">{fieldErrors.scope}</div>}
                </div>

                <div className="submit-form-group">
                  <label htmlFor="target_audience">Target Audience *</label>
                  <input type="text" id="target_audience" name="target_audience" value={formData.target_audience} onChange={handleChange} placeholder="e.g., COSMIC Members, NASA, Industry" required />
                </div>

                <div className="submit-form-group">
                  <label>Releasability *</label>
                  <div className="submit-radio-group">
                    <label>
                      <input type="radio" name="releasability" value="public" checked={formData.releasability === 'public'} onChange={handleChange} />
                      Public
                    </label>
                    <label>
                      <input type="radio" name="releasability" value="cosmic-only" checked={formData.releasability === 'cosmic-only'} onChange={handleChange} />
                      COSMIC Only
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Timeline */}
              <div className="submit-section">
                <div className="submit-section-title">Timeline & Effort</div>

                <div className="submit-form-group">
                  <label htmlFor="duration_weeks">Duration (weeks) *</label>
                  <input type="number" id="duration_weeks" name="duration_weeks" value={formData.duration_weeks} className={fieldErrors.duration_weeks ? 'input-error' : ''} onChange={handleChange} min={2} max={12} required />
                  <small>Between 2–12 weeks</small>
                  {fieldErrors.duration_weeks && <div className="field-error">{fieldErrors.duration_weeks}</div>}
                </div>

                <div className="submit-form-group">
                  <label htmlFor="milestones">Milestones *</label>
                  <textarea id="milestones" name="milestones" value={formData.milestones} className={fieldErrors.milestones ? 'input-error' : ''} onChange={handleChange} rows={4} placeholder={"Week 1-2: Research\nWeek 3-4: Draft\nWeek 5-6: Review"} required />
                  {fieldErrors.milestones && <div className="field-error">{fieldErrors.milestones}</div>}
                </div>

                <div className="submit-form-group">
                  <label htmlFor="effort_estimate">Effort Estimate *</label>
                  <input type="text" id="effort_estimate" name="effort_estimate" value={formData.effort_estimate} className={fieldErrors.effort_estimate ? 'input-error' : ''} onChange={handleChange} placeholder="Approx. how many 1-hour work blocks?" required />
                  {fieldErrors.effort_estimate && <div className="field-error">{fieldErrors.effort_estimate}</div>}
                </div>
              </div>

              {/* Section 4: Team */}
              <div className="submit-section">
                <div className="submit-section-title">Team</div>

                <div className="submit-form-group">
                  <label htmlFor="lead_name">Lead Name *</label>
                  <input type="text" id="lead_name" name="lead_name" value={formData.lead_name} className={fieldErrors.lead_name ? 'input-error' : ''} onChange={handleChange} required />
                  {fieldErrors.lead_name && <div className="field-error">{fieldErrors.lead_name}</div>}
                </div>

                <div className="submit-form-group">
                  <label htmlFor="lead_email">Lead Email *</label>
                  <input type="email" id="lead_email" name="lead_email" value={formData.lead_email} className={fieldErrors.lead_email ? 'input-error' : ''} onChange={handleChange} required />
                  {fieldErrors.lead_email && <div className="field-error">{fieldErrors.lead_email}</div>}
                </div>

                <div className="submit-form-group">
                  <label>Contributors</label>
                  {formData.team_members.map((member, idx) => (
                    <div key={idx} className="submit-team-row">
                      <input type="text" placeholder="Name" value={member.name} onChange={(e) => updateTeamMember(idx, 'name', e.target.value)} className={fieldErrors[`team_members.${idx}.name`] ? 'input-error' : ''} />
                      <input type="email" placeholder="Email (optional)" value={member.email} onChange={(e) => updateTeamMember(idx, 'email', e.target.value)} className={fieldErrors[`team_members.${idx}.email`] ? 'input-error' : ''} />
                      <button type="button" className="submit-remove-btn" onClick={() => removeTeamMember(idx)}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="submit-add-btn" onClick={addTeamMember}>+ add contributor</button>
                </div>

                <div className="submit-form-group">
                  <label>Focus Area *</label>
                  <div className="submit-dropdown">
                    <div className={`submit-dropdown-trigger ${openDropdown === 'focus_area' ? 'open' : ''}`} onClick={() => setOpenDropdown(openDropdown === 'focus_area' ? null : 'focus_area')}>
                      {formData.focus_area}
                    </div>
                    {openDropdown === 'focus_area' && (
                      <div className="submit-dropdown-menu">
                        {['Research & Technology', 'Demonstration Infrastructure', 'Missions & Ecosystems', 'Policy & Regulation', 'Workforce Development'].map(opt => (
                          <div key={opt} className={`submit-dropdown-option ${formData.focus_area === opt ? 'selected' : ''}`} onClick={() => { setFormData(prev => ({ ...prev, focus_area: opt })); setOpenDropdown(null); }}>{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="submit-form-group">
                  <label htmlFor="dependencies">Dependencies</label>
                  <textarea id="dependencies" name="dependencies" value={formData.dependencies} onChange={handleChange} rows={2} placeholder="Does this connect to other microproducts?" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? 'Submitting...' : 'Submit Microproduct'}
              </button>
              {result && (
                <div className={`submit-alert ${result.success ? 'success' : 'error'}`}>
                  {result.message}
                </div>
              )}
            </form>
          </div>

          <nav className="bottom-nav">
            <Link href="/" data-text="HOME">HOME</Link>
            <Link href="/submit" data-text="SUBMIT PRODUCT">SUBMIT PRODUCT</Link>
            <Link href="/browse" data-text="BROWSE PRODUCTS">BROWSE PRODUCTS</Link>
            <a href="https://cosmicspace.org/news/" target="_blank" rel="noreferrer" data-text="NEWS">NEWS</a>
          </nav>
        </div>
      </div>
    </>
  );
}
