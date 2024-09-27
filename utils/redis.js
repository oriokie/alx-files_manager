import redis from 'redis';
import { promisify } from 'util';

/**
 * RedisClient Class
 * provides asyncrounous methods (get, set, del)
 * Also checks if the client is connected to the server
 */
class RedisClient {
  /**
   * Constructor for initializing the RedisClient
   * Also sets up promisified methods
   */
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.log(`Redis client error: ${error}`);
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * A function that checks if the client is connected to the server
   * @returns {boolean} true if connected, false otherwise
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * A function that gets the value of a key from the Redis server
   * @param {string} key the key
   * @returns {string} the value of the key
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * A function that sets a key value pair in the Redis server
   * @param {string} key the key
   * @param {string} value the value
   * @param {number} duration the expiration time for the key
   * @returns {string} the value of the key
   */
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  /**
   * A function that deletes a key from the Redis server
   * @param {string} key the key
   */
  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
