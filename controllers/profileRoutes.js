const User = require('../models/userModel');

module.exports.add = (server) => {
    // URL: /profile/<username>
    server.get('/profile/:username', async function(req, resp){
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return resp.status(404).send("User not found");
        }
        
        resp.render('profile-posts',{
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            pfp: user.pfp,
            bio: user.bio,

            currentuser: req.query.currentuser || null
        });
    });

    // URL: /profile/<username>/replies for replies of the profile
    server.get('/profile/:username/replies', async function(req, resp){
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return resp.status(404).send("User not found");
        }
        
        resp.render('profile-replies',{
            layout: 'profileLayout',
            title: `${user.profileName} | Replies`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            pfp: user.pfp,
            bio: user.bio,

            currentuser: req.query.currentuser || null
        });
    });

    server.get('/profile/:username/upvotes', async function(req, resp){
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return resp.status(404).send("User not found");
        }
        
        resp.render('profile-upvotes',{
            layout: 'profileLayout',
            title: `${user.profileName} | Upvotes`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            pfp: user.pfp,
            bio: user.bio,

            currentuser: req.query.currentuser || null
        });
    });

    // URL: /profile/<username>/post<postid>
    server.get('/profile/:posteruser/post:postid', function(req, resp){
        resp.render('post',{
            layout: 'profileLayout',
            title: 'Title of Post', //replace with title of post
            username: req.params.posteruser, //username of poster
            postid: req.params.postid, 

            currentuser: req.query.currentuser || null
        });
    });

    // URL: /profile/<username>/post<postid>
    server.get('/profile/:posteruser/post:postid/edit', function(req, resp){
        resp.render('editpost',{
            layout: 'index',
            title: 'Editing Post',
            username: req.params.posteruser, //username of poster
            postid: req.params.postid, 

            currentuser: req.query.currentuser || null
        });
    });

    //edit profile
    server.get('/editprofile', function(req, resp){
        resp.render('editprofile',{
            layout: 'index',
            title: 'Edit Profile',

            currentuser: req.query.currentuser || null
        });
    });
}