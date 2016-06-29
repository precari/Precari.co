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

  /**
   * Determines if the user prayed for the request
   * @return Boolean True if the user prayed for the request at least once,
   *                  otherwise false
   */
  userPrayed: function() {
    return userPrayed(this.precatis);
  },

  /**
   * Gets the number of times the user prayed for the request
   * @return Boolean True if the user prayed for the request at least once,
   *                  otherwise false
   */
  userPrayedCount: function() {
    return userLastPrayedInfo(this._id).count;
  },

  /**
   * Gets the text for the button depending on whether or not the user has
   * prayed for the request
   * @return String The text for the prayedFor button
   */
  buttonText: function() {

    var neverPrayed =             'btn-primary prayable';
    var previouslyPrayed =        'btn-info prayable';
    var previouslyPrayedOnTimer = 'btn-success disabled';

    var text;

    switch (getPrayedForClass(this)) {
      case neverPrayed:
        text = 'Pray';
        break;
      case previouslyPrayed:
        text = 'Pray again';
        break;
      case previouslyPrayedOnTimer:
        text = 'Pray again later';
        break;
      default:
        text = 'Pray';
    }
    return text;
  },

  /**
   * Gets the CSS class name for the button indicating if the user
   * has prayed, or not.
   * @return String The class name for the prayedFor button
   */
  prayedForClass: function() {
    return getPrayedForClass(this);
  },

  /**
   * Gets the duration of when the user last prayed with unit text
   * @return String The duration and units of when the user last prayed
   */
  timeLastPrayed: function() {
    return moment(userLastPrayedInfo(this._id).date).fromNow();
  },

  /**
   * Converts the tag array to a KV pair for display in template.
   * @return Array KV pair array of the tags
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
   * @return String The message body, either in full or truncated
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
});

// ---------------------------- Template events -------------------------------

Template.postItem.events({

  /**
   * Click event for the prayed for button
   */
  'click .prayable': function(e) {
    e.preventDefault();
    Meteor.call('prayedFor', this._id);
  },

  'click .post .delete': function(e) {
    e.preventDefault();

    // Ask the user
    if (confirm("Delete request '" + this.title + "'?")) {
      var currentPostId = this._id;

      // Try removing each of the comments before removing the post
      _.each(Comments.find({postId: currentPostId}).fetch(), function (comment) {

        Meteor.call('commentRemove', comment, function(error, result) {
          if (error){
            throwError(error.reason);
          }
        });
      });

      // remove the post
      Posts.remove(currentPostId);
      Router.go('myPosts');
    }
  },
});

// ---------------------------- Helper methods -------------------------------

/**
 * Determines the CSS class name for the button indicating if the user
 * has prayed, or not.
 * @param Object post The current post
 * @return String The class name for the prayedFor button
 */
var getPrayedForClass = function(post) {

  var neverPrayed =             'btn-primary prayable';
  var previouslyPrayed =        'btn-info prayable';
  var previouslyPrayedOnTimer = 'btn-success disabled';

  // If not logged in, leave disabled. If not prayed for, mark as prayable
  if (!Meteor.userId()) {
    return;
  } else if (!userPrayed(post.precatis)) {
    return neverPrayed;
  }

  // Otherwise, the request has been prayed for, but we need to determine
  // if they can mark the request as prayed for again (prevents from running
  // up the counter, double clicks, etc.)

  var durationLimit =
    parseInt(Meteor.settings.public.prayAgainDurationInMinutes);
  var lastPrayedInfo = userLastPrayedInfo(post._id);

  // Get the duration, in minutes
  var ms = (new Date() - lastPrayedInfo.date);
  var minutes = Math.floor(ms / 60000);

  // Determine if the use can click the prayed button again
  if (minutes > durationLimit) {
    return previouslyPrayed;
  } else {
    return previouslyPrayedOnTimer;
  }
};

/**
 * Determines if the message body should be truncated, or not
 * @param Object post The post containing the body message
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
 * @param Array precatis The precatis list from the post
 * @return Boolean True if the user was found in the prayed list, otherwise false
 */
var userPrayed = function(precatis) {
  var userId = Meteor.userId();

  if (userId && _.include(precatis, userId)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Gets the time entry of when the user last prayed
 * @param String postId The ID of the post to get the information about
 * @return Date The date of when the user most recently prayed
 */
var userLastPrayedInfo = function(postId) {

  // If no user activity is found, return default (Date.now)
  if (!Meteor.user() || !Meteor.user().userActivity) {
    return Date.now();
  }

  var lastPrayed = {
    count: 0,
    date: Date.now(),
  };

  // The post contains the user's ID, now get the times prayed from the
  // logged in user's account.
  var postInteractions = Meteor.user().userActivity.postInteraction;
  var interactions = _.where(postInteractions, {
                        postId: postId,
                        type: Meteor.precariMethods.activity.PRAY
                      });

  // Retrieve the last prayed entry
  if (interactions.length > 0) {

    // _.where returned array; get last item in the list and get duration
    lastPrayed.count = interactions.length;
    lastPrayed.date = interactions[interactions.length-1].date;
    return lastPrayed;

  } else if (interactions.date) {

    // _.where returned single record; get duration
    lastPrayed.count = 1;
    lastPrayed.date = interactions.date;
    return lastPrayed;

  } else {
    return lastPrayed;
  }
};
