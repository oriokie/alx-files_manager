const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dbClient = require('../utils/db');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

/**
 * Helper function to get file by ID and User ID
 */
const findFileByIdAndUser = async (fileId, userId) => {
  const file = await dbClient.filesCollection.findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  return file;
};

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
      const parentFile = await dbClient.filesCollection.findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // construct new file object
    const newFile = {
      userId: ObjectId(req.userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await dbClient.filesCollection.insertOne(newFile);
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
    const result = await dbClient.filesCollection.insertOne(newFile);
    newFile.id = result.insertedId;

    return res.status(201).json(newFile);
  }

  /**
   * getShow - function to handle the show
   * @param {*} req request
   * @param {*} res response
   * @returns {Object} JSON response
   */
  static async getShow(req, res) {
    const fileId = req.params.id;
    const file = await findFileByIdAndUser(fileId, req.userId);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  }

  /**
   * getIndex - function to handle the index
   * Lists all files for a specific parentId with pagination
   * @param {*} req request
   * @param {*} res response
   * @returns {Object} JSON response
   */
  static async getIndex(req, res) {
    const parentId = req.query.parentId || '0';
    const page = req.query.page || 0;
    const limit = req.query.limit || 20;

    const query = {
      parentId: parentId === '0' ? '0' : ObjectId(parentId),
      userId: ObjectId(req.userId),
    };

    const files = await dbClient.filesCollection
      .aggregate([{ $match: query }, { $skip: page * limit }, { $limit: limit }])
      .toArray();

    return res.status(200).json(files);
  }

  /**
   * putPublish - function to handle the publish
   * Sets isPublic to true for a file
   * @param {*} req request
   * @param {*} res response
   * @returns {Object} JSON response
   */
  static async putPublish(req, res) {
    const fileId = req.params.id;
    const file = await findFileByIdAndUser(fileId, req.userId);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.filesCollection.updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });
    const updatedFile = await dbClient.filesCollection.findOne({ _id: ObjectId(fileId) });
    return res.status(200).json(updatedFile);
  }

  /**
   * putPublish - function to handle the publish
   * Sets isPublic to true for a file
   * @param {*} req request
   * @param {*} res response
   * @returns {Object} JSON response
   */
  static async putUnpublish(req, res) {
    const fileId = req.params.id;
    const file = await findFileByIdAndUser(fileId, req.userId);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.filesCollection.updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });
    const updatedFile = await dbClient.filesCollection.findOne({ _id: ObjectId(fileId) });
    return res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    const user = await getUserFromXToken(req);
    const { id } = req.params;
    const size = req.query.size || null;
    const userId = user ? user._id.toString() : '';
    const fileFilter = {
      _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
    };
    const file = await (await dbClient.filesCollection())
      .findOne(fileFilter);

    if (!file || (!file.isPublic && (file.userId.toString() !== userId))) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (file.type === VALID_FILE_TYPES.folder) {
      res.status(400).json({ error: 'A folder doesn\'t have content' });
      return;
    }
    let filePath = file.localPath;
    if (size) {
      filePath = `${file.localPath}_${size}`;
    }
    if (existsSync(filePath)) {
      const fileInfo = await statAsync(filePath);
      if (!fileInfo.isFile()) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    } else {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const absoluteFilePath = await realpathAsync(filePath);
    res.setHeader('Content-Type', contentType(file.name) || 'text/plain; charset=utf-8');
    res.status(200).sendFile(absoluteFilePath);
  }
}



module.exports = FilesController;
