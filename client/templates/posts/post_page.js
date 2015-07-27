Template.postPage.helpers({

  // Gets the comments for the current post
  comments: function() {
    return Comments.find({postId: this._id});
  }
});
