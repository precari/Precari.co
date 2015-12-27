
/*
 *  Security note: Private tags should remain hidden at al times, except to the
 *  owner of the post and the user of the private tags.
 *  Omit using: { fields: { privateTags:0 } }
 */

// ------------------------- Post publications ---------------------------------

/**
 * Publishes the all public posts
 * @param object options The sort and retreival options
 * @return collection The posts matching the sort criteria
 */
Meteor.publish('posts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  // Get all posts that are public, but omit private data
  return Posts.find( { private:false }, { fields: { privateTags:0 } }, options);
});

/**
 * Publishes the public posts containing the specified tag
 * @param object options The sort and retreival options
 * @param string tag The tag to get the posts for
 * @return collection Posts that contain the specified tag
 */
Meteor.publish('publicPostsFromTag', function(options, tag) {
  check(options, {
    sort: Object,
    limit: Number
  });

  check(tag, String);

  // Gets public posts containing a specific tag
  return Posts.find({ tags: tag, private: false },
                    { fields: { privateTags:0 } }, options);
});

/**
 * Publishes the public posts containing the specified tag
 * @param object options The sort and retreival options
 * @param string tag The tag to get the posts for
 * @return collection Posts that contain the specified tag
 */
Meteor.publish('allPostsFromTag', function(options, tag) {
  check(options, {
    sort: Object,
    limit: Number
  });

  check(tag, String);

  // Gets ALL posts containing a specific tag
  return Posts.find({ privateTags: tag }, //options );
                    { fields: { privateTags:0 } }, options );
});

/**
 * Publishes the posts belonging to the logged in user
 * @param object options The sort and retreival options
 * @return collection Posts that contain the specified tag
 */
Meteor.publish('usersOwnPosts', function(options) {
  check(options, {
   sort: Object,
   limit: Number
  });

   // Gets the posts for the logged in users
  return Posts.find({userId: this.userId}, options);
});

/**
 * Publishes a single post, by id
 * @param string id The id of the post to retreive
 * @return collection A single post corresponding to the id
 */
Meteor.publish('singlePost', function(id) {
  check(id, String);

  var post = Posts.findOne(id);

  // If the user owns the post, return the private data with the post
  if (post && post.userId == this.userId) {
    return Posts.find(id);
  }

  // Otherwise, get the post. Omit private tags
  return Posts.find(id, { fields: { privateTags:0 } });
});

// -------------------------- Tag publications ---------------------------------

/**
 * Publishes the list of public tags
 * @return collection Tag collection of public tags
 */
Meteor.publish('tags', function() {

  // Gets all tags that are public
  return Tags.find({private: false});
});

// ------------------------ Comments publications ------------------------------

/**
 * Publishes the comments for a specific postId
 * @param string postId The id of the post to the comments for
 * @return collection Comments for the specified post
 */
Meteor.publish('comments', function(postId) {
  check(postId, String);

  // Gets all comments for the specified post
  return Comments.find({postId: postId});
});

// ---------------------- notifications publications ---------------------------

/**
 * Publishes the notifications for the logged in user
 * @return collection Unread notifications for the current user
 */
Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId, read: false});
});
