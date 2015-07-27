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

// Validates the post before allowing the submissions
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
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      precatis: [],         // precatis: those who prays. (pray-ers didn't work)
      prayedCount: 0
    });

    // Insert the post into the collection
    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  },

  // A user clicked the 'prayed for' button. Mark the request as prayed for
  prayedFor: function(postId) {

    // Verify a user is logged in and the post id is exists
    check(this.userId, String);
    check(postId, String);

    // Update the post
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
