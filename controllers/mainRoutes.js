const moment = require('moment'); 
const { formatTimeDifference, buildPost, requireAuth } = require('../js/utils');

const Post = require('../models/postModel');
const User = require('../models/userModel');
const Reply = require('../models/replyModel');
const Community = require('../models/communityModel');

module.exports.add = function(server) {
    server.post('/post/:id/delete', async function (req, resp) {
        console.log('Server delete function reached');
        try {
            const postId = req.params.id;
            
            // Update the post to mark it as deleted (soft delete)
            const post = await Post.findByIdAndUpdate(postId, { deleted: true }, { new: true });
    
            if (!post) {
                return resp.status(404).send({ message: 'Post not found' });
            }
    
            console.log('Post marked as deleted:', post);
            resp.status(200).send({ message: 'Post marked as deleted' });
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
            // Fetch posts excluding those marked as deleted
            const posts = await Post.find({ deleted: { $ne: true } })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .sort({ timeCreated: -1 })
                .lean();
    
            // Fetch replies to count them for each post
            const replies = await Reply.find({}, 'post').lean();
            const replyCountMap = {};
    
            replies.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
    
            // Get the current user directly from the session
            const currentUser = req.session.user;
    
            // Fetch the current user's upvoted and downvoted posts for flags
            const userUpvotedPosts = currentUser ? await Post.find({ upvotes: currentUser._id }).lean() : [];
            const userDownvotedPosts = currentUser ? await Post.find({ downvotes: currentUser._id }).lean() : [];
            
            // Create sets for fast lookup of upvoted and downvoted post IDs
            const upvotedPostIds = new Set(userUpvotedPosts.map(post => post._id.toString()));
            const downvotedPostIds = new Set(userDownvotedPosts.map(post => post._id.toString()));
    
            // Process the posts to build them with flags and reply count
            const builtPosts = posts.map(post => {
                const postId = post._id.toString();
    
                // Build the post and include flags for upvoted and downvoted
                const builtPost = buildPost({
                    ...post,
                    replyCount: replyCountMap[postId] || 0,
                });
    
                if (builtPost) {
                    // Return the post with added upvote/downvote flags
                    return {
                        ...builtPost,
                        isUpvoted: upvotedPostIds.has(postId),
                        isDownvoted: downvotedPostIds.has(postId),
                    };
                }
    
                // If the post is invalid, return null
                return null;
            }).filter(post => post !== null); // Filter out any null values
    
            // Fetch the community details
            const communities = await Community.find().lean();
    
            // Render the response with built posts and communities
            resp.render('main', {
                layout: 'index',
                title: 'Home',
                selNav: 'main',
                posts: builtPosts,
                communities: communities
            });
    
        } catch (error) {
            console.error("Error loading posts:", error);
            resp.status(500).send({ message: 'Internal Server Error', error }); // Send more detailed error info
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
                
            // Get the current user directly from the session
            const currentUser = req.session.user;

            // Fetch the current user's upvoted and downvoted posts for the "isUpvoted" and "isDownvoted" flags
            const userUpvotedPosts = currentUser ? await Post.find({ upvotes: currentUser._id }).lean() : [];
            const userDownvotedPosts = currentUser ? await Post.find({ downvotes: currentUser._id }).lean() : [];
            
            // Create sets for fast lookup
            const upvotedPostIds = new Set(userUpvotedPosts.map(post => post._id.toString()));
            const downvotedPostIds = new Set(userDownvotedPosts.map(post => post._id.toString()));

            const builtPosts = posts.map(post => {
                const postId = post._id.toString();

                return {
                    ...buildPost({
                        ...post,
                        replyCount: replyCountMap[post._id.toString()] || 0,
                    }),
                    isUpvoted: upvotedPostIds.has(postId),
                    isDownvoted: downvotedPostIds.has(postId)
                };
            });

            const communities = await Community.find().lean();
    
            resp.render('explore',{
                layout: 'index',
                title: 'Explore',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities
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
                
            // Get the current user directly from the session
            const currentUser = req.session.user;

            // Fetch the current user's upvoted and downvoted posts for the "isUpvoted" and "isDownvoted" flags
            const userUpvotedPosts = currentUser ? await Post.find({ upvotes: currentUser._id }).lean() : [];
            const userDownvotedPosts = currentUser ? await Post.find({ downvotes: currentUser._id }).lean() : [];
            
            // Create sets for fast lookup
            const upvotedPostIds = new Set(userUpvotedPosts.map(post => post._id.toString()));
            const downvotedPostIds = new Set(userDownvotedPosts.map(post => post._id.toString()));

            const builtPosts = posts.map(post => {
                const postId = post._id.toString();

                return {
                    ...buildPost({
                        ...post,
                        replyCount: replyCountMap[post._id.toString()] || 0,
                    }),
                    isUpvoted: upvotedPostIds.has(postId),
                    isDownvoted: downvotedPostIds.has(postId)
                };
            });

            resp.render('explore-results', { 
                layout: 'index',
                title: 'Search Results',
                selNav: 'explore',
                posts: builtPosts,
                communities: communities,
                query: req.query
            });

        } catch (error) {
            console.error("Error loading search results:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    server.get('/newpost', requireAuth, async function(req, resp){
        const communities = await Community.find().lean();

        resp.render('newpost',{
            layout: 'index',
            title: 'New Post',
            selNav: 'newpost',
            communities: communities
        });
    });
    
    // Add a new post
    server.post('/newpost', requireAuth, async function(req, resp) {
        try {
            const { postTitle, postDesc, postCommunity } = req.body;
    
            const user = await User.findOne({ username: req.session.user?.username }).lean();
            console.log("Session user:", req.session.user);
            const communityDoc = await Community.findOne({ _id: postCommunity }).lean();
            //const communityDoc = await Community.findById(mongoose.Types.ObjectId(postCommunity)).lean();


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
                downvotes:[], // Array of user IDs
                replies: [] // Array of reply IDs
            });
    
            await newPost.save();
            console.log("Post Saved:", newPost);
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
                // Get the current user directly from the session
                const currentUser = req.session.user;

                // Fetch the current user's upvoted and downvoted posts for the "isUpvoted" and "isDownvoted" flags
                const userUpvotedPosts = currentUser ? await Post.find({ upvotes: currentUser._id }).lean() : [];
                const userDownvotedPosts = currentUser ? await Post.find({ downvotes: currentUser._id }).lean() : [];
                
                // Create sets for fast lookup
                const upvotedPostIds = new Set(userUpvotedPosts.map(post => post._id.toString()));
                const downvotedPostIds = new Set(userDownvotedPosts.map(post => post._id.toString()));

                const builtPosts = posts.map(post => {
                const postId = post._id.toString();

                return {
                    ...buildPost({
                        ...post,
                        replyCount: replyCountMap[post._id.toString()] || 0,
                    }),
                    isUpvoted: upvotedPostIds.has(postId),
                    isDownvoted: downvotedPostIds.has(postId)
                };
            });

            const communities = await Community.find().lean();
    
            resp.render('popular',{
                layout: 'index',
                title: 'Popular',
                selNav: 'popular',
                posts: builtPosts,
                communities: communities,
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
                
            // Get the current user directly from the session
            const currentUser = req.session.user;

            // Fetch the current user's upvoted and downvoted posts for the "isUpvoted" and "isDownvoted" flags
            const userUpvotedPosts = currentUser ? await Post.find({ upvotes: currentUser._id }).lean() : [];
            const userDownvotedPosts = currentUser ? await Post.find({ downvotes: currentUser._id }).lean() : [];
            
            // Create sets for fast lookup
            const upvotedPostIds = new Set(userUpvotedPosts.map(post => post._id.toString()));
            const downvotedPostIds = new Set(userDownvotedPosts.map(post => post._id.toString()));

            const builtPosts = posts.map(post => {
                const postId = post._id.toString();

                return {
                    ...buildPost({
                        ...post,
                        replyCount: replyCountMap[post._id.toString()] || 0,
                    }),
                    isUpvoted: upvotedPostIds.has(postId),
                    isDownvoted: downvotedPostIds.has(postId)
                };
            });

        const communities = await Community.find().lean();
    
        resp.render('community', {
            layout: 'index',
            title: community.name,
            selNav: 'community',
            communityName: community.name,
            posts: builtPosts,
            communities: communities
        });

    });

    server.post('/upvote', async (req, resp) => {
        try {
            const { id, type } = req.body; // `id` is the post/reply ID, `type` is either 'post' or 'reply'
            const currentUser = req.session.user;
    
            if (!currentUser) {
                return resp.status(401).send({ redirect: '/login' }); // Redirect to login if not authenticated
            }
    
            const userId = currentUser._id;
    
            if (type === 'post') {
                const post = await Post.findById(id);
                if (!post) return resp.status(404).send({ message: 'Post not found' });
    
                if (!post.upvotes.includes(userId)) {
                    post.upvotes.push(userId);
                    post.downvotes = post.downvotes.filter(uid => uid.toString() !== userId.toString()); // Remove from downvotes if present
                    await post.save();
                }
            } else if (type === 'reply') {
                const reply = await Reply.findById(id);
                if (!reply) return resp.status(404).send({ message: 'Reply not found' });
    
                if (!reply.upvotes.includes(userId)) {
                    reply.upvotes.push(userId);
                    reply.downvotes = reply.downvotes.filter(uid => uid.toString() !== userId.toString()); // Remove from downvotes if present
                    await reply.save();
                }
            }
    
            resp.status(200).send({ message: 'Upvoted successfully' });
        } catch (error) {
            console.error('Error upvoting:', error);
            resp.status(500).send({ message: 'Internal Server Error' });
        }
    });
    
    server.post('/downvote', async (req, resp) => {
        try {
            const { id, type } = req.body; // `id` is the post/reply ID, `type` is either 'post' or 'reply'
            const currentUser = req.session.user;
    
            if (!currentUser) {
                return resp.status(401).send({ redirect: '/login' }); // Redirect to login if not authenticated
            }
    
            const userId = currentUser._id;
    
            if (type === 'post') {
                const post = await Post.findById(id);
                if (!post) return resp.status(404).send({ message: 'Post not found' });
    
                if (!post.downvotes.includes(userId)) {
                    post.downvotes.push(userId);
                    post.upvotes = post.upvotes.filter(uid => uid.toString() !== userId.toString()); // Remove from upvotes if present
                    await post.save();
                }
            } else if (type === 'reply') {
                const reply = await Reply.findById(id);
                if (!reply) return resp.status(404).send({ message: 'Reply not found' });
    
                if (!reply.downvotes.includes(userId)) {
                    reply.downvotes.push(userId);
                    reply.upvotes = reply.upvotes.filter(uid => uid.toString() !== userId.toString()); // Remove from upvotes if present
                    await reply.save();
                }
            }
    
            resp.status(200).send({ message: 'Downvoted successfully' });
        } catch (error) {
            console.error('Error downvoting:', error);
            resp.status(500).send({ message: 'Internal Server Error' });
        }
    });
    
    //about page
    server.get('/about', function (req, resp) {
        resp.render('about', {
            layout: 'index',
            title: 'About',
            selNav: 'about', // Pass this to highlight the About button
            npmPackages: [
                'express',
                'body-parser',
                'express-handlebars',
                'mongoose',
                'moment',
                'cookie-parser',
                'express-session',
                'argon2',
                'dotenv'
            ]
        });
    });
    
}