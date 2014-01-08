GET /api/inbox/tweets               -> list all tweets
GET /api/inbox/tweets/id            -> fetch 1 tweet
GET /api/inbox/tweets/id/comments   -> list all comments for a tweet
POST /api/inbox/tweets/id/comments  -> attach a comment to a tweet

+ model updates by Socket.IO: 'tweet', 'comment' events