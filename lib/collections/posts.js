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

    // may only edit the following fields:
    return (_.without(fieldNames,
              'prayerRequest', 'title', 'tags', 'privateTags').length > 0);
  }
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {

    // If post validation fails, the post is denied
    var errors = validatePost(modifier.$set);
    return errors.title || errors.prayerRequest || errors.tags || errors.privateTags;
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

  if (!post.prayerRequest) {
    errors.prayerRequest =  "Please add a prayer request";
  }

  if (post.tags.length <= 0 && post.privateTags.length <= 0) {
    errors.tags =  "Please add at least one public or private tag";
    errors.privateTags =  "Please add at least one public or private tag";
  }

  return errors;
};

// ------------------------- Meteor methods -----------------------------------

Meteor.methods({

  /**
   * Inserts the post into the Posts collection
   * @param collection postData The data required for the post.
   * @return string The id of the inserted post, if successful. Otherwise,
   *                generates an error.
   */
  postInsert: function(postData) {

    // verify the arg data
    check(this.userId, String);
    check(postData, {
      title: String,
      prayerRequest: String,
      tags: [String],
      privateTags: [String],
      private: Boolean,
    });

    // Non-UI errors. Hopefully the user never sees these
    var errors = validatePost(postData);
    if (errors.title || errors.prayerRequest || errors.tags || errors.privateTags) {
      var msg = 'You must set a title, description, and add at least one tags for your request';
      throw new Meteor.Error('invalid-post', msg);
    }

    // Format private tags as private
    postData.privateTags = Meteor.call('formatTagsPrivate', postData.privateTags);

    // All is good. Set the post data
    var user = Meteor.user();
    var post = _.extend(postData, {
      userId: user._id,       // unique id of the author
      author: user.profile.name,  // username of the author
      submitted: new Date(),  // date created
      commentsCount: 0,       // the number of comments
      precatis: [],           // precatis: those who prays. (pray-ers didn't work)
      prayedCount: 0         // the number of times prayed for
    });

    // Insert the post into the collection
    var postId = Posts.insert(postData);

    // Insert the tags into the Tag collection (private tags are not stored in
    // the tags collection)
    Meteor.call('tagInsertByArray', postData.tags);

    return {
      _id: postId
    };
  },

  /**
   * Updates the post into the Posts collection
   * @param collection postData The data required for the post.
   * @param collection postMetadata Additional data about the post
   * @return string The id of the updated post, if successful. Otherwise,
   *                generates an error.
   */
  postUpdate: function(postData, postMetadata) {

    // verify the arg data
    check(this.userId, String);
    check(postData, {
      title: String,
      prayerRequest: String,
      tags: [String],
      privateTags: [String],
      private: Boolean
    });
    check(postMetadata, {
      postId: String,
    });

    // Non-UI errors. Hopefully the user never sees these
    var errors = validatePost(postData);
    if (errors.title || errors.prayerRequest || errors.tags || errors.privateTags) {
      var msg = 'You must set a title, description, and add at least one tags for your request';
      throw new Meteor.Error('invalid-post', msg);
    }

    // Format private tags as private
    postData.privateTags = Meteor.call('formatTagsPrivate', postData.privateTags);

    // Update the post
    Posts.update(postMetadata.postId, {$set: postData});

    // Update/Insert any tags (private tags are not stored in the Tags collection)
    Meteor.call('tagInsertByArray', postData.tags);

    // Return the post ID
    return {
      _id: postMetadata.postId
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
  },
});
