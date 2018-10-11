const tokenMiddleware = require('../middlewares/token.js');
const router = require('koa-router')({
    prefix: '/weapp'
});
const controllers = require('../controllers');

const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud');

router.get('/login', authorizationMiddleware, controllers.login);

// User actions
router.post('/user/auth', controllers.user.addUser);
router.get('/user/profile', tokenMiddleware, controllers.user.getProfile);
router.get('/user', tokenMiddleware, controllers.user.getById) ;

// Event actions
router.get('/event/getListByOpenId', tokenMiddleware, controllers.event.getListByOpenId);
router.post('/event/addEvent', tokenMiddleware, controllers.event.addEvent);
router.post('/event/updateEvent', tokenMiddleware, controllers.event.updateEvent);
router.get('/event', tokenMiddleware, controllers.event.viewEvent);
router.post('/event/acceptInvite', tokenMiddleware, controllers.event.acceptInvite);
router.get('/event/getInvites', tokenMiddleware, controllers.event.getInvites);
router.post('/event/deleteEvent', tokenMiddleware, controllers.event.deleteEvent);
// End event actions

module.exports = router;
