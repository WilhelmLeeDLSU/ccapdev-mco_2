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

//main is homepage
server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'Home',
        selNav: 'main'
    });
});

server.get('/explore', function(req, resp){
    resp.render('explore',{
        layout: 'index',
        title: 'Explore',
        selNav: 'explore'
    });
});

server.get('/newpost', function(req, resp){
    resp.render('newpost',{
        layout: 'index',
        title: 'New Post',
        selNav: 'newpost'
    });
});

server.get('/popular', function(req, resp){
    resp.render('popular',{
        layout: 'index',
        title: 'Popular',
        selNav: 'popular'
    });
});

//idea for profile: /profile would be the users own profile, while /profile/<username> when searching for others
//idea for posts: /profile/<username>/post<num> for the posts of a user
server.get('/profile', function(req, resp){
    resp.render('profile',{
        layout: 'index',
        title: 'My Profile',
        selNav: 'profile'
    });
});

//this one is for /profile/<username>
server.get('/profile/:user', function(req, resp){
    resp.render('profile',{
        layout: 'index',
        title: req.params.user + '\'s Profile',
        user: req.params.user,
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