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
   * Converts the tag array to a KV pair for display in template.
   * @return array KV pair array of the tags
   */
  privateTags: function() {

    // If no privetags or the user does not own the post, continue.
    if (this.privateTags === undefined || Meteor.userId() !== this.userId) {
      return;
    }

    // The tags in the post are only stored as the human readable form (label)
    // The actual tag name (the private key) needs to be retried from the
    // user's private tags collection.

    // If the user (logged in or not) has no prive tags, continue
    // Otherwise, perform a lookup of the users tags to the tags in the post
    if (PrivateTags.find().count() > 0) {
      return Blaze._globalHelpers.getFullPrivateTagObj(this.privateTags);
    }
  },

  /**
   * Truncates the body message
   * @return string The message body, either in full or truncated
  */
  bodyMessage: function() {

    var truncateLength =
      parseInt(Meteor.settings.public.truncateBodyMessageLength);

    if (truncateBodyState(this)) {
      return this.bodyMessage.substring(0, truncateLength ) + '... ';
    } else {
      return this.bodyMessage;
    }
  },

  /**
   * Gets the state of the body message and if it was truncated, or not
   * @return Boolean True if the body was truncated, otherwise False
   */
  truncatedBody: function() {
    return truncateBodyState(this);
  },

  /**
   * Gets the glyphicon matching the visibility level
   * @return string The value of the glyphicon
  */
  visibliltyGlyphicon: function() {

    var glyphicon = '';

    switch (this.visibility) {
      case Meteor.precariMethods.visibility.PRIVATE:
        glyphicon = 'glyphicon glyphicon-eye-close';
        break;
      case Meteor.precariMethods.visibility.LINK:
        glyphicon = 'glyphicon glyphicon-link';
        break;
      case Meteor.precariMethods.visibility.TAG:
        glyphicon = 'glyphicon glyphicon-tag';
        break;
      case Meteor.precariMethods.visibility.PUBLIC:
        glyphicon = 'glyphicon glyphicon-globe';
        break;
      default:
      break;
    }

    return glyphicon;
  },

});

// ---------------------------- Template events -------------------------------

Template.postItem.events({

  /**
   * Click event for the prayed for button
   */
  'click .prayable': function(e) {
    e.preventDefault();
    Meteor.call('prayedFor', this._id);
  }
});

// ---------------------------- Helper methods -------------------------------

/**
 * Determines if the message body should be truncated, or not
 * @param object post The post containing the body message
 * @return Boolean True to truncate, otherwise False
 */
 var truncateBodyState = function(post) {

   var truncateLength =
    parseInt(Meteor.settings.public.truncateBodyMessageLength);

   if (!post.displayFullMessage && post.bodyMessage.length > truncateLength) {
     return true;
   } else {
     return false;
   }
};
