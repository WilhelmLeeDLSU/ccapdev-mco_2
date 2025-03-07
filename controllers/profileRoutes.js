const User = require('../models/userModel');
const Post = require('../models/postModel');
const Community = require('../models/communityModel');

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
    server.get('/profile/:posteruser/post/:postid', async (req, resp) => {
        try {
            const { posteruser, postid } = req.params;
            const currentuser = req.query.currentuser || null;
    
            const postData = await Post.findOne({ _id: postid })
                .populate("author", "profileName username pfp")
                .populate("community", "name color")
                .lean();
    
            // Ensure post exists and belongs to the correct user
            if (!postData || postData.author.username !== posteruser) {
                return resp.status(404).render('error', { message: "Post not found or doesn't belong to this user" });
            }
            
            const builtPost = buildPost(postData);

            resp.render('viewpost', {
                layout: 'index',
                title: postData.title, 
                isViewPost: true,
                ...builtPost,
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

    function formatTimeDifference(timeCreated) {
        if (!timeCreated) return "Unknown time";
    
        const postDate = new Date(timeCreated);
        const currentTime = new Date();
        const timeDifferenceMs = currentTime - postDate;
        const minutesAgo = Math.floor(timeDifferenceMs / (1000 * 60));
    
        if (minutesAgo < 1) return "Just now";
        if (minutesAgo < 60) return ` • ${minutesAgo}m ago`;
    
        const hoursAgo = Math.floor(minutesAgo / 60);
        if (hoursAgo < 24) return ` • ${hoursAgo}h ago`;
    
        const daysAgo = Math.floor(hoursAgo / 24);
        if (daysAgo < 30) return ` • ${daysAgo}d ago`;
    
        const monthsAgo = Math.floor(daysAgo / 30);
        if (monthsAgo < 12) return ` • ${monthsAgo}m ago`;
    
        const yearsAgo = Math.floor(monthsAgo / 12);
        return ` • ${yearsAgo}y ago`;
    }

    function buildPost(post) {
        if (!post || !post.timeCreated) return null;
        
        return {
            _id: post._id,
            author: {
                id: post.author?._id || "unknown",
                profileName: post.author?.profileName || "Unknown User",
                username: post.author?.username || "anonymous",
                pfp: post.author?.pfp || "/default-pfp.png",
            },
            timeCreated: formatTimeDifference(post.timeCreated),
            community: {
                name: post.community?.name || "General Discussion",
                color: post.community?.color || "#222222",
            },
            title: post.title || "Untitled",
            content: post.content || "No content available",
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            replies: post.replies || [],
        };
    }
}