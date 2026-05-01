import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { assertTrustedRequestOrigin, isInvalidRequestOriginError } from '@/lib/auth/request-guard';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin, isCmsBackendConfigured, recordAuditEvent } from '@/lib/cms/repository';
import type { MediaItemRole } from '@/types';

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
}

function getDefaultAltText(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function normalizeRole(input: unknown): MediaItemRole {
  switch (String(input || '').trim()) {
    case 'hero':
    case 'story-cover':
    case 'gallery':
      return String(input) as MediaItemRole;
    default:
      return 'general';
  }
}

function normalizeTags(input: unknown) {
  if (!Array.isArray(input)) {
    return [] as string[];
  }

  return input
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function POST(request: Request) {
  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return NextResponse.json(
        {
          error: 'Origin request tidak valid.',
        },
        { status: 403 },
      );
    }

    throw error;
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  if (!isCmsBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'Backend media belum dikonfigurasi.',
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: 'File upload tidak ditemukan.',
      },
      { status: 400 },
    );
  }

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return NextResponse.json(
      {
        error: 'Hanya gambar atau video yang diperbolehkan.',
      },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      {
        error: 'Ukuran file maksimal 10 MB.',
      },
      { status: 400 },
    );
  }

  const splitName = file.name.split('.');
  const fileExtension = splitName.length > 1 ? splitName.pop() : '';
  const fileBaseName = splitName.join('.') || file.name;
  const storagePath = `${new Date().getFullYear()}/${randomUUID()}-${sanitizeFileName(fileBaseName)}${fileExtension ? `.${fileExtension}` : ''}`;
  const arrayBuffer = await file.arrayBuffer();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from('media').upload(storagePath, Buffer.from(arrayBuffer), {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }

  await supabase.from('media_assets').upsert({
    storage_path: storagePath,
    alt_text: getDefaultAltText(file.name),
    role: 'general',
    tags: [],
  });

  await recordAuditEvent({
    eventType: 'media.upload',
    actorEmail: session.email,
    resourceType: 'media',
    resourceId: storagePath,
    detail: `Mengunggah aset media "${file.name}" ke ${storagePath}.`,
    metadata: {
      contentType: file.type,
      size: file.size,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}

export async function PATCH(request: Request) {
  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return NextResponse.json(
        {
          error: 'Origin request tidak valid.',
        },
        { status: 403 },
      );
    }

    throw error;
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  if (!isCmsBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'Backend media belum dikonfigurasi.',
      },
      { status: 503 },
    );
  }

  const payload = (await request.json()) as {
    storagePath?: unknown;
    altText?: unknown;
    role?: unknown;
    tags?: unknown;
    name?: unknown;
  };
  const storagePath = String(payload.storagePath || '').trim();
  const altText = String(payload.altText || '').trim();
  const role = normalizeRole(payload.role);
  const tags = normalizeTags(payload.tags);
  const name = String(payload.name || storagePath).trim();

  if (!storagePath) {
    return NextResponse.json(
      {
        error: 'Storage path tidak valid.',
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('media_assets').upsert({
    storage_path: storagePath,
    alt_text: altText,
    role,
    tags,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }

  await recordAuditEvent({
    eventType: 'media.update',
    actorEmail: session.email,
    resourceType: 'media',
    resourceId: storagePath,
    detail: `Memperbarui metadata aset media "${name}" (${storagePath}).`,
    metadata: {
      role,
      tagCount: tags.length,
      altText: altText || null,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}

export async function DELETE(request: Request) {
  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return NextResponse.json(
        {
          error: 'Origin request tidak valid.',
        },
        { status: 403 },
      );
    }

    throw error;
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  if (!isCmsBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'Backend media belum dikonfigurasi.',
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      {
        error: 'Path file tidak valid.',
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from('media').remove([path]);

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }

  await supabase.from('media_assets').delete().eq('storage_path', path);

  await recordAuditEvent({
    eventType: 'media.delete',
    actorEmail: session.email,
    resourceType: 'media',
    resourceId: path,
    detail: `Menghapus aset media ${path}.`,
  });

  return NextResponse.json({
    ok: true,
  });
}
