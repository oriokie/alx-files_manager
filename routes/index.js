// importing express module
const express = require('express');

// importing all countrollers
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const authenticateToken = require('../middlewares/auth');

// creating express router
const router = express.Router();

// handdling request using router
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', authenticateToken, UsersController.getMe);
router.post('/files', authenticateToken, FilesController.postUpload);
router.get('/files/:id', authenticateToken, FilesController.getShow);
router.get('/files', authenticateToken, FilesController.getIndex);
router.put('/files/:id/publish', authenticateToken, FilesController.putPublish);
router.put('/files/:id/unpublish', authenticateToken, FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

// importing router
module.exports = router;
