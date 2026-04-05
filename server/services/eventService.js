const Event = require('../models/Event');

/**
 * Log a system event for analytics.
 * @param {string} type - Event type (SIGNUP, JOB_POST, etc.)
 * @param {string} userId - ID of the user triggering the event
 * @param {object} metadata - Optional extra data
 */
exports.logEvent = async (type, userId = null, metadata = {}) => {
    try {
        const event = new Event({ type, userId, metadata });
        await event.save();
        console.log(`[Analytics] ${type} for user: ${userId}`);
    } catch (err) {
        console.error('[Analytics Error]', err);
        // We don't want to fail the main transaction if analytics fail
    }
};
