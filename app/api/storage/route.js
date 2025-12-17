import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';
import { microproductSchema, statusSchema } from '@/lib/microproduct-schema';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const REPO_CONFIG = {
  owner: process.env.GITHUB_REPO_OWNER,
  repo: process.env.GITHUB_REPO_NAME,
};

// Test endpoint
export async function GET() {
  try {
    const { data } = await octokit.repos.getContent({
      ...REPO_CONFIG,
      path: 'submissions'
    });

    // If directory is empty return early
    if (!Array.isArray(data)) {
      return Response.json({ success: true, message: 'No submissions', files: [] });
    }

    // Fetch each YAML file's content and parse YAML so the frontend can display details
    const filesWithContent = await Promise.all(data.map(async (entry) => {
      // only include files that look like YAML
      if (entry.type !== 'file' || !/\.ya?ml$/i.test(entry.name)) return null;
      try {
        const { data: fileData } = await octokit.repos.getContent({
          ...REPO_CONFIG,
          path: entry.path
        });

        const raw = Buffer.from(fileData.content, 'base64').toString('utf8');
        let parsed = null;
        try {
          parsed = yaml.load(raw);
        } catch (e) {
          parsed = null;
        }

        return {
          name: entry.name,
          path: entry.path,
          sha: entry.sha,
          parsed,
          raw
        };
      } catch (err) {
        return {
          name: entry.name,
          path: entry.path,
          sha: entry.sha,
          parsed: null,
          raw: null,
          error: err.message
        };
      }
    }));

    return Response.json({ 
      success: true, 
      message: 'Connected to GitHub!',
      files: filesWithContent.filter(Boolean)
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Submission endpoint with validation
export async function POST(request) {
  try {
    const rawData = await request.json();
    
    // Validate with Zod
    const formData = microproductSchema.parse(rawData);
    
    console.log('Validated form data:', formData);
    
    // Generate filename with status prefix
    const timestamp = new Date().toISOString().split('T')[0];
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
    const filename = `pending__${timestamp}-${slug}.yaml`;
    
    console.log('Generated filename:', filename);
    
    // Convert to YAML
    const yamlContent = yaml.dump({
      ...formData,
      submitted_date: new Date().toISOString()
    });
    
    console.log('YAML content:', yamlContent);
    
    // Create file in GitHub
    await octokit.repos.createOrUpdateFileContents({
      ...REPO_CONFIG,
      path: `submissions/${filename}`,
      message: `New microproduct submission: ${formData.title}`,
      content: Buffer.from(yamlContent).toString('base64'),
    });

    return Response.json({ 
      success: true, 
      filename,
      message: 'Submission created successfully'
    });
  } catch (error) {
    console.error('Full error:', error);
    
    // Handle Zod validation errors (be defensive about error shape)
    if (error && error.name === 'ZodError') {
      const details = Array.isArray(error.errors)
        ? error.errors.map(e => ({ field: Array.isArray(e.path) ? e.path.join('.') : String(e.path), message: e.message }))
        : [];

      return Response.json({
        success: false,
        error: 'Validation failed',
        details
      }, { status: 400 });
    }
    
    return Response.json({ 
      success: false, 
      error: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : undefined
    }, { status: 500 });
  }
}

// Update submission status with validation
export async function PATCH(request) {
  try {
    const rawData = await request.json();
    
    // Validate with Zod
    const { filename, newStatus } = statusSchema.parse(rawData);
    
    console.log('Updating status:', { filename, newStatus });
    
    // Get the current file
    const { data: currentFile } = await octokit.repos.getContent({
      ...REPO_CONFIG,
      path: `submissions/${filename}`
    });
    
    // Parse the current filename to extract the date and slug
    const filenameParts = filename.split('__');
    if (filenameParts.length !== 2) {
      return Response.json({ 
        success: false, 
        error: 'Invalid filename format' 
      }, { status: 400 });
    }
    
    const dateAndSlug = filenameParts[1];
    const newFilename = `${newStatus}__${dateAndSlug}`;
    
    // Decode the content
    const content = Buffer.from(currentFile.content, 'base64').toString('utf8');
    
    // Delete old file
    await octokit.repos.deleteFile({
      ...REPO_CONFIG,
      path: `submissions/${filename}`,
      message: `Status change: ${filename} -> ${newFilename}`,
      sha: currentFile.sha
    });
    
    // Create new file with updated status
    await octokit.repos.createOrUpdateFileContents({
      ...REPO_CONFIG,
      path: `submissions/${newFilename}`,
      message: `Status change: ${filename} -> ${newFilename}`,
      content: Buffer.from(content).toString('base64')
    });

    return Response.json({ 
      success: true, 
      oldFilename: filename,
      newFilename,
      message: `Status updated to ${newStatus}`
    });
  } catch (error) {
    console.error('Full error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return Response.json({ 
        success: false, 
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }, { status: 400 });
    }
    
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
