import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const REPO_CONFIG = {
  owner: process.env.GITHUB_REPO_OWNER,
  repo: process.env.GITHUB_REPO_NAME,
};

export async function POST(request) {
  try {
    const { filename, name, email } = await request.json();
    if (!filename || !name) {
      return Response.json({ success: false, error: 'filename and name are required' }, { status: 400 });
    }

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
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
