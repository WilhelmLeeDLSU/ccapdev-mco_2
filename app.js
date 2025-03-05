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

server.use(express.static('public'));

var currentuser = 'BigGreenLegend'; //replace with current user!!!!

//main is homepage
server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'Home',
        selNav: 'main',

        currentuser: currentuser
    });
});

server.get('/explore', function(req, resp){
    resp.render('explore',{
        layout: 'index',
        title: 'Explore',
        selNav: 'explore',

        currentuser: currentuser
    });
});

server.get('/newpost', function(req, resp){
    resp.render('newpost',{
        layout: 'index',
        title: 'New Post',
        selNav: 'newpost',

        currentuser: currentuser
    });
});

server.get('/popular', function(req, resp){
    resp.render('popular',{
        layout: 'index',
        title: 'Popular',
        selNav: 'popular',

        currentuser: currentuser
    });
});

//idea for profile: /profile/<username>
//idea for posts: /profile/<username>/post<postid> for the posts of a user

//edit profile
server.get('/editprofile', function(req, resp){
    resp.render('editprofile',{
        layout: 'index',
        title: 'Edit Profile',

        currentuser: currentuser
    });
});

//this one is for /profile/<username>
server.get('/profile/:username', function(req, resp){
    resp.render('profile',{
        layout: 'index',
        title: req.params.username + '\'s Profile',
        username: req.params.username,

        currentuser: currentuser
    });
});

//this one is for /profile/<username>/replies for replies of the profile
server.get('/profile/:username/replies', function(req, resp){
    resp.render('profileReplies',{
        layout: 'index',
        title: req.params.username + '\'s Replies',
        username: req.params.username,

        currentuser: currentuser 
    });
});

//this one is for /profile/<username>/post<postid>
server.get('/profile/:posteruser/post:postid', function(req, resp){
    resp.render('post',{
        layout: 'index',
        title: 'Title of Post', //replace with title of post
        username: req.params.posteruser, //username of poster
        postid: req.params.postid, 

        currentuser: currentuser
    });
});

//this one is for /profile/<username>/post<postid>
server.get('/profile/:posteruser/post:postid/edit', function(req, resp){
    resp.render('editpost',{
        layout: 'index',
        title: 'Editing Post',
        username: req.params.posteruser, //username of poster
        postid: req.params.postid, 

        currentuser: currentuser
    });
});

server.get('/login', function(req, resp){
    resp.render('login',{
        layout: 'index',
        title: 'Login',
    });
});

server.get('/register', function(req, resp){
    resp.render('register',{
        layout: 'index',
        title: 'Register', 
    });
});


const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});