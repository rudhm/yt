const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');
const { authenticateToken } = require('../middleware/auth');
const { getUserOAuthToken } = require('./auth');

// In-memory cache: 15 minutes TTL (900 seconds)
const feedCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

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

    // Fetch subscriptions from YouTube API (with field filtering)
    const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
      params: {
        part: 'snippet',
        mine: true,
        maxResults: 50,
        order: 'alphabetical',
        fields: 'items(id,snippet(title,description,resourceId(channelId),thumbnails(default))),pageInfo'
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
    const { maxResults = 20, pageToken } = req.query;
    const userId = req.user.id;
    const oauthToken = getUserOAuthToken(userId);

    if (!oauthToken) {
      return res.status(401).json({ 
        error: 'OAuth token expired',
        hint: 'Please sign in again'
      });
    }

    // Check cache first (per user)
    const cacheKey = `feed_${userId}`;
    const cachedFeed = feedCache.get(cacheKey);
    
    if (cachedFeed) {
      console.log(`✓ Returning cached feed for user ${userId} (${cachedFeed.items.length} videos)`);
      return res.json(cachedFeed);
    }

    console.log('🔄 Fetching fresh subscription feed...');

    // Step 1: Get user's subscribed channels (with field filtering)
    const subsResponse = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
      params: {
        part: 'snippet',
        mine: true,
        maxResults: 50,
        fields: 'items(snippet(resourceId(channelId)))'
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

    // Step 2: Get channel details to find their uploads playlist IDs (with field filtering)
    const channelIds = subscriptions.map(sub => sub.snippet.resourceId.channelId);
    const channelsResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'contentDetails',
        id: channelIds.slice(0, 50).join(','),
        key: process.env.YOUTUBE_API_KEY,
        fields: 'items(contentDetails(relatedPlaylists(uploads)))'
      }
    });

    const uploadsPlaylistIds = channelsResponse.data.items.map(
      channel => channel.contentDetails.relatedPlaylists.uploads
    );

    console.log(`✓ Retrieved ${uploadsPlaylistIds.length} uploads playlist IDs`);

    // Step 3: Fetch recent videos from ALL playlists in PARALLEL (Promise.all)
    const allVideoIds = [];
    
    const playlistPromises = uploadsPlaylistIds.map(playlistId => 
      axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'contentDetails',
          playlistId: playlistId,
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
          fields: 'items(contentDetails(videoId,videoPublishedAt))'
        }
      }).catch(err => {
        console.error(`⚠️  Error fetching playlist ${playlistId}:`, err.message);
        return { data: { items: [] } };
      })
    );

    const playlistResults = await Promise.all(playlistPromises);
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Collect video IDs from all playlist results
    for (const response of playlistResults) {
      for (const item of response.data.items || []) {
        const publishedAt = new Date(item.contentDetails?.videoPublishedAt);
        
        if (publishedAt >= cutoffDate && item.contentDetails?.videoId) {
          allVideoIds.push(item.contentDetails.videoId);
        }
      }
    }

    console.log(`✓ Collected ${allVideoIds.length} videos from the last 30 days (before filtering)`);

    if (allVideoIds.length === 0) {
      const emptyResult = {
        items: [],
        totalResults: 0,
        message: 'No recent videos found in the last 30 days'
      };
      feedCache.set(cacheKey, emptyResult);
      return res.json(emptyResult);
    }

    // Step 4: Fetch video details in PARALLEL batches (with field filtering)
    const videos = [];
    const batchSize = 50;
    const batchPromises = [];
    
    for (let i = 0; i < allVideoIds.length; i += batchSize) {
      const batch = allVideoIds.slice(i, i + batchSize);
      
      batchPromises.push(
        axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails',
            id: batch.join(','),
            key: process.env.YOUTUBE_API_KEY,
            fields: 'items(id,snippet(title,thumbnails,publishedAt,channelTitle),contentDetails(duration))'
          }
        }).catch(err => {
          console.error(`⚠️  Error fetching video batch:`, err.message);
          return { data: { items: [] } };
        })
      );
    }

    const batchResults = await Promise.all(batchPromises);

    // Filter out Shorts (keep videos >= 4 minutes)
    for (const response of batchResults) {
      for (const video of response.data.items || []) {
        const duration = video.contentDetails.duration;
        const seconds = parseDuration(duration);
        
        if (seconds >= 240) {
          videos.push({
            kind: 'youtube#searchResult',
            id: { videoId: video.id },
            snippet: video.snippet
          });
        }
      }
    }

    console.log(`✓ After Shorts filter: ${videos.length} videos (removed ${allVideoIds.length - videos.length} shorts)`);

    // Step 5: Sort by published date (newest first) and limit results
    videos.sort((a, b) => 
      new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

    const limitedVideos = videos.slice(0, parseInt(maxResults));
    console.log(`✓ Returning ${limitedVideos.length} videos to frontend`);

    const result = {
      items: limitedVideos,
      totalResults: limitedVideos.length,
      filtered: `Shorts removed (duration < 4 minutes). Showing latest from 30 days.`,
      cached: false
    };

    // Cache the result for 15 minutes
    feedCache.set(cacheKey, result);

    res.json(result);

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
