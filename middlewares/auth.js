const redisClient = require('../utils/redis');

const authenticateToken = async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // If authentication is successful, attach the userId to the request object
  req.userId = userId;
  next();
};

module.exports = authenticateToken;
