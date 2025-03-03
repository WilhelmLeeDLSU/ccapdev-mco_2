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

server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'Home Page',
        selNav: 'main'
    });
});

server.get('/explore', function(req, resp){
    resp.render('explore',{
        layout: 'index',
        title: 'Explore Page',
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


const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});