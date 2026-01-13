import { NextResponse } from 'next/server';

// Public registration is disabled
// Users must be created by MASTER or ADMIN through /api/admin/users
export async function POST() {
  return NextResponse.json(
    { error: 'Public registration is disabled. Contact your administrator.' },
    { status: 403 }
  );
}
