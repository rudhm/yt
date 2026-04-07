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

    console.log('🔄 Fetching subscription feed...');

    // Step 1: Get user's subscribed channels with contentDetails
    const subsResponse = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
      params: {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50
      },
      headers: {
        'Authorization': `Bearer ${oauthToken}`
      }
    });

    const subscriptions = subsResponse.data.items;
    console.log(`✓ Found ${subscriptions.length} subscribed channels`);

    if (subscriptions.length === 0) {
      return res.json({
        items: [],
        totalResults: 0,
        message: 'No subscriptions found'
      });
    }

    // Step 2: Get channel details to find their uploads playlist IDs
    const channelIds = subscriptions.map(sub => sub.snippet.resourceId.channelId);
    const channelsResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'contentDetails',
        id: channelIds.slice(0, 50).join(','), // Max 50 IDs per request
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const uploadsPlaylistIds = channelsResponse.data.items.map(
      channel => channel.contentDetails.relatedPlaylists.uploads
    );

    console.log(`✓ Retrieved ${uploadsPlaylistIds.length} uploads playlist IDs`);

    // Step 3: Fetch recent videos from each uploads playlist
    const allVideoIds = [];
    const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days

    for (const playlistId of uploadsPlaylistIds) {
      try {
        const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          params: {
            part: 'snippet,contentDetails',
            playlistId: playlistId,
            maxResults: 10, // Get ~10 recent videos per channel
            key: process.env.YOUTUBE_API_KEY
          }
        });

        // Filter by date and collect video IDs
        for (const item of playlistResponse.data.items || []) {
          const publishedAt = new Date(item.snippet.publishedAt);
          const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          
          if (publishedAt >= cutoffDate && item.contentDetails?.videoId) {
            allVideoIds.push(item.contentDetails.videoId);
          }
        }
      } catch (err) {
        console.error(`⚠️  Error fetching playlist ${playlistId}:`, err.message);
      }
    }

    console.log(`✓ Collected ${allVideoIds.length} videos from the last 30 days (before filtering)`);

    if (allVideoIds.length === 0) {
      return res.json({
        items: [],
        totalResults: 0,
        message: 'No recent videos found in the last 30 days'
      });
    }

    // Step 4: Fetch video details in batches (50 per request) to check duration
    const videos = [];
    const batchSize = 50;
    
    for (let i = 0; i < allVideoIds.length; i += batchSize) {
      const batch = allVideoIds.slice(i, i + batchSize);
      
      try {
        const videoDetails = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails',
            id: batch.join(','),
            key: process.env.YOUTUBE_API_KEY
          }
        });

        // Filter out Shorts (keep videos >= 4 minutes)
        for (const video of videoDetails.data.items || []) {
          const duration = video.contentDetails.duration;
          const seconds = parseDuration(duration);
          
          if (seconds >= 240) { // Keep videos 4 minutes or longer
            videos.push({
              kind: 'youtube#searchResult',
              id: { videoId: video.id },
              snippet: video.snippet
            });
          }
        }
      } catch (err) {
        console.error(`⚠️  Error fetching video details for batch:`, err.message);
      }
    }

    console.log(`✓ After Shorts filter: ${videos.length} videos (removed ${allVideoIds.length - videos.length} shorts)`);

    // Step 5: Sort by published date (newest first) and limit results
    videos.sort((a, b) => 
      new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

    const limitedVideos = videos.slice(0, parseInt(maxResults));
    console.log(`✓ Returning ${limitedVideos.length} videos to frontend`);

    res.json({
      items: limitedVideos,
      totalResults: limitedVideos.length,
      filtered: `Shorts removed (duration < 4 minutes). Showing latest from 30 days.`
    });

  } catch (error) {
    console.error('❌ Error fetching subscription feed:', error.response?.data || error.message);
    
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
