import React from 'react';
import { format, formatDistanceToNow, isBefore, subWeeks } from 'date-fns';

const PostDate = ({ createdAt }) => {
    // Parse the createdAt date from a timestamp
    const createdDate = new Date(createdAt);
    const now = new Date();

    // Define the threshold date (one week ago)
    const oneWeekAgo = subWeeks(now, 1);

    // Determine if the post was created within the last week
    const isRecent = isBefore(createdDate, oneWeekAgo);

    // Format the date based on the condition
    const displayDate = !isRecent
        ? formatDistanceToNow(createdDate, { addSuffix: true })
        : format(createdDate, 'MMMM d, yyyy');

    return <span>{displayDate}</span>;
};

export default PostDate;
