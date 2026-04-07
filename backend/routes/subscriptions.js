const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { getUserOAuthToken } = require('./auth');

// Get user's subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const oauthToken = getUserOAuthToken(userId);

    if (!oauthToken) {
      return res.status(401).json({ 
        error: 'OAuth token expired',
        hint: 'Please sign in again'
      });
    }

    // Fetch subscriptions from YouTube API
    const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
      params: {
        part: 'snippet',
        mine: true,
        maxResults: 50,
        order: 'alphabetical'
      },
      headers: {
        'Authorization': `Bearer ${oauthToken}`
      }
    });

    const subscriptions = response.data.items.map(item => ({
      id: item.id,
      channelId: item.snippet.resourceId.channelId,
      channelTitle: item.snippet.title,
      channelThumbnail: item.snippet.thumbnails?.default?.url,
      description: item.snippet.description
    }));

    console.log(`✓ Fetched ${subscriptions.length} subscriptions for user ${req.user.email}`);

    res.json({
      subscriptions,
      totalResults: response.data.pageInfo?.totalResults || subscriptions.length
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'OAuth token expired',
        hint: 'Please sign in again'
      });
    }

    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Get subscription feed (latest videos from subscribed channels)
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { maxResults = 20 } = req.query;
    const userId = req.user.id;
    const oauthToken = getUserOAuthToken(userId);

    if (!oauthToken) {
      return res.status(401).json({ 
        error: 'OAuth token expired',
        hint: 'Please sign in again'
      });
    }

    // First, get user's subscribed channels
    const subsResponse = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
      params: {
        part: 'snippet',
        mine: true,
        maxResults: 50
      },
      headers: {
        'Authorization': `Bearer ${oauthToken}`
      }
    });

    const channelIds = subsResponse.data.items.map(
      item => item.snippet.resourceId.channelId
    );

    if (channelIds.length === 0) {
      return res.json({
        items: [],
        totalResults: 0,
        message: 'No subscriptions found'
      });
    }

    // Fetch latest videos from these channels
    // Use Activities API to get recent uploads
    const response = await axios.get('https://www.googleapis.com/youtube/v3/activities', {
      params: {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: parseInt(maxResults),
        publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
      },
      headers: {
        'Authorization': `Bearer ${oauthToken}`
      }
    });

    // Filter for video uploads and apply Shorts filter
    const videos = [];
    
    for (const item of response.data.items) {
      if (item.snippet.type === 'upload' && item.contentDetails?.upload?.videoId) {
        const videoId = item.contentDetails.upload.videoId;
        
        // Fetch video details to check duration
        const videoDetails = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails',
            id: videoId,
            key: process.env.YOUTUBE_API_KEY
          }
        });

        if (videoDetails.data.items.length > 0) {
          const video = videoDetails.data.items[0];
          const duration = video.contentDetails.duration;
          
          // Parse ISO 8601 duration and filter Shorts (<60 seconds)
          const seconds = parseDuration(duration);
          
          if (seconds >= 240) { // 4 minutes minimum (filters Shorts)
            videos.push({
              kind: 'youtube#searchResult',
              id: { videoId: video.id },
              snippet: video.snippet
            });
          }
        }
      }
    }

    console.log(`✓ Subscription feed: ${videos.length} videos (Shorts filtered)`);

    res.json({
      items: videos,
      totalResults: videos.length,
      filtered: 'Shorts removed (duration < 4 minutes)'
    });

  } catch (error) {
    console.error('Error fetching subscription feed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'OAuth token expired',
        hint: 'Please sign in again'
      });
    }

    res.status(500).json({ error: 'Failed to fetch subscription feed' });
  }
});

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

module.exports = router;
