const User = require('../models/userModel');
const Post = require('../models/postModel');
const Community = require('../models/communityModel');
const Reply = require('../models/replyModel');
const { formatTimeDifference, buildPost, buildReply } = require('../js/utils');

module.exports.add = (server) => {
    // URL: /profile/<username>
    server.get('/profile/:username', async function(req, resp){
        const currentuser = req.query.currentuser || null;

        if (!req.params.username || req.params.username === "undefined" || !currentuser) {
            return resp.redirect('/login');
        }

        const user = await User.findOne({ username: req.params.username })
            .populate({
                path: 'posts',
                model: 'post',
                populate: [{
                    path: 'author',
                    model: 'user',
                    select: 'username profileName pfp'
                }, {
                    path: 'community',
                    model: 'community',
                    select: 'name color'
                }]
            })
            .lean();
        if (!user) {
            return resp.status(404).send("User not found");
        }
        
        const loggedInUser = await User.findOne({ username: currentuser }).select('pfp').lean();
        const currentUserPfp = loggedInUser ? loggedInUser.pfp : "common/defaultpfp.png";

        const transformedPosts = user.posts.map(post => buildPost(post));
        
        resp.render('profile-posts',{
            layout: 'profileLayout',
            title: `${user.profileName} | Profile`,
            selNav: 'profile',
            username: user.username,
            profileName: user.profileName,
            email: user.email,
            viewedUserPfp: user.pfp,
            bio: user.bio,
            posts: transformedPosts,

            currentuser: currentuser,
            currentuserPfp: currentUserPfp
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
    server.get('/profile/:posteruser/post/:postid', async (req, resp) => {
        try {
            const { posteruser, postid } = req.params;
            const currentuser = req.query.currentuser || null;
    
            const postData = await Post.findOne({ _id: postid })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
    
            // Ensure post exists and belongs to the correct user
            if (!postData || postData.author?.username !== posteruser) {
                return resp.status(404).render('error', { message: "Post not found or doesn't belong to this user" });
            }
            
            const builtPost = buildPost(postData);

            const replies = await Reply.find({ post: postid })
                .populate("author", "profileName username pfp")
                .lean();

            const builtReplies = replies.map(reply => buildReply(reply));

            resp.render('viewpost', {
                layout: 'index',
                title: postData.title, 
                isViewPost: true,
                isReply: false,
                ...builtPost,
                repliesToPost: builtReplies.map(reply => ({ ...reply, isReply: true })),
            });
        } catch (error) {
            console.error("Error loading post:", error);
            resp.status(500).render('error', { message: "Internal Server Error" });
        }
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