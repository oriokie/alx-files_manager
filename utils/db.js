import { MongoClient } from 'mongodb';

/**
 * DBClient Class for MongoDB
 */
class DBClient {
  /**
   * Constructor for initializing the DBClient
   * uses env variables or defaults to localhost
   */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    // initialize the MongoClient
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // connect to the client
    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        this.db = this.client.db(database);
        this.filesCollection = this.db.collection('files');
        this.usersCollection = this.db.collection('users');
      }
    });
  }

  /**
   * checks if MongoDB client is connected
   * @returns {boolean} true if connected, false otherwise
   */
  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  /**
   * gets the No. of docs in users collection
   * @returns {Promise<number>} the No. of users
   */
  async nbUsers() {
    if (!this.db) {
      return 0;
    }
    try {
      return this.db.collection('users').countDocuments();
    } catch (err) {
      console.error('Error counting users: ', err);
      return 0;
    }
  }

  /**
   * gets the No. of docs in files collection
   * @returns {Promise<number>} the No. of files
   */
  async nbFiles() {
    if (!this.db) {
      return 0;
    }
    try {
      return this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Error counting files: ', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
