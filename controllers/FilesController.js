const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

/**
 * @class FilesController to handle the files
 */
class FilesController {
  /**
   * psotUpload - function to handle the upload
   * @param {*} req request
   * @param {*} res response
   * @returns {Object} JSON response
   */
  static async postUpload(req, res) {
    // Check if the request contains the X-Token header
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the token is valid and retrieve the user ID
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // get the file data from the request
    const { name, type, parentId = '0', isPublic = false, data } = req.body;

    // Check if the request contains the name, type and data
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0') {
      const parentFile = await (await dbClient.filesCollection()).findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // construct new file object
    const newFile = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await (await dbClient.filesCollection()).insertOne(newFile);
      newFile.id = result.insertedId;
      return res.status(201).json(newFile);
    }

    // Handle file upload
    const fileUuid = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileUuid);

    // Ensure the directory exists
    await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

    // Write file content
    await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

    newFile.localPath = localPath;
    const result = await (await dbClient.filesCollection()).insertOne(newFile);
    newFile.id = result.insertedId;

    return res.status(201).json(newFile);
  }
}

module.exports = FilesController;
