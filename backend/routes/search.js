const express = require('express');
const router = express.Router();
const axios = require('axios');
const { parseDuration } = require('../utils/youtube');

router.get('/', async (req, res) => {
  try {
    const { q, maxResults = 20, pageToken } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY || API_KEY === 'your_google_api_key_here') {
      return res.status(500).json({ 
        error: 'YouTube API key not configured',
        hint: 'Set YOUTUBE_API_KEY in .env file'
      });
    }

    // We fetch more results than requested because we will filter out Shorts
    // search.list doesn't provide duration, so we fetch details afterwards
    const params = {
      part: 'snippet',
      q: q,
      type: 'video',
      maxResults: Math.min(50, parseInt(maxResults) * 2), // Fetch more to allow filtering
      key: API_KEY,
      fields: 'items(id(videoId),snippet(title,thumbnails,publishedAt,channelTitle)),nextPageToken'
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params
    });

    const searchItems = searchResponse.data.items || [];
    if (searchItems.length === 0) {
      return res.json({
        query: q,
        items: [],
        nextPageToken: searchResponse.data.nextPageToken
      });
    }

    // Get durations for filtering
    const videoIds = searchItems.map(item => item.id.videoId);
    const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: videoIds.join(','),
        key: API_KEY,
        fields: 'items(id,contentDetails(duration))'
      }
    });

    const durationsMap = {};
    videosResponse.data.items.forEach(v => {
      durationsMap[v.id] = parseDuration(v.contentDetails.duration);
    });

    // Filter results: No Shorts (>= 240 seconds / 4 minutes)
    const filteredItems = searchItems
      .filter(item => {
        const duration = durationsMap[item.id.videoId];
        return duration >= 240; // 4 minutes
      })
      .slice(0, parseInt(maxResults));

    console.log(`✓ Search successful: "${q}" - Found ${filteredItems.length} videos (after filtering ${searchItems.length - filteredItems.length} shorts)`);

    res.json({
      query: q,
      items: filteredItems,
      nextPageToken: searchResponse.data.nextPageToken,
      filtered: `Shorts removed (duration < 4 minutes).`
    });

  } catch (error) {
    console.error('Error fetching from YouTube API:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'YouTube API error';
      return res.status(status).json({ error: message });
    }
    
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Optional: Endpoint for long videos only (>20 minutes)
router.get('/long', async (req, res) => {
  try {
    const { q, maxResults = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: q,
        type: 'video',
        videoDuration: 'long', // Only videos >20 minutes
        maxResults: parseInt(maxResults),
        key: API_KEY,
        fields: 'items(id(videoId),snippet(title,thumbnails,publishedAt,channelTitle)),pageInfo,nextPageToken'
      }
    });

    console.log(`✓ Long videos search: "${q}" - ${response.data.items?.length || 0} results`);

    res.json({
      query: q,
      filter: 'long (>20 minutes)',
      totalResults: response.data.pageInfo?.totalResults || 0,
      resultsReturned: response.data.items?.length || 0,
      items: response.data.items || [],
      pageInfo: response.data.pageInfo,
      nextPageToken: response.data.nextPageToken
    });

  } catch (error) {
    console.error('Error fetching long videos:', error.message);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

module.exports = router;
