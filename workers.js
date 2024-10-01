const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');

async function generateThumbnail(filePath, width) {
  const thumbnail = await imageThumbnail(filePath, { width });
  const thumbnailPath = `${filePath}_${width}`;
  await fs.promises.writeFile(thumbnailPath, thumbnail);
}

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.filesCollection.findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  const filePath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager', file.localPath);

  await generateThumbnail(filePath, 500);
  await generateThumbnail(filePath, 250);
  await generateThumbnail(filePath, 100);
});
