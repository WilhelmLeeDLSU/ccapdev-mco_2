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

var currentuser = 'BigGreenLegend'; //replace with current user!!!!

const User = require('./models/userModel');
const Post = require('./models/postModel');
const Community = require('./models/communityModel');
const Reply = require('./models/replyModel');
//main is homepage

//idea for profile: /profile/<username>
//idea for posts: /profile/<username>/post<postid> for the posts of a user

const controllers = ['mainRoutes', 'profileRoutes', 'loginRoutes'];

server.use((req, resp, next) => {
    req.currentuser = currentuser;
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