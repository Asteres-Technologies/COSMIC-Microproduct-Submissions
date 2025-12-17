import { z } from 'zod';

export const microproductSchema = z.object({
  title: z.string()
    .min(10, "Title with at least 10 characters is required")
    .max(100, "Title must be less than 100 characters"),
  
  purpose: z.string()
    .min(10, "Purpose must be at least 10 characters")
    .max(1000, "Purpose must be less than 1000 characters"),
  
  deliverable: z.string()
    .min(10, "Deliverable is required")
    .max(500, "Deliverable must be less than 500 characters"),
  
  output_type: z.enum([
    "Database",
    "Framework Document",
    "Analysis Report",
    "Whitepaper",
    "Architecture Document",
    "Other"
  ]),
  
  scope: z.string()
    .min(10, "Scope must be at least 10 characters")
    .max(2000, "Scope must be less than 2000 characters"),
  
  target_audience: z.string()
    .min(1, "Target audience is required")
    .max(500, "Target audience must be less than 500 characters"),
  
  releasability: z.enum(["public", "cosmic-only"]),
  
  duration_weeks: z.number()
    .int("Duration must be a whole number")
    .min(1, "Duration should be at least 2 weeks, but can be shorter for small tasks")
    .max(12, "Duration should be at most 12 weeks, please try to break larger tasks into smaller ones"),
  
  milestones: z.string()
    .min(10, "Milestones must be at least 10 characters")
    .max(2000, "Milestones must be less than 2000 characters"),
  
  effort_estimate: z.string()
    .min(1, "Effort estimate is required")
    .max(300, "Effort estimate must be less than 300 characters"),
  
  lead_name: z.string()
    .min(1, "Lead name is required")
    .max(100, "Lead name must be less than 100 characters"),
  
  lead_email: z.string()
    .email("Valid email is required")
    .max(100, "Email must be less than 100 characters"),
  
  // Change team_members to structured array of { name, email }
  team_members: z.array(z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().email("Valid email is required").max(100, "Email must be less than 100 characters").optional().or(z.literal(''))
  })).optional().default([]),
  
  focus_area: z.enum([
    "Research & Technology",
    "Demonstration Infrastructure",
    "Missions & Ecosystems",
    "Policy & Regulation",
    "Workforce Development"
  ]),
  
  dependencies: z.string()
    .max(500, "Dependencies must be less than 500 characters")
    .optional()
    .default("")
});

// Export type for TypeScript users (optional)
export const validStatuses = ['pending', 'approved', 'in-progress', 'completed', 'rejected'];

export const statusSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  newStatus: z.enum(validStatuses)
});

// Minimal schema for join requests (filename, name, optional email)
export const joinSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal(''))
});
