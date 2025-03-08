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
                .populate("community", "name color ")
                .lean();
            
            const builtPosts = posts.map(post => buildPost(post));

            const communities = await Community.find().lean();
    
            resp.render('main', {
                layout: 'index',
                title: 'Home',
                selNav: 'main',
                posts: builtPosts,
                communities: communities,
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

            const communities = await Community.find().lean();
    
            resp.render('explore',{
                layout: 'index',
                title: 'Explore',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                currentuser: req.query.currentuser || null
            });
    
        } catch (error) {
            console.error("Error loading posts:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/explore/results', async function(req, resp) {
        try {
            const searchQuery = req.query.searchBar || ""; 
            const selectedCommunity = req.query.community || "";
            const currentUser = req.query.currentuser || null;
    
            let filter = {};
    
            if (searchQuery) {
                filter.$or = [
                    { title: { $regex: searchQuery, $options: "i" } },
                    { content: { $regex: searchQuery, $options: "i" } }
                ];
            }
    
            if (selectedCommunity) {
                const community = await Community.findOne({ name: selectedCommunity }).lean();
                if (community) {
                    filter.community = community._id;
                }
            }
    
            const posts = await Post.find(filter)
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
    
            const communities = await Community.find().lean();

            const builtPosts = posts.map(post => buildPost(post));
    
            resp.render('explore-results', { 
                layout: 'index',
                title: 'Search Results',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                currentuser: currentUser,
                query: req.query
            });
    
        } catch (error) {
            console.error("Error loading search results:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/explore/results', async function(req, resp) {
        try {
            const searchQuery = req.query.searchBar || ""; 
            const selectedCommunity = req.query.community || "";
            const currentUser = req.query.currentuser || null;
    
            let filter = {};
    
            if (searchQuery) {
                filter.$or = [
                    { title: { $regex: searchQuery, $options: "i" } },
                    { content: { $regex: searchQuery, $options: "i" } }
                ];
            }
    
            if (selectedCommunity) {
                const community = await Community.findOne({ name: selectedCommunity }).lean();
                if (community) {
                    filter.community = community._id;
                }
            }
    
            const posts = await Post.find(filter)
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
    
            const communities = await Community.find().lean();

            const builtPosts = posts.map(post => buildPost(post));
    
            resp.render('explore-results', { 
                layout: 'index',
                title: 'Search Results',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                currentuser: currentUser,
                query: req.query
            });
    
        } catch (error) {
            console.error("Error loading search results:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/newpost', async function(req, resp){
        const communities = await Community.find().lean();

        resp.render('newpost',{
            layout: 'index',
            title: 'New Post',
            selNav: 'newpost',
            communities: communities,
            currentuser: req.query.currentuser || null
        });
    });
    
    server.get('/popular', async function(req, resp){
        try {
            const posts = await Post.find({ 
                $expr: { $gte: [{ $size: "$upvotes" }, 15] } 
            })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();

            const builtPosts = posts.map(post => buildPost(post));

            const communities = await Community.find().lean();
    
            resp.render('popular',{
                layout: 'index',
                title: 'Popular',
                selNav: 'popular',
                posts: builtPosts,
                communities: communities,
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

        const communities = await Community.find().lean();
    
        resp.render('community', {
            layout: 'index',
            title: community.name,
            selNav: 'community',
            communityName: community.name,
            posts: builtPosts,
            communities: communities,
            currentuser: req.query.currentuser || null
        });

    });
}