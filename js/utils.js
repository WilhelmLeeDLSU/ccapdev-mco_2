
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
        upvotes: post.upvotes.length || 0,
        downvotes: post.downvotes || 0,
        replies: post.replyCount || 0,
        isEdited: post.isEdited || false,
    };
}

// BUILD REPLY
function buildReply(reply) {
    if (!reply || !reply.timeCreated) return null;

    return {
        _id: reply._id,
        post: reply.post 
            ? { _id: reply.post._id, 
                authorUsername: reply.post.author?.username || "unknown" } 
            : null,
        author: reply.author
            ? {
                profileName: reply.author.profileName,
                username: reply.author.username,
                pfp: reply.author.pfp,
            }
            : { profileName: "Deleted User", username: "deleted", pfp: "/default-pfp.png" },
        timeCreated: formatTimeDifference(reply.timeCreated),
        content: reply.content,
        upvotes: reply.upvotes,
        downvotes: reply.downvotes,
        isEdited: reply.isEdited
    };
}

function requireAuth(req, res, next) {
    if (!req.session.user?.username) {
        return res.redirect('/login');
    }
    next();
}

module.exports = { formatTimeDifference, buildPost, buildReply, requireAuth };