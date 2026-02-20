/**
 * Diamond Sports API Client
 *
 * HTTP client for Diamond Sports API with:
 * - Dual URL "first response wins" pattern (both URLs called simultaneously)
 * - Keep-alive connections for optimal performance
 * - Request timeout handling
 * - POST support for specific endpoints
 *
 * @module utils/diamondClient
 */

const got = require('got');
const http = require('http');
const https = require('https');

// Configuration from environment
// Remove trailing slashes from URLs to avoid double-slash issues
const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';

const config = {
  baseUrl: normalizeUrl(process.env.SPORTS_BASE_URL) || 'http://cloud.turnkeyxgaming.com:8086',
  secondUrl: normalizeUrl(process.env.SPORTS_SECOND_URL) || 'http://local.turnkeyxgaming.com:8087',
  apiKey: process.env.SPORTS_API_KEY || '',
  timeout: parseInt(process.env.DIAMOND_REQUEST_TIMEOUT) || 2000,
  postTimeout: parseInt(process.env.DIAMOND_POST_TIMEOUT) || 4000,
  enabled: process.env.DIAMOND_API_ENABLED === 'true',
};

// Keep-Alive Agents for connection reuse
const agent = {
  http: new http.Agent({
    keepAlive: true,
    maxSockets: 100,
  }),
  https: new https.Agent({
    keepAlive: true,
    maxSockets: 100,
  }),
};

// Startup validation
if (!config.apiKey) {
  console.warn('[Diamond] WARNING: SPORTS_API_KEY is not configured! API requests will fail.');
  console.warn('[Diamond] Add SPORTS_API_KEY=your-api-key to your .env file');
}

if (config.enabled) {
  console.log('[Diamond] Diamond Sports API enabled');
  console.log('[Diamond] Primary URL:', config.baseUrl);
  console.log('[Diamond] Secondary URL:', config.secondUrl);
}

/**
 * Make a GET request to a specific base URL
 * @param {string} baseUrl - Base URL to use
 * @param {string} endpoint - API endpoint
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Object>} API response body
 */
const makeRequest = (baseUrl, endpoint, signal) => {
  return got(baseUrl + endpoint, {
    method: 'GET',
    agent,
    signal,
    headers: {
      'x-turnkeyxgaming-key': config.apiKey,
      'accept': 'application/json',
      'accept-encoding': 'gzip',
    },
    responseType: 'json',
    timeout: {
      response: config.timeout,
    },
    retry: { limit: 0 },
    throwHttpErrors: true,
  }).then((res) => res.body);
};

/**
 * Make a POST request to a specific base URL
 * @param {string} baseUrl - Base URL to use
 * @param {string} endpoint - API endpoint
 * @param {Object} payload - Request body
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Object>} API response body
 */
const makePostRequest = (baseUrl, endpoint, payload, signal) => {
  return got(baseUrl + endpoint, {
    method: 'POST',
    agent,
    signal,
    headers: {
      'x-turnkeyxgaming-key': config.apiKey,
      'accept': 'application/json',
      'content-type': 'application/json',
      'accept-encoding': 'gzip',
    },
    json: payload,
    responseType: 'json',
    timeout: {
      response: config.postTimeout,
    },
    retry: { limit: 0 },
    throwHttpErrors: false,
  }).then((res) => {
    // Return body for any response with JSON (including 404 "no market found")
    if (res.statusCode >= 200 && res.statusCode < 500) {
      return res.body;
    }
    // Only throw on server errors (5xx) or unexpected statuses
    const err = new Error(`Response code ${res.statusCode}`);
    err.statusCode = res.statusCode;
    err.body = res.body;
    throw err;
  });
};

/**
 * Fetch data from Diamond API using "first response wins" pattern
 * Both URLs are called simultaneously, first successful response is returned
 *
 * @param {string} endpoint - API endpoint (e.g., '/sports/esid?sid=4')
 * @returns {Promise<Object>} API response data
 */
const fetchSportsData = async (endpoint) => {
  if (!config.enabled) {
    console.warn('[Diamond] API is disabled. Enable with DIAMOND_API_ENABLED=true');
    return null;
  }

  const controller1 = new AbortController();
  const controller2 = new AbortController();

  return new Promise((resolve, reject) => {
    let finished = false;
    let errors = 0;

    const success = (data) => {
      if (finished) return;
      finished = true;

      // Cancel the other request
      controller1.abort();
      controller2.abort();

      resolve(data);
    };

    const failure = (err) => {
      errors++;
      if (errors === 2 && !finished) {
        console.error(`[Diamond] Both URLs failed for ${endpoint}:`, err.message);
        reject(err);
      }
    };

    // Call BOTH URLs at the same time - first response wins
    makeRequest(config.baseUrl, endpoint, controller1.signal)
      .then(success)
      .catch(failure);

    makeRequest(config.secondUrl, endpoint, controller2.signal)
      .then(success)
      .catch(failure);
  });
};

/**
 * POST data to Diamond API using "first response wins" pattern
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} payload - Request body
 * @returns {Promise<Object>} API response data
 */
