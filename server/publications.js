/*
  Publishes the posts based on the options object
*/
Meteor.publish('posts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Posts.find({}, options);
});

/*
  Publishes a single post, by id
*/
Meteor.publish('singlePost', function(id) {
  check(id, String);
  return Posts.find(id);
});

/*
  Publishes the comments for a specific postId
*/
Meteor.publish('comments', function(postId) {
  check(postId, String);
  return Comments.find({postId: postId});
});

/*
  Publishes the notifications for the logged in user
*/
Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId, read: false});
});
