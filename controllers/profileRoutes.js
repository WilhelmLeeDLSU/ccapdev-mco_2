const User = require('../models/userModel');
const Post = require('../models/postModel');
const Community = require('../models/communityModel');
const Reply = require('../models/replyModel');
const { formatTimeDifference, buildPost, buildReply, requireAuth } = require('../js/utils');

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
            .lean();
            
        const replies = await Reply.find({}, 'post').lean();

        const replyCountMap = {};
        replies.forEach(reply => {
            const postId = reply.post.toString();
            replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
        });
                
        const builtPosts = userPosts.map(post => buildPost({
            ...post,
            replyCount: replyCountMap[post._id.toString()] || 0 
        }));
        
        resp.render('profile-posts',{
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            posts: builtPosts,

            //currentuser: currentuser,
            //currentuserPfp: currentUserPfp
        });
    });
    
    // URL: /profile/<username>/replies for replies of the profile
    server.get('/profile/:username/replies', requireAuth, async function(req, resp){

        const user = await User.findOne({ username: req.params.username })

        if (!user) {
            return resp.status(404).send("User not found");
        }
        
        //const loggedInUser = await User.findOne({ username: currentuser }).select('pfp').lean();
        //const currentUserPfp = loggedInUser ? loggedInUser.pfp : "common/defaultpfp.png";

        
        const replies = await Reply.find({ author: user._id })
            .populate("author", "profileName username pfp")
            .populate({
                path: "post",
                populate: { path: "author", select: "username" } 
            })
            .lean();

        const builtReplies = replies.map(reply => buildReply(reply));
        resp.render('profile-replies',{
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            repliesToPost: builtReplies.map(reply => ({ ...reply, isReply: true })),
            //currentuser: currentuser,
            //currentuserPfp: currentUserPfp,
            isViewPost: false,
        });
        
    });

    //profile upvotes
    server.get('/profile/:username/upvotes', requireAuth, async function(req, resp){

        const user = await User.findOne({ username: req.params.username }).lean();
        if (!user) {
            return resp.status(404).send("User not found");
        }
        
        //const loggedInUser = await User.findOne({ username: currentuser }).select('pfp').lean();
        //const currentUserPfp = loggedInUser ? loggedInUser.pfp : "common/defaultpfp.png";

        const upvotedPosts = await Post.find({ upvotes: user._id })
            .populate("author", "profileName username pfp")
            .populate("community", "name color")
            .lean();
            
        const replies = await Reply.find({}, 'post').lean();
    
        const replyCountMap = {};
        replies.forEach(reply => {
            const postId = reply.post.toString();
            replyCountMap[postId] = (replyCountMap[postId] || 0) + 1;
        });
                    
        const builtPosts = upvotedPosts.map(post => buildPost({
            ...post,
            replyCount: replyCountMap[post._id.toString()] || 0 
        }));
        
        resp.render('profile-upvotes',{
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            posts: builtPosts,
            //currentuser: currentuser,
            //currentuserPfp: currentUserPfp
        });
    });

    // URL: /profile/<username>/post<postid>
        server.get('/profile/:posteruser/post/:postid', async (req, resp) => {
            try {
                const { posteruser, postid } = req.params;
                //const currentuser = req.query.currentuser || null;
        
                const postData = await Post.findOne({ _id: postid })
                    .populate("author", "profileName username pfp")
                    .populate("community", "name color")
                    .lean();
        
                // Ensure post exists and belongs to the correct user
                if (!postData || postData.author?.username !== posteruser) {
                    return resp.status(404).render('error', { message: "Post not found or doesn't belong to this user" });
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
                    communities: communities,
                    //currentuser: currentuser
                });
                
            } catch (error) {
                console.error("Error loading post:", error);
                resp.status(500).render('error', { message: "Internal Server Error" });
            }
        });
    
    // URL: /profile/<username>/post<postid>/edit
    server.get('/profile/:posteruser/post/:postid/edit', async function(req, resp){
        const { posteruser, postid } = req.params;
        //const currentuser = req.query.currentuser || null;

        const postData = await Post.findOne({ _id: postid })
                    .populate("author", "profileName username pfp")
                    .populate("community", "name color")
                    .lean();
        
        if (!postData || postData.author?.username !== posteruser) {
            return resp.status(404).render('error', { message: "Post not found or doesn't belong to this user" });
        }

        const builtPost = buildPost(postData);
        console.log(builtPost);
        const communities = await Community.find().lean();

        resp.render('editpost',{
            layout: 'index',
            title: 'Editing Post',
            //currentuser: currentuser,
            communities: communities,
            post: builtPost,
        });
    });

    // URL: /profile/<username>/reply<repid>/edit
    server.get('/profile/:posteruser/reply/:repid/edit', async function(req, resp){
        const { posteruser, repid } = req.params;
        //const currentuser = req.query.currentuser || null;

        const repData = await Reply.findOne({ _id: repid })
                    .populate("author", "profileName username pfp")
                    .lean();
        
        if (!repData || repData.author?.username !== posteruser) {
            return resp.status(404).render('error', { message: "Post not found or doesn't belong to this user" });
        }

        const builtRep = buildReply(repData);
        console.log(builtRep);

        resp.render('editreply',{
            layout: 'index',
            title: 'Editing Reply',
            //currentuser: currentuser,
            reply: builtRep,
        });
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
        const { profileName, username, bio } = req.body;

        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return resp.status(404).send("User not found");
        }

        user.profileName = profileName;
        user.username = username;
        user.bio = bio;

        await user.save();

        if (req.session.user && req.session.user.username === req.params.username) { //update session
            req.session.user.username = username;
        }

        return resp.redirect(`/profile/${username}`);
    });
}