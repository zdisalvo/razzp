import { formatDistanceToNow } from "date-fns";

const formatNotificationTime = (time) => {
    return formatDistanceToNow(new Date(time), { addSuffix: true });
};

export default formatNotificationTime