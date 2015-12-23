/**
 * Publishes the posts based on the options object
 * @param object options The sort and retreival options
 * @return collection The posts matching the sort criteria
 */
Meteor.publish('posts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Posts.find({private: false}, options);
});

/**
 * Publishes a single post, by id
 * @param string id The id of the post to retreive
 * @return collection A single post corresponding to the id
 */
Meteor.publish('singlePost', function(id) {
  check(id, String);
  return Posts.find(id);
});

/**
 * Publishes the comments for a specific postId
 * @param string postId The id of the post to the comments for
 * @return collection Comments for the specified post
 */
Meteor.publish('comments', function(postId) {
  check(postId, String);
  return Comments.find({postId: postId});
});

/**
 * Publishes the notifications for the logged in user
 * @return collection Unread notifications for the current user
 */
Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId, read: false});
});

/**
 * Publishes the list of public tags
 * @return collection Tag collection of public tags
 */
Meteor.publish('tags', function() {
  return Tags.find({private: false});
});

/**
 * Publishes the posts containing the specified tag
 * @param object options The sort and retreival options
 * @param string tag The tag to get the posts for
 * @return collection Posts that contain the specified tag
 */
 Meteor.publish('postsContainingTag', function(options, tag) {

   check(options, {
     sort: Object,
     limit: Number
   });

  check(tag, String);

  return Posts.find({tags: tag, private: false}, options);
});

/**
 * Publishes the posts containing the specified tag
 * @param object options The sort and retreival options
 * @return collection Posts that contain the specified tag
 */
 Meteor.publish('usersOwnPosts', function(options) {

   check(options, {
     sort: Object,
     limit: Number
   });

  return Posts.find({userId: this.userId}, options);
});
