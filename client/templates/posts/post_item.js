// ---------------------------- Template helpers -------------------------------

Template.postItem.helpers({

  /**
   * Returns a boolean value if the current user owns this post.
   * @return boolean True if the logged in user owns the post, otherwise false
   */
  ownPost: function() {
    return this.userId === Meteor.userId();
  },

  /**
   * Returns the CSS class name for the style based on the type of post.
   * (private or private). This alerts the user as to which of their posts
   * are private or public
   */
  getPostSubClass: function() {

    // If post is flagged as private, set selector
    if (this.private) {
      return 'bg-warning';
    } else {
      return 'default';
    }
  },

  /**
   * Returns the CSS class name for the button indicating if the user
   * has prayed, or not.
   */
  prayedForClass: function() {
    var userId = Meteor.userId();

    // If user logged in, display button based on the user action
    // (if they clicked prayed button, or not)
    if (userId) {
      if (!_.include(this.precatis, userId)) {
        return 'btn-primary prayable';
      } else {
        return 'btn-success disabled';
      }
    }
  },

  /**
   * Adds Bootstraps disabled icon on mouse over for users not logged in
   */
  disabled: function() {

    if (!Meteor.userId()) {
      return "disabled";
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
   * Converts the private tag array to a KV pair for display in template
   * @return array KV pair array of the tags
   */
  publicTags: function() {
    return Blaze._globalHelpers.convertTagsArrayToKVPair(this.publicTags);
  },

  /**
   * Converts the private tag array to a KV pair for display in template.
   *  Note: not all subscriptions return private tags
   * @return array KV pair array of the tags
   */
  privateTags: function() {
    return Blaze._globalHelpers.convertTagsArrayToKVPair(this.privateTags);
  },
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
