// The collection for comments
Comments = new Mongo.Collection('comments');

Meteor.methods({

  // Validates and inserts comments
  commentInsert: function(commentAttributes) {
    check(this.userId, String);
    check(commentAttributes, {
      postId: String,
      body: String
    });

    var user = Meteor.user();
    var post = Posts.findOne(commentAttributes.postId);

    // Hopefully a user never sees this.
    if (!post) {
      throw new Meteor.Error('invalid-comment', 'You must comment on a request');
    }

    // Set the data in the object
    comment = _.extend(commentAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    // update the post with the number of comments
    Posts.update(comment.postId, {$inc: {commentsCount: 1}});

    // create the comment, save the id
    comment._id = Comments.insert(comment);

    // now create a notification, informing the user that there's been a comment
    createCommentNotification(comment);

    return comment._id;
  }
});
