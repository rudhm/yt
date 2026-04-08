/**
 * Helper function to parse ISO 8601 duration to seconds
 * @param {string} duration ISO 8601 duration (e.g. PT1H2M3S)
 * @returns {number} duration in seconds
 */
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

module.exports = {
  parseDuration
};
