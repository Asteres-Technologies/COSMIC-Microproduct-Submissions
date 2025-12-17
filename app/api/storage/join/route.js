import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';
import { joinSchema } from '@/lib/microproduct-schema';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const REPO_CONFIG = {
  owner: process.env.GITHUB_REPO_OWNER,
  repo: process.env.GITHUB_REPO_NAME,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = joinSchema.safeParse(body);
    if (!validation.success) {
      // Log raw validation error for debugging to see exact shape
      console.error('Join validation failed (raw):', validation.error);
      // Try common Zod error properties, or find the first array property on the error
      let rawErrors = [];
      if (validation.error) {
        if (Array.isArray(validation.error.issues)) rawErrors = validation.error.issues;
        else if (Array.isArray(validation.error.errors)) rawErrors = validation.error.errors;
        else {
          const vals = Object.keys(validation.error).map(k => validation.error[k]);
          const found = vals.find(v => Array.isArray(v));
          if (Array.isArray(found)) rawErrors = found;
        }
      }
      const issues = rawErrors.map((issue) => ({ path: issue.path, message: issue.message }));
      let message;
      if (issues.length) {
        message = issues.map(i => (Array.isArray(i.path) && i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message)).join('; ');
      } else if (validation.error && validation.error.message) {
        message = validation.error.message;
      } else {
        try {
          message = JSON.stringify(validation.error);
        } catch (e) {
          message = 'Invalid join request';
        }
      }
      console.error('Join validation message to return:', message);
      console.error('Join validation extracted issues:', issues);
      return Response.json({ success: false, error: message }, { status: 400 });
    }
    const { filename, name, email } = validation.data;

    const path = `submissions/${filename}`;
    // fetch current file
    const { data: currentFile } = await octokit.repos.getContent({
      ...REPO_CONFIG,
      path
    });

    const raw = Buffer.from(currentFile.content, 'base64').toString('utf8');
    let parsed = null;
    try {
      parsed = yaml.load(raw) || {};
    } catch (e) {
      parsed = {};
    }

    // normalize existing team_members (support legacy string format)
    const parseTeam = (tm) => {
      if (!tm) return [];
      if (Array.isArray(tm)) return tm.map(item => ({ name: item.name || item, email: item.email || '' }));
      if (typeof tm === 'string') {
        return tm.split(/\r?\n/).map(line => {
          const m = line.trim();
          const match = m.match(/^(.*)\s*<([^>]+)>$/);
          if (match) return { name: match[1].trim(), email: match[2].trim() };
          return { name: m, email: '' };
        }).filter(x => x.name);
      }
      return [];
    };

    const existing = parseTeam(parsed.team_members);
    existing.push({ name, email: email || '', joined_date: new Date().toISOString() });
    parsed.team_members = existing;

    const newContent = yaml.dump(parsed);

    // update file
    await octokit.repos.createOrUpdateFileContents({
      ...REPO_CONFIG,
      path,
      message: `Add joiner to ${filename}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: currentFile.sha
    });

    return Response.json({ success: true, message: 'Joined' });
  } catch (error) {
    console.error('Join error', error);
    return Response.json({ success: false, error: 'Failed to join' }, { status: 500 });
  }
}
