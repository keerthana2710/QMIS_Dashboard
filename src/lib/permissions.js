// Server-side permission utility for API route guards
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { SUPER_ADMIN_ROLE } from '@/config/pages';

/**
 * Extract and verify the JWT from an incoming Request.
 * Returns { valid, role, userId } or { valid: false }.
 */
export function extractAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return { valid: false };

  const { valid, decoded } = verifyToken(token);
  if (!valid || !decoded) return { valid: false };

  return { valid: true, role: decoded.role, userId: decoded.id };
}

/**
 * Check whether a given role has a specific action on a page.
 * SUPER_ADMIN always returns true.
 * Returns boolean.
 */
export async function checkPermission(role, page, action) {
  if (!role) return false;
  if (role === SUPER_ADMIN_ROLE) return true;

  const { data, error } = await supabase
    .from('permissions')
    .select('can_read, can_write, can_delete')
    .eq('role', role)
    .eq('page', page)
    .single();

  if (error || !data) return false;

  switch (action.toUpperCase()) {
    case 'READ':   return data.can_read   ?? false;
    case 'WRITE':  return data.can_write  ?? false;
    case 'DELETE': return data.can_delete ?? false;
    default:       return false;
  }
}

/**
 * Fetch all permission rows for a given role.
 * Returns array of { page, can_read, can_write, can_delete }.
 */
export async function getPermissionsForRole(role) {
  if (!role || role === SUPER_ADMIN_ROLE) return [];

  const { data, error } = await supabase
    .from('permissions')
    .select('page, can_read, can_write, can_delete')
    .eq('role', role);

  if (error) return [];
  return data ?? [];
}

/**
 * Require SUPER_ADMIN — returns { authorized: false, response } if not.
 * Use at the top of sensitive API route handlers.
 */
export function requireSuperAdmin(role) {
  if (role !== SUPER_ADMIN_ROLE) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { authorized: true };
}