const postSportsData = async (endpoint, payload) => {
  if (!config.enabled) {
    console.warn('[Diamond] API is disabled. Enable with DIAMOND_API_ENABLED=true');
    return null;
  }

  const controller1 = new AbortController();
  const controller2 = new AbortController();

  return new Promise((resolve, reject) => {
    let finished = false;
    let errors = 0;

    const success = (data) => {
      if (finished) return;
      finished = true;

      controller1.abort();
      controller2.abort();

      resolve(data);
    };

    const failure = (err) => {
      errors++;
      if (errors === 2 && !finished) {
        console.error(`[Diamond] Both URLs failed for POST ${endpoint}:`, err.message);
        reject(err);
      }
    };

    makePostRequest(config.baseUrl, endpoint, payload, controller1.signal)
      .then(success)
      .catch(failure);

    makePostRequest(config.secondUrl, endpoint, payload, controller2.signal)
      .then(success)
      .catch(failure);
  });
};

// ============================================
// HIGH-LEVEL API METHODS
// ============================================

/**
 * Get all events for a sport
 * @param {number} sportId - Sport ID (4=Cricket, 1=Soccer, 2=Tennis)
 * @returns {Promise<Array>} Array of events
 */
const getEventsBySport = async (sportId) => {
  try {
    const response = await fetchSportsData(`/sports/esid?sid=${sportId}`);
    const allEvents = response?.data || [];

    // Handle both array and object responses
    const eventsArray = Array.isArray(allEvents) ? allEvents : Object.values(allEvents);

    // Flatten and filter out virtual/test events
    const filteredEvents = eventsArray
      .flat()
      .filter(
        (item) =>
          item?.cname !== 0 &&
          !/virtual|xi\b|t5\b|t10\b/i.test(item?.cname || '')
      );

    return filteredEvents;
  } catch (err) {
    console.error(`[Diamond] Failed to get events for sport ${sportId}:`, err.message);
    return [];
  }
};

/**
 * Get odds/market data for a specific match
 * @param {string} gmid - Game/Match ID
 * @param {number} sportId - Sport ID
 * @returns {Promise<Array>} Array of market data
 */
const getMatchOdds = async (gmid, sportId) => {
  try {
    const response = await fetchSportsData(`/sports/getPriveteData?gmid=${gmid}&sid=${sportId}`);
    return response?.data || [];
  } catch (err) {
    console.error(`[Diamond] Failed to get odds for match ${gmid}:`, err.message);
    return [];
  }
};

/**
 * Get TV URL for a match
 * @param {string} gmid - Game/Match ID
 * @returns {Promise<string|null>} TV URL or null
 */
const getTvUrl = async (gmid) => {
  try {
    const response = await fetchSportsData(`/tv_url?gmid=${gmid}`);
    return response?.data?.url || response?.url || null;
  } catch (err) {
    console.error(`[Diamond] Failed to get TV URL for ${gmid}:`, err.message);
    return null;
  }
};

/**
 * Get score data for a match (legacy endpoint - returns HTML)
 * @param {string} gmid - Game/Match ID
 * @returns {Promise<Object|null>} Score data or null
 */
const getScore = async (gmid) => {
  try {
    const response = await fetchSportsData(`/score?gmid=${gmid}`);
    return response?.data || null;
  } catch (err) {
    console.error(`[Diamond] Failed to get score for ${gmid}:`, err.message);
    return null;
  }
};

/**
 * Get score and TV URLs for a match using the betfairscorecardandtv endpoint
 * This is the preferred method for getting scorecard and TV URLs
 * @param {string} gmid - Game/Match ID (Diamond event ID)
 * @param {number|string} sportId - Sport ID (1=Soccer, 2=Tennis, 4=Cricket)
 * @returns {Promise<Object|null>} Object with scoreUrl and tvUrl, or null
 */
const getScoreAndTv = async (gmid, sportId = 4) => {
  try {
    const endpoint = `/sports/betfairscorecardandtv?diamondeventid=${gmid}&diamondsportsid=${sportId}`;
    const response = await fetchSportsData(endpoint);

    if (response?.status === true && response?.data) {
      return {
        scoreUrl: response.data.diamond_score_one || null,
        tvUrl: response.data.diamond_tv_one || null,
      };
    }
    return null;
  } catch (err) {
    console.error(`[Diamond] Failed to get score/TV for ${gmid}:`, err.message);
    return null;
  }
};

/**
 * Check if Diamond API is enabled and configured
 * @returns {Object} Status object
 */
const getStatus = () => {
  return {
    enabled: config.enabled,
    hasApiKey: !!config.apiKey,
    primaryUrl: config.baseUrl,
    secondaryUrl: config.secondUrl,
    timeout: config.timeout,
    postTimeout: config.postTimeout,
  };
};

module.exports = {
  // Core methods
  fetchSportsData,
  postSportsData,

  // High-level API methods
  getEventsBySport,
  getMatchOdds,
  getTvUrl,
  getScore,
  getScoreAndTv,

  // Status
  getStatus,
  isEnabled: () => config.enabled,

  // Configuration
  config,
};
