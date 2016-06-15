// The collection for comments
Comments = new Mongo.Collection('comments');

Comments.schema = new SimpleSchema({
  body:        { type: String, },
  postId:      { type: String, },
  userId:      { type: String, },
  author:      { type: String, },
  submitted:   { type: Date, defaultValue: new Date(), }
});

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
      author: user.profile.name,
    });

    // update the post with the number of comments
    Posts.update(comment.postId, {$inc: {commentsCount: 1}});

    // create the comment, save the id
    Comments.schema.clean(comment);
    Comments.schema.validate(comment);
    comment._id = Comments.insert(comment);

    // now create a notification, informing the user that there's been a comment
    createCommentNotification(comment);

    // Log the user's activity to their account
    Meteor.call('logUserActivity', commentAttributes.postId,
      Meteor.precariMethods.activity.COMMENT);

    return comment._id;
  }
});
