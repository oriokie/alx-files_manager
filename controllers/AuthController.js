const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

/**
 * AuthController class to handle the authentication
 */
class AuthController {
  /**
   * getConnect - function to handle the connection
   * @param {Object} req - request
   * @param {Object} res - response
   * @return {Object} - JSON response
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    // check if the header contains the Basic Auth Credentials
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // get the base64 encoded credentials
    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    // check for th user in the database
    const user = await dbClient.client
      .db(dbClient.database)
      .collection('users')
      .findOne({ email, password: sha1(password) });

    // check if the user exists
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // create a new token for the user session
    const token = uuidv4();
    const key = `auth_${token}`;

    // store the token in the Redis server with 24 hours expiration
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60);

    // return the token
    return res.status(200).json({ token });
  }

  /**
   * getDisconnect - function to handle the disconnection
   * @param {Object} req - request
   * @param {Object} res - response
   * @return {Object} - JSON response
   */
  static async getDisconnect(req, res) {
    const token = req.get('X-Token');

    // check if the token exists
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // delete the token from the Redis server
    await redisClient.del(`auth_${token}`);

    // return the response
    return res.status(204).send();
  }
}

module.exports = AuthController;
