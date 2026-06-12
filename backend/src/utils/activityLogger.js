const ActivityLog = require('../models/ActivityLog');

const logActivity = async (action, description, req = null) => {
  try {
    const logData = {
      action,
      description,
    };
    if (req && req.user) {
      logData.performedBy = req.user._id;
      logData.performedByName = req.user.name;
    } else {
      logData.performedByName = 'System';
    }
    await ActivityLog.create(logData);
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
};

module.exports = logActivity;
