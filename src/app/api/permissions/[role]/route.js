export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractAuth, requireSuperAdmin } from '@/lib/permissions';
import { SUPER_ADMIN_ROLE, PAGES } from '@/config/pages';

/**
 * GET /api/permissions/:role
 * Returns all page permissions for a specific role.
 * SUPER_ADMIN only.
 */
export async function GET(req, { params }) {
  const { valid, role: callerRole } = extractAuth(req);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guard = requireSuperAdmin(callerRole);
  if (!guard.authorized) return guard.response;

  const { role } = params;

  const { data, error } = await supabase
    .from('permissions')
    .select('page, can_read, can_write, can_delete')
    .eq('role', role);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ role, permissions: data ?? [] });
}

/**
 * PUT /api/permissions/:role
 * Bulk-update all pages for a role.
 * Body: { permissions: [{ page, can_read, can_write, can_delete }] }
 * SUPER_ADMIN only.
 */
export async function PUT(req, { params }) {
  const { valid, role: callerRole } = extractAuth(req);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guard = requireSuperAdmin(callerRole);
  if (!guard.authorized) return guard.response;

  const { role } = params;

  if (role === SUPER_ADMIN_ROLE) {
    return NextResponse.json({ error: 'Cannot set permissions for SUPER_ADMIN' }, { status: 400 });
  }

  const body = await req.json();
  const { permissions } = body; // array of { page, can_read, can_write, can_delete }

  if (!Array.isArray(permissions)) {
    return NextResponse.json({ error: 'permissions must be an array' }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Build upsert rows — ensure every page in PAGES registry is covered
  const upsertRows = PAGES.map((pg) => {
    const incoming = permissions.find((p) => p.page === pg.key) ?? {};
    return {
      role,
      page:       pg.key,
      can_read:   incoming.can_read   ?? false,
      can_write:  incoming.can_write  ?? false,
      can_delete: incoming.can_delete ?? false,
      updated_at: now,
    };
  });

  const { data, error } = await supabase
    .from('permissions')
    .upsert(upsertRows, { onConflict: 'role,page' })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ role, permissions: data });
}

/**
 * DELETE /api/permissions/:role
 * Removes all permission rows for a role.
 * SUPER_ADMIN only.
 */
export async function DELETE(req, { params }) {
  const { valid, role: callerRole } = extractAuth(req);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guard = requireSuperAdmin(callerRole);
  if (!guard.authorized) return guard.response;

  const { role } = params;

  if (role === SUPER_ADMIN_ROLE) {
    return NextResponse.json({ error: 'Cannot delete SUPER_ADMIN permissions' }, { status: 400 });
  }

  const { error } = await supabase.from('permissions').delete().eq('role', role);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: `Permissions for ${role} deleted` });
}
