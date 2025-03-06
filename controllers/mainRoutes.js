const fs = require('fs'); // Import fs module
const path = require('path');
const moment = require('moment'); 

module.exports.add = (server) => {
    server.get('/', function (req, resp) {
        try {
            const postsData = loadJSON(path.join(__dirname, '../data/posts.json'));
            const usersData = loadJSON(path.join(__dirname, '../data/users.json'));
            const communitiesData = loadJSON(path.join(__dirname, '../data/communities.json'));
    
            const usersMap = createUsersMap(usersData);
            const communitiesMap = createCommunitiesMap(communitiesData);
    
            const builtPosts = postsData.map(post => buildPost(post, usersMap, communitiesMap))
                                           .filter(post => post !== null);
    
            resp.render('main', {
                layout: 'index',
                title: 'Home',
                selNav: 'main',
                currentuser: req.currentuser,
                posts: builtPosts
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

// LOAD JSON FILES
function loadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return [];
    }
}

// USERS MAP
function createUsersMap(usersData) {
    const usersMap = {};
    usersData.forEach(user => {
        usersMap[user._id?.$oid] = {
            profileName: user.profileName || "Unknown User",
            username: user.username || "anonymous",
            profilePicture: user.pfp || "/default-pfp.png"
        };
    });
    return usersMap;
}

// COMMUNITIES MAP
function createCommunitiesMap(communitiesData) {
    const communitiesMap = {};
    communitiesData.forEach(community => {
        communitiesMap[community._id?.$oid] = {
            community: community.name || "General Discussion",
            color: community.color || "#222222"
        };
    });
    return communitiesMap;
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
        _id: post._id?.$oid,
        author: {
            id: post.author?.$oid || "unknown",
            profileName: usersMap[post.author?.$oid]?.profileName || "Unknown User",
            username: usersMap[post.author?.$oid]?.username || "anonymous",
            profilePicture: usersMap[post.author?.$oid]?.profilePicture || "/default-pfp.png"
        },
        timeCreated: formatTimeDifference(post.timeCreated),
        community: {
            community: communitiesMap[post.community?.$oid]?.community || "General Discussion",
            color: communitiesMap[post.community?.$oid]?.color || "#222222"
        },
        title: post.title || "Untitled",
        content: post.content || "No content available",
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        replies: post.replies || []
    };
}