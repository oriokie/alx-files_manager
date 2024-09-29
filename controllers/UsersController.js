const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { ObjectID } = require('mongodb');

exports.postNew = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const database = dbClient.client.db(dbClient.database);
    const collection = database.collection('users');

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user = await collection.findOne({ email: email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = await collection.insertOne({ email: email, password: hashedPassword });
    return res.status(201).json({ id: newUser.insertedId, email: email });
  } catch (error) {
    console.error(error);
  }
};

exports.getMe = async (req, res) => {
  const user = await dbClient.usersCollection.findOne({ _id: ObjectID(req.userId) });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(200).json({ id: user._id.toString(), email: user.email });
};
