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
   * Adds Bootstraps disabled icon on mouse over for users not logged in
   */
  disabled: function() {

    if (!Meteor.userId()) {
      return "disabled";
    }
  },

  userPrayed: function() {
    return userPrayed(this);
  },

  /**
   * Returns the CSS class name for the button indicating if the user
   * has prayed, or not.
   */
  prayedForClass: function() {

    // If user logged in, display button based on the user action
    // (if they clicked prayed button, or not)
    if (Meteor.userId()) {
      if (userPrayed(this)) {
        return 'btn-success disabled';
      } else {
        return 'btn-primary prayable';
      }
    }
  },

  /**
   * Gets the duration of when the user last prayed with unit text
   */
  lastPrayedDuration: function() {

    // If no user activity and this function gets called, return default
    if (!Meteor.user().userActivity) {
      return calculateTimeDifference(Date.now());
    }

    var postInteractions = Meteor.user().userActivity.postInteraction;
    var posts = _.where(postInteractions, {postId: this._id}, {type: 'pray'});

    // Retrieve the record
    if (!posts) {
      return 'no record found';
    } else if (posts.length > 0) {
      // query returned array; get last item in the list and get duration
      return calculateTimeDifference(posts[posts.length-1].date);
    } else {
      // returned single record; get duration
      return calculateTimeDifference(posts.date);
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

/**
 * Determines if the user prayed for the post
 * @param object post The post containing the prayer information
 * @return Boolean True if the user was found in the prayed list, otherwise false
 */
var userPrayed = function(post) {
  var userId = Meteor.userId();

  if (userId && _.include(post.precatis, userId)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Calculates the different of an earlier time and the current time and returns
 * the units with the largest value (days, hours, minutes). If no days different,
 * returns hours, if not hours different, returns minutes.
 * @param Date time The earlier time to get the difference between
 * @return String Returns the difference of time with units.
 */
var calculateTimeDifference = function(time) {

  var diffMs = (new Date() - time); // milliseconds between now & earlier time
  var diffDays = Math.round(diffMs / 86400000);                       // days
  var diffHrs = Math.round((diffMs % 86400000) / 3600000);            // hours
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

  if (diffDays > 0) {
    return Blaze._globalHelpers.pluralize(diffDays, 'day');
  } else if (diffHrs > 0) {
    return Blaze._globalHelpers.pluralize(diffHrs, 'hour');
  } else {
    return Blaze._globalHelpers.pluralize(diffMins, 'minute');
  }
};
