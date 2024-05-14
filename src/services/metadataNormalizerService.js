function normalize(metadata) {
  const normalized = {
    title: metadata.title || metadata.name || '',
    artist: metadata.artist || '',
    album: metadata.album || metadata.collection || '',
    year: metadata.year || metadata.releaseDate && metadata.releaseDate.substring(0, 4) || '',
    artwork: metadata.albumArt || metadata.artwork || metadata.image || '',
    lyrics: metadata.lyrics || '',
    genre: metadata.genre || (metadata.tags && metadata.tags.join(', ')) || '',
    // ... add any other fields necessary for normalization
  };

  return normalized;
}
