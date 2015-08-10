// ---------------------------- Template helpers -------------------------------

Template.postItem.helpers({

  /**
   * Returns a boolean value if the current user owns this post.
   * @return boolean True if the logged in user owns the post, otherwise false
   */
  ownPost: function() {
    return this.userId == Meteor.userId();
  },

  /**
   * Returns the CSS class name for the button indicating if the user
   * has prayed, or not.
   */
  prayedForClass: function() {
    var userId = Meteor.userId();

    // If user not logged in, disable able. Otherwise, display button
    // based on the user action (if they clicked prayed button, or not)
    if (!userId) {
      return 'disabled';
    } else if (!_.include(this.precatis, userId)) {
      return 'btn-primary prayable';
    } else {
      return 'btn-success disabled';
    }
  },

  /**
   * Returns the text indicating if the user has prayed for the request, or not
   */
  userPrayed: function() {
    var userId = Meteor.userId();

    // If logged in and clicked the payed button, display thank you.
    if (!userId || !_.include(this.precatis, userId)) {
      return 'I prayed!';
    } else {
      return 'Thank you!';
    }
  },

  /**
   * Gets the key value pair of the tag for the pathFor route
   */
  tagNameKVPair: function() {
    return {name: this};
  }

});

// ---------------------------- Template events -------------------------------

Template.postItem.events({

  /**
   * Click event for the pryaed for button
   */
  'click .prayable': function(e) {
    e.preventDefault();
    Meteor.call('prayedFor', this._id);
  }
});
