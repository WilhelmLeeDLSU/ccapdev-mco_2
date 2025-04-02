const moment = require('moment'); 
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Community = require('../models/communityModel');
const Reply = require('../models/replyModel');
const { formatTimeDifference, buildPost, buildReply, requireAuth } = require('../js/utils');
const replyModel = require('../models/replyModel');

module.exports.add = function(server) {
    
    // URL: /profile/<username>
    server.get('/profile/:username', requireAuth, async function(req, resp){

        const user = await User.findOne({ username: req.params.username }).lean();
        if (!user) {
            return resp.status(404).send("User not found");
        }

        const userPosts = await Post.find({ author: user._id })
            .populate("author", "profileName username pfp")
            .populate("community", "name color")
            .sort({ timeCreated: -1 })
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

       // Map posts and include the reply count and vote flags
        const builtPosts = userPosts.map(post => {
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
        
        resp.render('profile-posts',{
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            posts: builtPosts
        });
    });
    
    // URL: /profile/<username>/replies for replies of the profile
    server.get('/profile/:username/replies', requireAuth, async function(req, resp) {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return resp.status(404).send("User not found");
        }

        // Get the current user directly from the session
        const currentUser = req.session.user;

        // Fetch the upvoted and downvoted REPLIES for the current user
        const userUpvotedReplies = currentUser ? await Reply.find({ upvotes: currentUser._id }).lean() : [];
        const userDownvotedReplies = currentUser ? await Reply.find({ downvotes: currentUser._id }).lean() : [];

        // Create sets for fast lookup of reply IDs (not post IDs)
        const upvotedReplyIds = new Set(userUpvotedReplies.map(reply => reply._id.toString()));
        const downvotedReplyIds = new Set(userDownvotedReplies.map(reply => reply._id.toString()));

        // Fetch the replies by the user
        const replies = await Reply.find({ author: user._id })
            .populate("author", "profileName username pfp")
            .populate({
                path: "post",
                populate: { path: "author", select: "username" }
            })
            .sort({ timeCreated: -1 })
            .lean();

        // Map replies and add isUpvoted and isDownvoted flags for the REPLIES themselves
        const builtReplies = replies.map(reply => {
            const replyId = reply._id.toString();
            return {
                ...buildReply(reply),
                isUpvoted: upvotedReplyIds.has(replyId),
                isDownvoted: downvotedReplyIds.has(replyId),
                isReply: true // Adding `isReply` for template usage
            };
        });

        // Render the page with the relevant data
        resp.render('profile-replies', {
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            repliesToPost: builtReplies,
            isViewPost: false,
        });
    });


    // Profile upvotes
    server.get('/profile/:username/upvotes', requireAuth, async function(req, resp) {

        const user = await User.findOne({ username: req.params.username }).lean();
        if (!user) {
            return resp.status(404).send("User not found");
        }

        // Get the current user directly from the session
        const currentUser = req.session.user;

        // Fetch the upvoted posts by the profile owner (user)
        const upvotedPosts = await Post.find({ upvotes: user._id })
            .populate("author", "profileName username pfp")
            .populate("community", "name color")
            .sort({ timeCreated: -1 })
            .lean();
        
        // Fetch all replies to associate them with posts
        const replies = await Reply.find({}, 'post').lean();

        // Create a map for reply counts for posts
        const replyCountMap = {};
        replies.forEach(reply => {
            const postId = reply.post.toString();
            replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
        });

        // Fetch the current user's upvoted and downvoted posts for the "isUpvoted" and "isDownvoted" flags
        const userUpvotedPosts = currentUser ? await Post.find({ upvotes: currentUser._id }).lean() : [];
        const userDownvotedPosts = currentUser ? await Post.find({ downvotes: currentUser._id }).lean() : [];

        // Create sets for fast lookup
        const upvotedPostIds = new Set(userUpvotedPosts.map(post => post._id.toString()));
        const downvotedPostIds = new Set(userDownvotedPosts.map(post => post._id.toString()));

        // Map posts and include the reply count and vote flags
        const builtPosts = upvotedPosts.map(post => {
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

        // Render the profile-upvotes page with the relevant data
        resp.render('profile-upvotes', {
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            posts: builtPosts
        });
    });


    // URL: /profile/<username>/post<postid>
    server.get('/post/:posteruser/:postid', async (req, resp) => {
        try {
            const { posteruser, postid } = req.params;
    
            const postData = await Post.findOne({ _id: postid })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
                
            // Ensure post exists and belongs to the correct user
            if (!postData || postData.author?.username !== posteruser) {
                return resp.status(404).send("Post not found or doesn't belong to this user");
            }                
                       
            const replies_post = await Reply.find({}, 'post').lean();
        
            const replyCountMap = {};
            replies_post.forEach(reply => {
                const postId = reply.post.toString();
                replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
            });
                        
            const builtPost = buildPost({
                ...postData,
                replyCount: replyCountMap[postData._id.toString()] || 0 
            });

            const replies = await Reply.find({ post: postid })
                .populate("author", "profileName username pfp")
                .populate({
                    path: "post",
                    populate: { path: "author", select: "username" } 
                })
                .sort({ timeCreated: -1 })
                .lean();
                
            const communities = await Community.find().lean();

            const builtReplies = replies.map(reply => buildReply(reply));
            resp.render('viewpost', {
                layout: 'index',
                title: postData.title, 
                isViewPost: true,
                isReply: false,
                ...builtPost,
                repliesToPost: builtReplies.map(reply => ({ ...reply, isReply: true })),
                communities: communities
            });
                
        } catch (error) {
            console.error("Error loading post:", error);
            resp.status(500).send("Internal Server Error");
        }
    });

    
    // Add a reply
    server.post('/reply/:posteruser/:postid', async (req, resp) => {
        try{
            console.log("Received POST request to reply:");
            const { posteruser, postid } = req.params;
            const { replyText } = req.body;
            const user = await User.findOne({ username: req.session.user?.username }).lean();

            if (!user) {
                return resp.status(401).send("Unauthorized. Please log in.");
            }

            const postExists = await Post.findById(postid);
            if (!postExists) {
                return resp.status(404).send("Post not found.");
            }

            const newReply = new Reply({
                post: postid,
                author: user._id,
                timeCreated: moment().toDate(),
                content: replyText,
                upvotes: 0,
                downvotes: 0,
            });

            await newReply.save();

            console.log("New reply added:", newReply);

            resp.redirect(`/post/${posteruser}/${postid}`);
        } catch (error) {
            console.error("Error adding reply:", error);
            resp.status(500).send("Internal Server Error");
        }
        

    });
    // URL: /profile/<username>/post<postid>/edit
    server.get('/profile/:posteruser/post/:postid/edit', async function(req, resp){
        const { posteruser, postid } = req.params;

        const postData = await Post.findOne({ _id: postid })
                    .populate("author", "profileName username pfp")
                    .populate("community", "name color")
                    .lean();
        
        if (!postData || postData.author?.username !== posteruser) {
            return resp.status(404).render('error', { message: "Post not found or doesn't belong to this user" });
        }

        const user = await User.findOne({ username: req.session.user?.username }).lean();
        if (!user || user._id.toString() !== postData.author._id.toString()) {
            return resp.status(403).render('error', { message: "Unauthorized to edit this post" });
        }

        const builtPost = buildPost(postData);
        console.log("OG Post:", builtPost);
        const communities = await Community.find().lean();

        resp.render('editpost',{
            layout: 'index',
            title: 'Editing Post',
            posteruser: posteruser,
            postid: postid,
            communities: communities,
            post: builtPost,
            postTitle: postData.title,
            postDesc: postData.content,
            postCommunity: postData.community
        });
    });

    //Edit post
    server.post('/post/:posteruser/:postid/edit', async function(req, resp){
       try{
            const { postTitle, postDesc, community } = req.body;
            const { posteruser, postid } = req.params;

            const post = await Post.findById(postid);
            if (!post) {
                return resp.status(404).send("Post not found");
            }

            const user = await User.findOne({ username: req.session.user?.username }).lean();
            if (!user || user._id.toString() !== post.author.toString()) {
                return resp.status(403).send("Unauthorized to edit this post");
            }
            
            const communityExists = await Community.findById(community);
            if (!communityExists) {
                return resp.status(400).send("Invalid community selected");
            }

            const ogUpvotes = post.upvotes;

            post.title = postTitle;
            post.content = postDesc;
            post.community = community;
            post.timeCreated = moment().toDate(),
            post.upvotes = ogUpvotes
            post.isEdited = true;

            await post.save();
            console.log("Edited Post: ", post);
            return resp.redirect(`/post/${posteruser}/${postid}`);
       } catch (error) {
        console.error("Error updating post:", error);
        resp.status(500).send("Internal Server Error");
       }
    });

    // URL: /profile/<username>/reply<repid>/edit
    server.get('/profile/:posteruser/reply/:repid/edit', async function(req, resp){
        const { posteruser, repid } = req.params;

        const repData = await Reply.findOne({ _id: repid })
                    .populate("author", "profileName username pfp")
                    .lean();
        
        if (!repData || repData.author?.username !== posteruser) {
            return resp.status(404).send('error', { message: "Post not found or doesn't belong to this user" });
        }

        const builtRep = buildReply(repData);
        console.log(builtRep);

        resp.render('editreply',{
            layout: 'index',
            title: 'Editing Reply',
            reply: builtRep,
            posteruser: posteruser,
            repid: repid

        });
    });

    //Edit reply
    server.post('/reply/:posteruser/:repid/edit', async function(req, resp) {
        const { replyDesc } = req.body;
        const { posteruser, repid } = req.params;
    
        const reply = await Reply.findById(repid);
        if (!reply) {
            return resp.status(404).send("Reply not found");
        }
    
        const post = await Post.findById(reply.post).populate("author", "username");
        if (!post) {
            return resp.status(404).send("Associated post not found");
        }

        const ogUpvotes = reply.upvotes;
    
        reply.content = replyDesc;
        reply.isEdited = true; 
        await reply.save();

        const postAuthorUsername = post.author.username;
        const postid = post._id;
    
        console.log("Redirecting to:", `/post/${postAuthorUsername}/${postid}`);
        return resp.redirect(`/post/${postAuthorUsername}/${postid}`);
    });
    
    
    //edit profile
    server.get('/editprofile/:username', async function(req, resp){
        const user = await User.findOne({ username: req.params.username }).lean();
        if (!user) {
            return resp.status(404).send("User not found");
        }

        resp.render('editprofile',{
            layout: 'index',
            title: 'Edit Profile',
            pfp: user.pfp,
            username: user.username,
            profileName: user.profileName,
            bio: user.bio,
        });
    });

    server.post('/editprofile/:username', async function(req, resp){
        const { profileName, username, bio, pfp} = req.body;

        console.log("Received pfp:", pfp);

        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return resp.status(404).send("User not found");
        }

        user.profileName = profileName;
        user.username = username;
        user.bio = bio;

        if (pfp && pfp.trim() !== "") {
            user.pfp = pfp;
        }

        await user.save();
        console.log(user);

        if (req.session.user && req.session.user.username === req.params.username) { //update session
            req.session.user.username = username;
        }

        return resp.redirect(`/profile/${username}`);
    });
}