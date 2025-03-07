const moment = require('moment'); 

const Post = require('../models/postModel');
const User = require('../models/userModel');
const Community = require('../models/communityModel');

module.exports.add = (server) => {
    server.get('/', async function (req, resp) {
        try {
            const posts = await Post.find()
                .populate("author", "profileName username pfp")
                .populate("community", "name, color")
                .lean();
            
            const builtPosts = posts.map(post => buildPost(post));
    
            resp.render('main', {
                layout: 'index',
                title: 'Home',
                selNav: 'main',
                currentuser: req.currentuser,
                posts: builtPosts,
            });
    
        } catch (error) {
            console.error("Error loading posts:", error);
            resp.status(500).send("Internal Server Error");
        }
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

// FORMAT TIME CREATED
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

// BUILD POST
function buildPost(post, usersMap, communitiesMap) {
    if (!post || !post.timeCreated) return null;
    
    return {
        _id: post._id,
        author: {
            id: post.author?._id || "unknown",
            profileName: post.author?.profileName || "Unknown User",
            username: post.author?.username || "anonymous",
            profilePicture: post.author?.pfp || "/default-pfp.png",
        },
        timeCreated: formatTimeDifference(post.timeCreated),
        community: {
            community: post.community?.name || "General Discussion",
            color: post.community?.color || "#222222",
        },
        title: post.title || "Untitled",
        content: post.content || "No content available",
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        replies: post.replies || [],
    };
}