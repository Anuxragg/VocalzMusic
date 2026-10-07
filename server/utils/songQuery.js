const parseBoundedInteger = (value, fallback, maximum) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return parsed >= 1 && parsed <= maximum ? parsed : null;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseSongListOptions = (query) => {
  const { q, genre, artist, sort = '-createdAt' } = query;
  const pageNumber = parseBoundedInteger(query.page, 1, 1000000);
  const pageLimit = parseBoundedInteger(query.limit, 10, 1000);
  const allowedSorts = ['-createdAt', 'createdAt', 'title', '-title', 'playCount', '-playCount'];

  if (!pageNumber || !pageLimit || typeof sort !== 'string' || !allowedSorts.includes(sort)) return null;

  for (const [value, maxLength] of [[q, 100], [genre, 50], [artist, 100]]) {
    if (value !== undefined && (typeof value !== 'string' || value.length > maxLength)) return null;
  }

  const filter = { isPublic: true };
  if (q) filter.$text = { $search: q };
  if (genre) filter.genre = new RegExp(`^${escapeRegex(genre)}$`, 'i');
  if (artist) filter.artist = new RegExp(escapeRegex(artist), 'i');

  return { filter, pageNumber, pageLimit, sort };
};

module.exports = { parseSongListOptions };
