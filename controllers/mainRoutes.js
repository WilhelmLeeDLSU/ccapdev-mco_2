const moment = require('moment'); 
const { formatTimeDifference, buildPost, requireAuth } = require('../js/utils');

const Post = require('../models/postModel');
const User = require('../models/userModel');
const Reply = require('../models/replyModel');
const Community = require('../models/communityModel');

module.exports.add = function(server) {
    server.delete('/post/:id', async function (req, resp) {
        try {
            const postId = req.params.id;
            await Post.findByIdAndDelete(postId);
            resp.status(200).send({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error("Error deleting post:", error);
            resp.status(500).send({ message: 'Error deleting post', error });
        }
    });

    server.delete('/reply/:id', async function (req, resp) {
        try {
            const replyId = req.params.id;
            await Reply.findByIdAndDelete(replyId);
            resp.status(200).send({ message: 'Reply deleted successfully' });
        } catch (error) {
            console.error("Error deleting reply:", error);
            resp.status(500).send({ message: 'Error deleting reply', error });
        }
    });

    server.get('/', async function (req, resp) {
        try {
            const posts = await Post.find()
                .populate("author", "profileName username pfp")
                .populate("community", "name color ")
                .lean();

            const replies = await Reply.find({}, 'post').lean();

            const replyCountMap = {};
            replies.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
            
            const builtPosts = posts.map(post => buildPost({
                ...post,
                replyCount: replyCountMap[post._id.toString()] || 0 
            }));

            const communities = await Community.find().lean();
    
            resp.render('main', {
                layout: 'index',
                title: 'Home',
                selNav: 'main',
                posts: builtPosts,
                communities: communities,
                //currentuser: req.query.currentuser || null
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
            
            const replies = await Reply.find({}, 'post').lean();

            const replyCountMap = {};
            replies.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
                
            const builtPosts = posts.map(post => buildPost({
                ...post,
                replyCount: replyCountMap[post._id.toString()] || 0 
            }));

            const communities = await Community.find().lean();
    
            resp.render('explore',{
                layout: 'index',
                title: 'Explore',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                //currentuser: req.query.currentuser || null
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
            //const currentUser = req.query.currentuser || null;
    
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
            
            const replies = await Reply.find({}, 'post').lean();

            const replyCountMap = {};
            replies.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
                
            const builtPosts = posts.map(post => buildPost({
                ...post,
                replyCount: replyCountMap[post._id.toString()] || 0 
            }));
    
            resp.render('explore-results', { 
                layout: 'index',
                title: 'Search Results',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                //currentuser: currentUser,
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
            //const currentUser = req.query.currentuser || null;
    
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
            
            const replies = await Reply.find({}, 'post').lean();

            const replyCountMap = {};
            replies.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
                
            const builtPosts = posts.map(post => buildPost({
                ...post,
                replyCount: replyCountMap[post._id.toString()] || 0 
            }));
    
            resp.render('explore-results', { 
                layout: 'index',
                title: 'Search Results',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                //currentuser: currentUser,
                query: req.query
            });
    
        } catch (error) {
            console.error("Error loading search results:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/newpost', requireAuth, async function(req, resp){
        //const currentuser = req.query.currentuser || null;

        //if (!currentuser) {
        //    return resp.redirect('/login');
        //}

        const communities = await Community.find().lean();

        resp.render('newpost',{
            layout: 'index',
            title: 'New Post',
            selNav: 'newpost',
            communities: communities,
            //currentuser: req.query.currentuser || null
        });
    });
    
    server.post('/newpost', async function(req, resp) {
        //const currentUser = req.query.currentuser || null;
    
        try {
            const { postTitle, postDesc, postCommunity } = req.body;
    
            const user = await User.findOne({ username: currentUser }).lean();
            const communityDoc = await Community.findOne({ _id: postCommunity }).lean();
    
            if (!user || !communityDoc) {
                return resp.status(400).send("Invalid user or community");
            }
    
            const newPost = new Post({
                title: postTitle,
                content: postDesc,
                author: user._id,
                community: communityDoc._id,
                createdAt: moment().toDate(),
                upvotes: [], // Array of user IDs
                downvotes: 0, // Number of downvotes
                replies: [] // Array of reply IDs
            });
    
            await newPost.save();
    
            resp.redirect(`/`);
        } catch (error) {
            console.error("Error creating new post:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/popular', async function(req, resp){
        try {
            const posts = await Post.find({ 
                $expr: { $gte: [{ $size: "$upvotes" }, 25] } 
            })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
            
                const replies = await Reply.find({}, 'post').lean();
    
                const replyCountMap = {};
                replies.forEach(reply => {
                    const postId = reply.post.toString();
                    replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
                });
                    
                const builtPosts = posts.map(post => buildPost({
                    ...post,
                    replyCount: replyCountMap[post._id.toString()] || 0 
                }));

            const communities = await Community.find().lean();
    
            resp.render('popular',{
                layout: 'index',
                title: 'Popular',
                selNav: 'popular',
                posts: builtPosts,
                communities: communities,
                //currentuser: req.query.currentuser || null
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
            
            const replies = await Reply.find({}, 'post').lean();

            const replyCountMap = {};
            replies.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
                
            const builtPosts = posts.map(post => buildPost({
                ...post,
                replyCount: replyCountMap[post._id.toString()] || 0 
            }));

        const communities = await Community.find().lean();
    
        resp.render('community', {
            layout: 'index',
            title: community.name,
            selNav: 'community',
            communityName: community.name,
            posts: builtPosts,
            communities: communities,
            //currentuser: req.query.currentuser || null
        });

    });
}