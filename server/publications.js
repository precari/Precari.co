/**
 * Publishes the current user's information
 * @return collection The user matching the user ID, otherwise null
 */
 Meteor.publish("user", function() {
    // this.userId returns undefined if not logged in
     if(this.userId) {
       return Meteor.users.find(
         { _id: this.userId },
         { fields:
           { emails: 1, username: 1, profile: 1 }
         });
     } else {
       // Optionally, return  return []; Functionally, the result is the same
       return this.ready();
     }
 });

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
  return Posts.find({}, options);
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
 * Publishes the list of all tags
 * @return collection Entire Tag collection
 */
Meteor.publish('tags', function() {
  return Tags.find();
});

/**
 * Publishes the posts containing the specified tag
 * @param string tag The tag to get the posts for
 * @return collection Posts that contain the specified tag
 */
 Meteor.publish('postsContainingTag', function(options, tag) {

   check(options, {
     sort: Object,
     limit: Number
   });

  check(tag, String);

  return Posts.find({tags: tag}, options);
});
