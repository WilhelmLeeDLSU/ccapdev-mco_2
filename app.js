const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    }
}));

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ccpapdev');

server.use(express.static('public'));

const User = require('./models/userModel');
const Post = require('./models/postModel');
const Community = require('./models/communityModel');
const Reply = require('./models/replyModel');

const controllers = ['mainRoutes', 'profileRoutes', 'loginRoutes'];

server.use( async(req, resp, next) => {
    const currentuser = req.query.currentuser || null;
    let userData = null;

    if (currentuser) {
        userData = await User.findOne({ username: currentuser }).lean();
    }

    resp.locals.currentuser = currentuser;
    resp.locals.isAuthenticated = !!currentuser;
    resp.locals.pfp = userData ? userData.pfp : "/common/defaultpfp.png";
    next();
});

controllers.forEach(controllerName => {
    const controller = require('./controllers/' + controllerName);
    controller.add(server);
});

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});