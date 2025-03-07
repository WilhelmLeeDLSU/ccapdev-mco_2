
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

module.exports = { formatTimeDifference, buildPost };