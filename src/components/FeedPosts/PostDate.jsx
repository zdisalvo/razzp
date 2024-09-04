import React from 'react';
import { format, formatDistanceToNow, isBefore, subWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale';

// Custom locale to remove "about" from relative time strings
const customLocale = {
  ...enUS,
  formatDistance: (token, count, options) => {
    const formatDistance = enUS.formatDistance(token, count, options);
    // Remove "about" from the output
    return formatDistance.replace(/^about /, '');
  },
};

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
    ? formatDistanceToNow(createdDate, { addSuffix: true, locale: customLocale })
    : format(createdDate, 'MMM d, yyyy');

  return <span>{displayDate}</span>;
};

export default PostDate;
