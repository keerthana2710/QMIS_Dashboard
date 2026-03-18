export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractAuth, requireSuperAdmin } from '@/lib/permissions';
import { SUPER_ADMIN_ROLE } from '@/config/pages';

/**
 * GET /api/permissions
 *   - ?role=admin  → returns permissions for that role
 *   - (no param)   → SUPER_ADMIN only — returns all permissions grouped by role
 */
export async function GET(req) {
  const { valid, role: callerRole } = extractAuth(req);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetRole = searchParams.get('role');

  // Any authenticated user can fetch their own role's permissions
  if (targetRole) {
    // Non-super-admins can only fetch their own role
    if (callerRole !== SUPER_ADMIN_ROLE && callerRole !== targetRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('permissions')
      .select('page, can_read, can_write, can_delete')
      .eq('role', targetRole);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permissions: data ?? [] });
  }

  // No role param → return all permissions (SUPER_ADMIN only)
  const guard = requireSuperAdmin(callerRole);
  if (!guard.authorized) return guard.response;

  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('role')
    .order('page');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ permissions: data ?? [] });
}

/**
 * POST /api/permissions
 * Body: { role, page, can_read, can_write, can_delete }
 * SUPER_ADMIN only — upsert a single permission row.
 */
export async function POST(req) {
  const { valid, role: callerRole } = extractAuth(req);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guard = requireSuperAdmin(callerRole);
  if (!guard.authorized) return guard.response;

  const body = await req.json();
  const { role, page, can_read = false, can_write = false, can_delete = false } = body;

  if (!role || !page) {
    return NextResponse.json({ error: 'role and page are required' }, { status: 400 });
  }

  if (role === SUPER_ADMIN_ROLE) {
    return NextResponse.json({ error: 'Cannot set permissions for SUPER_ADMIN' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('permissions')
    .upsert(
      { role, page, can_read, can_write, can_delete, updated_at: new Date().toISOString() },
      { onConflict: 'role,page' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ permission: data }, { status: 200 });
}
