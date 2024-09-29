const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');

exports.postNew = async (req, res) => {
  try {
    const { email } = req.body;
    const { password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = await dbClient.usersCollection.insertOne({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: newUser.insertedId.toString(),
      email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // The userId is now available on the request object thanks to the middleware
    const getuserId = req.userId;

    const user = await dbClient.usersCollection.findOne({ _id: new ObjectId(getuserId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id.toString(), email: user.email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
