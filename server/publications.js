
/*
 *  Security note: Private tags should remain hidden at al times, except to the
 *  owner of the post and the user of the private tags.
 *  Omit using: { fields: { privateTags:0 } }
 */

/******************************************************************************
  URL Query Conditions:
   - Home page:
     * Posts: Only display PUBLIC posts
     * Tags: Always display the public tags
   - PublicTags
      * Posts: Display ALL posts with the tag attached
      * Tags: Dispaly ALL public tags; hide ALL private tags for non-logged in user
              Display private tags if the logged in user owns them
   - PrivateTags
     * Posts: Display ALL posts with the tag attached
     * Tags:Dispaly ALL public tags; ; hide ALL private tags for non-logged in user
            Display private tags if the logged in user owns them

 * mongodb query examples:

 // Omits a field:
 db.posts.find({ publicTags: 'tag 2', private: false }, { privateTags:0 })

 // Or statement with field omission
 db.posts.find( { $or: [{ publicTags: 'tag 2', private: false },
                        { privateTags: 'tag 2', private: false }] },
                { privateTags:0 } )

  // Meteor query (mongodb console doesn't like it for some reason)
  // Gets public posts containing a specific tag (omitting private data)
  return Posts.find( {
                      $or: [
                              { publicTags: tag, private: false },
                              { privateTags: tag, private: false }
                           ]
                     },
                     {
                       fields: { privateTags:0 }
                     }, options );

   // Gets tag from public tag (omitting private )
   return Posts.find( { publicTags: tag },
                      { fields: { privateTags:0 } }, options );



 ******************************************************************************/

// ------------------------- Post publications ---------------------------------

/**
 * Publishes all public posts and tags (omitting private data)
 * @param object options The sort and retreival options
 * @return collection The posts matching the sort criteria
 */
Meteor.publish('publicPosts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  // Get all posts that are public, but omit private data
  return Posts.find( { private:false }, { fields: { privateTags:0 } }, options);
});

/**
 * Publishes the posts containing the specified public or private tag
 * @param object options The sort and retreival options
 * @param string tag The tag to get the posts for
 * @return collection Posts that contain the specified tag
 */
Meteor.publish('postsFromTag', function(options, tag) {
  check(options, {
    sort: Object,
    limit: Number
  });

  check(tag, String);

  // Process private tag
  if (Meteor.call('isPrivateTag', tag)) {

    // Since the tags are stored in the post in human readable form (label),
    // we need to find the corresponding label from the key.
    // While many of the same labels may exist for different users, the labels
    // for each user will be unique.

    // Based on the tag name/key (~5kQcBDugTEad), locate the label ('my tag')
    var privateTag = PrivateTags.findOne({name: tag});
    if (privateTag === undefined) {
      // set to empty object and let Meteor handle as dataNotFound
      privateTag = [{}];
    }

    // Find the posts matching only that tag and the tags owner
    return Posts.find( { privateTags: privateTag.label, userId: privateTag.userId },
                        { fields: { privateTags:0 } }, options );

  // Process public tag
  } else {
    return Posts.find( { publicTags: tag },
                        { fields: { privateTags:0 } }, options );
  }
});

/**
 * Publishes the posts belonging to the logged in user
 * @param object options The sort and retreival options
 * @return collection Posts that belong to the logged in user
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
 * Publishes the list of a specific user's tags
 * @return collection PrivateTag collection of a user's tags
 */
Meteor.publish('usersPrivateTags', function() {

  // Gets all tags owned by the user
  return PrivateTags.find({userId: this.userId});
});


/**
 * Publishes the list of public tags
 * @return collection PublicTag collection of public tags
 */
Meteor.publish('publicTags', function() {

  // Gets all tags that are public
  return PublicTags.find();
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
