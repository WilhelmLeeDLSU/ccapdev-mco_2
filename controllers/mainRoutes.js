
module.exports.add = (server) => {
    server.get('/', function(req, resp){
        resp.render('main',{
            layout: 'index',
            title: 'Home',
            selNav: 'main',
    
            currentuser: req.currentuser
        });
    });

    server.get('/explore', function(req, resp){
        resp.render('explore',{
            layout: 'index',
            title: 'Explore',
            selNav: 'explore',
    
            currentuser: req.currentuser
        });
    });

    server.get('/newpost', function(req, resp){
        resp.render('newpost',{
            layout: 'index',
            title: 'New Post',
            selNav: 'newpost',
    
            currentuser: req.currentuser
        });
    });
    
    server.get('/popular', function(req, resp){
        resp.render('popular',{
            layout: 'index',
            title: 'Popular',
            selNav: 'popular',

            currentuser: req.currentuser
        });
    });
}