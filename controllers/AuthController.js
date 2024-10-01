const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

exports.getConnect = async (req, res) => {
  const { authorization } = req.headers;
  const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64')
    .toString()
    .split(':');
  const user = await dbClient.client
    .db(dbClient.database)
    .collection('users')
    .findOne({ email, password: sha1(password) });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();
  await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);
  return res.status(200).json({ token });
};

exports.getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(`auth_${token}`);
  return res.status(204).end();
};
