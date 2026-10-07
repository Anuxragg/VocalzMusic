const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSongListOptions } = require('../utils/songQuery');

test('uses bounded defaults for song list requests', () => {
  const options = parseSongListOptions({});

  assert.equal(options.pageNumber, 1);
  assert.equal(options.pageLimit, 10);
  assert.equal(options.sort, '-createdAt');
});

test('rejects invalid pagination, sort, and oversized filters', () => {
  assert.equal(parseSongListOptions({ limit: '1001' }), null);
  assert.equal(parseSongListOptions({ page: '-1' }), null);
  assert.equal(parseSongListOptions({ sort: 'password' }), null);
  assert.equal(parseSongListOptions({ artist: 'a'.repeat(101) }), null);
});

test('treats regex syntax in filters as literal text', () => {
  const options = parseSongListOptions({ genre: 'rock.*', artist: 'A+B' });

  assert.equal(options.filter.genre.test('rock.*'), true);
  assert.equal(options.filter.genre.test('rockanything'), false);
  assert.equal(options.filter.artist.test('A+B'), true);
  assert.equal(options.filter.artist.test('AAAB'), false);
});
