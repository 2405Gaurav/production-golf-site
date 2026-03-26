import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const scoreSchema = z.object({
  value: z.number().min(1).max(45),
  date: z.string().optional(),
});

export const charitySchema = z.object({
  name: z.string().min(1, 'Charity name is required'),
  description: z.string().min(1, 'Description is required'),
});

export const userCharitySchema = z.object({
  charityId: z.string(),
  percentage: z.number().min(10).max(100),
});