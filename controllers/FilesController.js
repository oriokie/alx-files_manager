const path = require('path');
const { ObjectID } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

exports.postUpload = async (req, res) => {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectID(userId) });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    name, type, parentId, isPublic, data,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (!type) {
    return res.status(400).json({ error: 'Missing type' });
  }
  // eslint-disable-next-line no-undef
  if (!data && type !== folder) {
    return res.status(400).json({ error: 'Missing data' });
  }
  if (parentId) {
    const parent = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: ObjectID(parentId) });
    if (!parent) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    if (parent.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }
  }

  const fileData = {
    userId: user._id,
    name,
    type,
    parentId: parentId || 0,
    isPublic: isPublic || false,
  };

  if (type !== 'folder') {
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, uuidv4());
    fs.writeFileSync(filePath, data, 'base64');
    fileData.localPath = filePath;
  }

  const file = await dbClient.client.db(dbClient.database).collection('files').insertOne(fileData);
  return res.status(201).json({ id: file.insertedId, ...fileData });
};
