const moment = require('moment'); 
const { formatTimeDifference, buildPost } = require('../js/utils');

const Post = require('../models/postModel');
const User = require('../models/userModel');
const Community = require('../models/communityModel');

module.exports.add = (server) => {
    server.get('/', async function (req, resp) {
        try {
            const posts = await Post.find()
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
            
            const builtPosts = posts.map(post => buildPost(post));
    
            resp.render('main', {
                layout: 'index',
                title: 'Home',
                selNav: 'main',
                posts: builtPosts,
                currentuser: req.query.currentuser || null
            });
    
        } catch (error) {
            console.error("Error loading posts:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/explore', async function(req, resp){
        try {
            const posts = await Post.find()
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
            
            const builtPosts = posts.map(post => buildPost(post));
    
            resp.render('explore',{
                layout: 'index',
                title: 'Explore',
                selNav: 'explore',
                posts: builtPosts,
                currentuser: req.query.currentuser || null
            });
    
        } catch (error) {
            console.error("Error loading posts:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/newpost', function(req, resp){
        resp.render('newpost',{
            layout: 'index',
            title: 'New Post',
            selNav: 'newpost',
    
            currentuser: req.query.currentuser || null
        });
    });
    
    server.get('/popular', async function(req, resp){
        try {
            const posts = await Post.find({ upvotes: { $gte: 50 } })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();

            const builtPosts = posts.map(post => buildPost(post));
    
            resp.render('popular',{
                layout: 'index',
                title: 'Popular',
                selNav: 'popular',
                posts: builtPosts,
                currentuser: req.query.currentuser || null
            });
    
        } catch (error) {
            console.error("Error loading posts:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/community/:name', async function(req, resp) {
        const communityName = req.params.name;
    
        const community = await Community.findOne({ name: { $regex: new RegExp("^" + communityName + "$", "i") } }).lean();
        
        if (!community) {
            return resp.status(404).send("Community not found");
        }
    
        const posts = await Post.find({ community: community._id })
            .populate("author", "profileName username pfp")
            .populate("community", "name color")
            .lean();
            
        const builtPosts = posts.map(post => buildPost(post));
    
        resp.render('community', {
            layout: 'index',
            title: community.name,
            selNav: 'community',
            communityName: community.name,
            posts: builtPosts,
            currentuser: req.query.currentuser || null
        });

    });
}