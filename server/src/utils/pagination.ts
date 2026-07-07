export interface CursorObj {
  id: string;
  createdAt: string;
}

export function encodeCursor(obj: CursorObj): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorObj {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
  } catch {
    throw new Error('Invalid cursor');
  }
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

export function buildPaginatedResponse<T extends { id: string; created_at?: string; createdAt?: string }>(
  rows: T[],
  limit: number,
): PaginatedResult<T> {
  if (rows.length === 0) {
    return { data: [], nextCursor: null };
  }

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  const last = data[data.length - 1];
  const nextCursor = hasMore
    ? encodeCursor({ id: last.id, createdAt: last.created_at ?? last.createdAt ?? '' })
    : null;

  return { data, nextCursor };
}

export function buildCursorWhere(cursor?: string | null): { id?: string; createdAt?: string } | null {
  if (!cursor) return null;
  const decoded = decodeCursor(cursor);
  return { id: decoded.id, createdAt: decoded.createdAt };
}
