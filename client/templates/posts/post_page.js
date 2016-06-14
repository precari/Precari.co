Template.postPage.helpers({

  // Gets the comments for the current post
  comments: function() {
    return Comments.find({postId: this._id});
  },

  /**
   * Adds the truncate flag to the object to be handled by the child template
   */
  addDisplayFullMessageFlag: function() {
    this.displayFullMessage = true;
    return this;
  },

});
