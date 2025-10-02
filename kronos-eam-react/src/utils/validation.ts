import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/,
  'Invalid phone number'
);

export const requiredString = (fieldName: string) => 
  z.string().min(1, `${fieldName} is required`);

export const optionalString = () => z.string().optional();

export const numericString = () => 
  z.string().regex(/^\d+$/, 'Must be a number');

export const positiveNumber = () => 
  z.number().positive('Must be a positive number');

export const dateString = () => 
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

// Plant validation schemas
export const plantSchema = z.object({
  name: requiredString('Plant name'),
  code: requiredString('Plant code'),
  type: z.enum(['Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal']),
  status: z.enum(['In Operation', 'In Authorization', 'Under Construction', 'Decommissioned']),
  power_kw: positiveNumber(),
  location: requiredString('Location'),
  municipality: requiredString('Municipality'),
  province: requiredString('Province'),
  region: requiredString('Region'),
  operation_date: dateString().optional(),
  notes: optionalString()
});

// User validation schemas
export const userSchema = z.object({
  email: emailSchema,
  first_name: requiredString('First name'),
  last_name: requiredString('Last name'),
  role: z.enum(['Admin', 'Asset Manager', 'Plant Owner', 'Operator', 'Viewer']),
  phone: phoneSchema.optional(),
  is_active: z.boolean().default(true)
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: requiredString('Password').min(6, 'Password must be at least 6 characters')
});

// Document validation schema
export const documentSchema = z.object({
  title: requiredString('Document title'),
  category: z.enum(['Contract', 'Technical', 'Administrative', 'Compliance', 'Report', 'Other']),
  description: optionalString(),
  tags: z.array(z.string()).optional()
});

// Workflow validation schema
export const workflowSchema = z.object({
  name: requiredString('Workflow name'),
  description: optionalString(),
  priority: z.enum(['High', 'Medium', 'Low']),
  due_date: dateString().optional(),
  assigned_to: z.number().optional()
});

// Helper function to extract error messages
export const getFormErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      errors[err.path.join('.')] = err.message;
    }
  });
  return errors;
};