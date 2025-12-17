import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const REPO_CONFIG = {
  owner: process.env.GITHUB_REPO_OWNER,
  repo: process.env.GITHUB_REPO_NAME,
};

// Test endpoint - keep this
export async function GET() {
  try {
    const { data } = await octokit.repos.getContent({
      ...REPO_CONFIG,
      path: 'submissions'
    });

    return Response.json({ 
      success: true, 
      message: 'Connected to GitHub!',
      files: data 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Submission endpoint
export async function POST(request) {
  try {
    const formData = await request.json();
    
    console.log('Received form data:', formData);
    
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
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// Update submission status (rename file)
export async function PATCH(request) {
  try {
    const { filename, newStatus } = await request.json();
    
    console.log('Updating status:', { filename, newStatus });
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'in-progress', 'completed', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      return Response.json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }
    
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
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
