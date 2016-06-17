
/*
 *  Security note: Private tags should remain hidden at al times, except to the
 *  owner of the post and the user of the private tags.
 *  Omit using: { fields: { privateTags:0 } }
 */

/******************************************************************************
  URL Query Conditions:
   - Posts on home page/public page: i.e. http://localhost:3000/
     * Posts: Only display PUBLIC posts
     * PublicTags: Always display public tags;
     * PrivateTags: Always hide privateTags
   - Posts from publicTags i.e. http://localhost:3000/tags/tag1
      * Posts: Display ALL posts with the tag attached
      * Tags: Display ALL public tags; hide ALL private tags (no easy way to
              get to get the private tags from some posts, and not others)
   - Posts from privateTags: i.e. http://localhost:3000/tags/~WvcdfJqu8Dhf
     * Posts: Display ALL posts with the tag attached
     * Tags:Dispaly ALL public tags; ; hide ALL private tags for non-logged in user
            Display private tags if the logged in user owns them

 ******************************************************************************/

 // -------------------- user activity publications ----------------------------

 /**
  * Publishes the logged in user's activity
  * @return collection The logged in user's public data and their activity
  */
Meteor.publish('userActivity', function () {

  return Meteor.users.find(
    { _id: this.userId }, {fields: { userActivity: 1 } }
  );
});

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
  return Posts.find(
    { visibility:Meteor.precariMethods.visibility.PUBLIC },
    options,
    {
      fields:
      { privateTags: false }
    }
  );
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

  // Restrictions / visibility
  // * Get posts with visibility set to public or tag.
  // * If public, do not return privateTags
  // * If private and user does not own the tag, do not return privateTags
  // * If private and user is tag owner, return and privateTags

  // Process private tag
  if (Meteor.call('isPrivateTag', tag)) {

    // Since the tags are stored in the post in human readable form (label),
    // we need to find the corresponding label from the key.
    // While the same labels may exist for different users, the labels
    // for each user will be unique per the unique key

    // Based on the tag name/key (~5kQcBDugTEad), locate the label ('my tag')
    var privateTag = PrivateTags.findOne({name: tag});
    if (privateTag === undefined) {
      // return true result and let Meteor handle as dataNotFound
      return PrivateTags.find({name: tag});
    }

    // By default, hide private data
    var fieldsQuery = { fields: { privateTags: false } };

    // If the user owns the tag, return the private data with the post
    if (privateTag.userId === this.userId) {
      fieldsQuery = { };
    }

    // Find the posts matching only that tag and the tags owner
    return Posts.find(
      {
        privateTags:
        { label: privateTag.label },
        userId: privateTag.userId,
        $or: [
                { visibility: Meteor.precariMethods.visibility.TAG },
                { visibility: Meteor.precariMethods.visibility.PUBLIC },
             ],
       },
       options,
       fieldsQuery
     );

  // Process public tag
  } else {
    return Posts.find(
      {
        publicTags:
        { name: tag },
        $or: [
                { visibility: Meteor.precariMethods.visibility.TAG },
                { visibility: Meteor.precariMethods.visibility.PUBLIC },
             ],
      },
      options,
      {
        fields:
        { privateTags: false }
      }
    );
  }
});

/**
 * Publishes a single post, by id
 * @param string id The id of the post to retreive
 * @return collection A single post corresponding to the id
 */
Meteor.publish('singlePost', function(id) {
  check(id, String);

  // Visibility:
  // * Hide if marked private, otherwisie display the post
  // * If user owns the post, return all data.
  // * If user dows not own the post, hide privateTags

  var post = Posts.findOne(id);

  // If the user owns the post, return the private data with the post
  if (post && post.userId == this.userId) {
    return Posts.find(id);
  }

  // Otherwise, get the post. Omit private tags
  return Posts.find(
    {
        _id: id,
        $or: [
                { visibility: Meteor.precariMethods.visibility.LINK },
                { visibility: Meteor.precariMethods.visibility.TAG },
                { visibility: Meteor.precariMethods.visibility.PUBLIC },
             ],
    },
    {
      fields:
      { privateTags: false }
    }
  );
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
  return Posts.find({ userId: this.userId }, options);
});

/**
 * Publishes the posts belonging to the logged in user
 * @param Object options The sort and retreival options
 * @param String visibility The visibility type to query
 * @return Collection Posts of a specific visibility that belong to the
 * logged in user
 */
Meteor.publish('usersOwnPostsWithVisibility', function(options, visibility) {
  check(visibility, String);
  check(options, {
   sort: Object,
   limit: Number
  });

   // Gets the posts for the logged in users
  return Posts.find(
    {
       userId: this.userId,
       visibility: visibility,
     },
     options
   );
});

// -------------------- MyActivity Post publications ---------------------------

/**
 * Publishes the posts that the logged in user has prayed for
 * @param object options The sort and retreival options
 * @return collection Posts that the user prayed for
 */
Meteor.publish('userPrayedPosts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  // Restrictions / visibility
  // * Get posts unless set to private
  // * Hide private data

  return Posts.find(
    {
      precatis: this.userId,
      $or: [
              { visibility: Meteor.precariMethods.visibility.LINK },
              { visibility: Meteor.precariMethods.visibility.TAG },
              { visibility: Meteor.precariMethods.visibility.PUBLIC },
           ],
    },
    options,
    {
      fields:
      { privateTags: false }
    }
  );
});

/**
 * Publishes the posts that the logged in user has commented on
 * @param object options The sort and retreival options
 * @return collection Posts that the user prayed for
 */
Meteor.publish('userCommentedPosts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  // First off, need to retieve the ID from every post that the user has
  // commented on. These are stored in: user.userActivity.postInteraction
  var user = Meteor.users.findOne({ _id: this.userId });

  // Define an empty array for the default query to prevent undefined
  // if one of the properties are not set
  var postIdList = [];

  // If everything is in order
  if (user && user.userActivity && user.userActivity.postInteraction) {

    var activityType = Meteor.precariMethods.activity.COMMENT;
    var postInteractions = user.userActivity.postInteraction;

    // Search the postInteraction array for all entries of type 'comment'
    var comments = _.where(postInteractions, { type: activityType });

    // From within the comment array, get all of the postIds to use in the
    // query selector
    postIdList = _.pluck(comments, 'postId');
  }

  // Restrictions / visibility
  // * Get posts unless set to private
  // * Hide private data

  // Get all posts matching the IDs in the list
  return Posts.find(
    {
      "_id": { "$in": postIdList },
      $or: [
              { visibility: Meteor.precariMethods.visibility.LINK },
              { visibility: Meteor.precariMethods.visibility.TAG },
              { visibility: Meteor.precariMethods.visibility.PUBLIC },
           ],
    },
    options,
    {
      fields:
      { privateTags: false }
    }
  );
});

// -------------------------- Tag publications ---------------------------------

/**
 * Publishes the list of a specific user's tags
 * @return collection PrivateTag collection of a user's tags
 */
Meteor.publish('userPrivateTags', function() {

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
