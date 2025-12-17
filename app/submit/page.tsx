'use client'

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { microproductSchema } from '@/lib/microproduct-schema';
import './submit.css';

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
  const [formData, setFormData] = useState<FormData>({
    title: '',
    purpose: '',
    deliverable: '',
    output_type: 'Framework Document',
    scope: '',
    target_audience: '',
    releasability: 'public',
    duration_weeks: 4,
    milestones: '',
    effort_estimate: '',
    lead_name: '',
    lead_email: '',
    team_members: [],
    focus_area: 'Research & Technology',
    dependencies: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValidEmail = (s: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  };

  const validateForm = (data: FormData) => {
    const errs: Record<string, string> = {};
    if (!data.title || data.title.trim().length < 10) errs.title = 'Title must be at least 10 characters.';
    if (!data.purpose || data.purpose.trim().length < 10) errs.purpose = 'Purpose must be at least 10 characters.';
    if (!data.deliverable || data.deliverable.trim().length < 10) errs.deliverable = 'Deliverable must be at least 10 characters.';
    if (!data.scope || data.scope.trim().length < 10) errs.scope = 'Scope must be at least 10 characters.';
    if (!data.milestones || data.milestones.trim().length < 10) errs.milestones = 'Milestones must be at least 10 characters.';
    if (!data.effort_estimate || data.effort_estimate.trim().length < 1) errs.effort_estimate = 'Effort estimate is required.';
    if (!data.lead_name || data.lead_name.trim().length < 1) errs.lead_name = 'Lead name is required.';
    if (!data.lead_email || !isValidEmail(data.lead_email)) errs.lead_email = 'A valid lead email is required.';
    if (!Number.isInteger(data.duration_weeks) || data.duration_weeks < 2 || data.duration_weeks > 12) errs.duration_weeks = 'Duration must be between 2 and 12 weeks.';

    // team members
    data.team_members.forEach((m, i) => {
      if (!m.name || m.name.trim().length === 0) errs[`team_members.${i}.name`] = 'Contributor name is required.';
      if (m.email && m.email.trim().length > 0 && !isValidEmail(m.email)) errs[`team_members.${i}.email`] = 'Contributor email is invalid.';
    });

    return errs;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    const parsedValue: string | number = (target as HTMLInputElement).type === 'number' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, { name: '', email: '' }]
    }));
  };

  const updateTeamMember = (index: number, field: 'name' | 'email', value: string) => {
    setFormData(prev => {
      const copy = prev.team_members.map(m => ({ ...m }));
      copy[index][field] = value;
      return { ...prev, team_members: copy };
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setFieldErrors({});

    // Run shared Zod schema validation on the client to avoid drift
    const schemaResult = microproductSchema.safeParse(formData);
    if (!schemaResult.success) {
      const errs: Record<string, string> = {};
      (schemaResult.error.issues as any[]).forEach((e: any) => {
        const field = Array.isArray(e.path) ? e.path.join('.') : String(e.path);
        errs[field] = e.message;
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
        try { data = await response.json(); } catch (err) { console.warn('Failed to parse /api/storage POST response JSON', err); data = null; }
      }

      if (data && data.success) {
        setResult({ success: true, message: 'Microproduct submitted successfully!' });
        // Reset form
        setFormData({
          title: '',
          purpose: '',
          deliverable: '',
          output_type: 'Framework Document',
          scope: '',
          target_audience: '',
          releasability: 'public',
          duration_weeks: 4,
          milestones: '',
          effort_estimate: '',
          lead_name: '',
          lead_email: '',
          team_members: [],
          focus_area: 'Research & Technology',
          dependencies: ''
        });
      } else if (response.ok) {
        // Some server handlers may return an empty body but indicate success via status.
        setResult({ success: true, message: 'Microproduct submitted successfully!' });
        setFormData({
          title: '',
          purpose: '',
          deliverable: '',
          output_type: 'Framework Document',
          scope: '',
          target_audience: '',
          releasability: 'public',
          duration_weeks: 4,
          milestones: '',
          effort_estimate: '',
          lead_name: '',
          lead_email: '',
          team_members: [],
          focus_area: 'Research & Technology',
          dependencies: ''
        });
      } else {
        const msg = data && data.error ? data.error : `Submission failed (${response.status})`;
        // populate fieldErrors if details present
        if (data && Array.isArray(data.details)) {
          const errs: Record<string, string> = {};
          data.details.forEach((d: any) => { if (d.field) errs[d.field] = d.message; });
          setFieldErrors(errs);
        }
        setResult({ success: false, message: msg });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult({ success: false, message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submit-container">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
        <h1>Submit a Microproduct</h1>
        <Link href="/" className="home-btn">Home</Link>
      </div>
      <p className="subtitle">Propose a focused deliverable that can be completed in 2-12 weeks</p>


      <form onSubmit={handleSubmit}>
        {/* Section 1: Product Overview */}
        <section>
          <h2>What are you building?</h2>
          
          <div className="form-group">
            <label htmlFor="title">Product Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              className={fieldErrors.title ? 'input-error' : ''}
              onChange={handleChange}
              required
            />
            {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="purpose">What is this product and why does it matter? *</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              className={fieldErrors.purpose ? 'input-error' : ''}
              onChange={handleChange}
              rows={4}
              required
            />
            {fieldErrors.purpose && <div className="field-error">{fieldErrors.purpose}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="deliverable">What specific output will you create? *</label>
            <input
              type="text"
              id="deliverable"
              name="deliverable"
              value={formData.deliverable}
              className={fieldErrors.deliverable ? 'input-error' : ''}
              onChange={handleChange}
              placeholder="e.g., Reference architecture document, Technology database"
              required
            />
            {fieldErrors.deliverable && <div className="field-error">{fieldErrors.deliverable}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="output_type">Output Type *</label>
            <select
              id="output_type"
              name="output_type"
              value={formData.output_type}
              onChange={handleChange}
              required
            >
              <option>Database</option>
              <option>Framework Document</option>
              <option>Analysis Report</option>
              <option>Whitepaper</option>
              <option>Architecture Document</option>
              <option>Other</option>
            </select>
            {fieldErrors.output_type && <div className="field-error">{fieldErrors.output_type}</div>}
          </div>
        </section>

        {/* Section 2: Scope & Audience */}
        <section>
          <h2>Who is this for and what's included?</h2>

          <div className="form-group">
            <label htmlFor="scope">What's included and what's out of scope? *</label>
            <textarea
              id="scope"
              name="scope"
              value={formData.scope}
              className={fieldErrors.scope ? 'input-error' : ''}
              onChange={handleChange}
              rows={4}
              required
            />
            {fieldErrors.scope && <div className="field-error">{fieldErrors.scope}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="target_audience">Target Audience *</label>
            <input
              type="text"
              id="target_audience"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              placeholder="e.g., COSMIC Members, NASA, Industry, Academia"
              required
            />
            {fieldErrors.target_audience && <div className="field-error">{fieldErrors.target_audience}</div>}
          </div>

          <div className="form-group">
            <label>Releasability *</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="releasability"
                  value="public"
                  checked={formData.releasability === 'public'}
                  onChange={handleChange}
                />
                Public
              </label>
              <label>
                <input
                  type="radio"
                  name="releasability"
                  value="cosmic-only"
                  checked={formData.releasability === 'cosmic-only'}
                  onChange={handleChange}
                />
                COSMIC Members Only
              </label>
            </div>
            {fieldErrors.releasability && <div className="field-error">{fieldErrors.releasability}</div>}
          </div>
        </section>

        {/* Section 3: Timeline & Effort */}
        <section>
          <h2>How long will this take?</h2>

          <div className="form-group">
            <label htmlFor="duration_weeks">Duration (weeks) *</label>
            <input
              type="number"
              id="duration_weeks"
              name="duration_weeks"
              value={formData.duration_weeks}
              className={fieldErrors.duration_weeks ? 'input-error' : ''}
              onChange={handleChange}
              min="2"
              max="12"
              required
            />
            <small>Between 2-12 weeks</small>
            {fieldErrors.duration_weeks && <div className="field-error">{fieldErrors.duration_weeks}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="milestones">Milestones *</label>
            <textarea
              id="milestones"
              name="milestones"
              value={formData.milestones}
              className={fieldErrors.milestones ? 'input-error' : ''}
              onChange={handleChange}
              rows={4}
              placeholder="Week 1-2: Research&#10;Week 3-4: Draft&#10;Week 5-6: Review"
              required
            />
            {fieldErrors.milestones && <div className="field-error">{fieldErrors.milestones}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="effort_estimate">Effort Estimate *</label>
            <input
              type="text"
              id="effort_estimate"
              name="effort_estimate"
              value={formData.effort_estimate}
              className={fieldErrors.effort_estimate ? 'input-error' : ''}
              onChange={handleChange}
              placeholder="Approximately how many 1-hour work blocks?"
              required
            />
            <small>Helps others understand commitment level</small>
            {fieldErrors.effort_estimate && <div className="field-error">{fieldErrors.effort_estimate}</div>}
          </div>
        </section>

        {/* Section 4: Team & Context */}
        <section>
          <h2>Who's leading this?</h2>

          <div className="form-group">
            <label htmlFor="lead_name">Lead Name *</label>
            <input
              type="text"
              id="lead_name"
              name="lead_name"
              value={formData.lead_name}
              className={fieldErrors.lead_name ? 'input-error' : ''}
              onChange={handleChange}
              required
            />
            {fieldErrors.lead_name && <div className="field-error">{fieldErrors.lead_name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="lead_email">Lead Email *</label>
            <input
              type="email"
              id="lead_email"
              name="lead_email"
              value={formData.lead_email}
              className={fieldErrors.lead_email ? 'input-error' : ''}
              onChange={handleChange}
              required
            />
            {fieldErrors.lead_email && <div className="field-error">{fieldErrors.lead_email}</div>}
          </div>

          <div className="form-group">
            <label>Other Contributors (optional)</label>
            {formData.team_members.map((member, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                    required={false}
                    className={fieldErrors[`team_members.${idx}.name`] ? 'input-error' : ''}
                  />
                  {fieldErrors[`team_members.${idx}.name`] && <div className="field-error">{fieldErrors[`team_members.${idx}.name`]}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={member.email}
                    onChange={(e) => updateTeamMember(idx, 'email', e.target.value)}
                    className={fieldErrors[`team_members.${idx}.email`] ? 'input-error' : ''}
                  />
                  {fieldErrors[`team_members.${idx}.email`] && <div className="field-error">{fieldErrors[`team_members.${idx}.email`]}</div>}
                </div>

                <div style={{ marginTop: 4 }}>
                  <button type="button" onClick={() => removeTeamMember(idx)}>Remove</button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addTeamMember} className="add-member-btn">+ Add contributor</button>
          </div>

          <div className="form-group">
            <label htmlFor="focus_area">Focus Area *</label>
            <select
              id="focus_area"
              name="focus_area"
              value={formData.focus_area}
              onChange={handleChange}
              required
            >
              <option>Research & Technology</option>
              <option>Demonstration Infrastructure</option>
              <option>Missions & Ecosystems</option>
              <option>Policy & Regulation</option>
              <option>Workforce Development</option>
            </select>
            {fieldErrors.focus_area && <div className="field-error">{fieldErrors.focus_area}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="dependencies">Dependencies</label>
            <textarea
              id="dependencies"
              name="dependencies"
              value={formData.dependencies}
              onChange={handleChange}
              rows={2}
              placeholder="Does this build on or connect to other microproducts?"
            />
            {fieldErrors.dependencies && <div className="field-error">{fieldErrors.dependencies}</div>}
          </div>
        </section>

        <button type="submit" disabled={submitting} className="submit-btn primary-cta">
          <span className="btn-label">{submitting ? 'Submitting...' : 'Submit Microproduct'}</span>
        </button>
        {result && (
          <div className={`alert ${result.success ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
}
