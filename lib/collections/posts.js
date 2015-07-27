// The collection for posts
Posts = new Mongo.Collection('posts');

// For allow / deny explanation, see https://book.discovermeteor.com/chapter/allow-and-deny
// If one allow is true, then the allow condition is satisfied
// If one deny is true, then the request is denied

// Set the allow conditions
Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); },
});

Posts.deny({
  update: function(userId, post, fieldNames) {

    // may only edit the following two fields:
    return (_.without(fieldNames, 'prayer_request', 'title').length > 0);
  }
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {

    // If post validation fails, the post is denied
    var errors = validatePost(modifier.$set);
    return errors.title || errors.prayer_request;
  }
});

/**
 * Validates the post before allowing the submissions
 * @param collection post The post data to Validates
 * @return collection Any generated error. An empty collection if no errors.
 */
 validatePost = function (post) {

  // Clear any errors
  var errors = {};

  if (!post.title) {
    errors.title = "Please add a tile";
  }

  if (!post.prayer_request) {
    errors.prayer_request =  "Please add a prayer request";
  }

  return errors;
};

Meteor.methods({

  /**
   * Inserts the post into the Posts collection (or db)
   * @param collection postAttributes The attributes required for the post.
   * @return string The id of the inserted post, if successful. Otherwise,
   *                generates an error.
   */
  postInsert: function(postAttributes) {
    check(this.userId, String);
    check(postAttributes, {
      title: String,
      prayer_request: String
    });

    // Non-UI errors. Hopefully the user never sees these
    var errors = validatePost(postAttributes);
    if (errors.title || errors.prayer_request) {
      throw new Meteor.Error('invalid-post', "You must set a title and description for your request");
    }

    // All is good. Set the post data
    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,       // unique id of the author
      author: user.username,  // username of the author
      submitted: new Date(),  // date created
      commentsCount: 0,       // the number of comments
      precatis: [],           // precatis: those who prays. (pray-ers didn't work)
      prayedCount: 0,         // the number of times prayed for
      tags: []                // tags list for post
    });

    // Insert the post into the collection
    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  },

 /**
  * Updates/marks the post/request as prayed for
  * @param string postId The ID of the post to mark as prayed for
  */
  prayedFor: function(postId) {

    // Verify a user is logged in and the post id is exists
    check(this.userId, String);
    check(postId, String);

    // Update the post with who prayed for it and increment the counter.
    var affected = Posts.update({
      _id: postId,
      precatis: {$ne: this.userId}
    }, {
      $addToSet: {precatis: this.userId},   // Set who clicked the button
      $inc: {prayedCount: 1}                // Increment the button click count
    });

    // Oops. The update never happened. Send the message
    if (!affected) {
      throw new Meteor.Error('invalid', "You weren't able to mark that request as prayed for.");
    }
  }
});
