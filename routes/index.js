//importing express module
const express = require('express');

//importing all countrollers
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

//creating express router
const router = express.Router();

//handdling request using router
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

//importing router
module.exports = router;
