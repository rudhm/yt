const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { q, maxResults = 20 } = req.query;
    
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

    // Using videoDuration=medium to filter out most Shorts
    // Medium: 4-20 minutes, Long: >20 minutes
    // This excludes anything under 4 minutes which covers essentially all Shorts
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: q,
        type: 'video',
        videoDuration: 'medium', // Filters out Shorts (<4 min)
        maxResults: parseInt(maxResults),
        key: API_KEY
      }
    });

    console.log(`✓ Search successful: "${q}" - ${response.data.items?.length || 0} results`);

    res.json({
      query: q,
      totalResults: response.data.pageInfo?.totalResults || 0,
      resultsReturned: response.data.items?.length || 0,
      items: response.data.items || [],
      pageInfo: response.data.pageInfo,
      nextPageToken: response.data.nextPageToken
    });

  } catch (error) {
    console.error('Error fetching from YouTube API:', error.message);
    
    if (error.response) {
      // YouTube API error
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'YouTube API error';
      
      return res.status(status).json({ 
        error: message,
        code: error.response.data?.error?.code
      });
    }
    
    // Network or other error
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
        key: API_KEY
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
