// The collection for notifications
Notifications = new Mongo.Collection('notifications');

// For allow / deny explanation, see https://book.discovermeteor.com/chapter/allow-and-deny
// If one allow is true, then the allow condition is satisfied

Notifications.allow({

  /*
    Verifies:
      * The user making the update call owns the notification being modified.
      * The user is only trying to update a single field.
      * That single field is the read property of our notifications.
  */
  update: function(userId, doc, fieldNames) {
    return ownsDocument(userId, doc) &&
      fieldNames.length === 1 && fieldNames[0] === 'read';
  }
});

// Add the notification and determine who to notify concerning the comment
createCommentNotification = function(comment) {
  var post = Posts.findOne(comment.postId);
  if (comment.userId !== post.userId) {
    Notifications.insert({
      userId: post.userId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false
    });
  }
};
