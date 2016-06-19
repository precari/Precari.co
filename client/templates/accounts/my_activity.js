
// The most number of posts to retieve for the post count
var maxPosts = 99;

// --------------------------- Template helpers --------------------------------

Template.myActivity.helpers({

  /**
   * Gets the number of the user's private posts
   * @return String the number of user's private posts
   */
  privatePostCount: function() {

    var count = postCount(Meteor.precariMethods.visibility.PRIVATE);

    if (count < maxPosts) {
      return count;
    } else {
      return count + '+';
    }
  },

  /**
   * Gets the number of the user's posts set to link only
   * @return String the number of user's posts set to link
   */
  linkPostCount: function() {

    var count = postCount(Meteor.precariMethods.visibility.LINK);

    if (count < maxPosts) {
      return count;
    } else {
      return count + '+';
    }
  },

  /**
   * Gets the number of the user's posts set to tag
   * @return String the number of user's posts set to tag
   */
  tagPostCount: function() {

    var count = postCount(Meteor.precariMethods.visibility.TAG);

    if (count < maxPosts) {
      return count;
    } else {
      return count + '+';
    }
  },

  /**
   * Gets the number of the user's public posts
   * @return String the number of user's public posts
   */
  publicPostCount: function() {

    var count = postCount(Meteor.precariMethods.visibility.PUBLIC);

    if (count < maxPosts) {
      return count;
    } else {
      return count + '+';
    }
  },

  /**
   * Determines if user has prayed
   * @return Boolean True if the user has prayed at least once, otherwise false
   */
  hasPrayed: function() {

    var results = _.where(interactionArray(), {
      type: Meteor.precariMethods.activity.PRAY
    });

    return (results.length > 0);
  },

  /**
   * Determines if user has commented.
   * @return Boolean True if the user has commented at least once, otherwise false
   */
  hasCommented: function() {

    var results = _.where(interactionArray(), {
      type: Meteor.precariMethods.activity.COMMENT
    });

    return (results.length > 0);
  },

  /**
   * Returns the reverse-sorted post interaction list
   */
  postInteraction: function() {

    return _.sortBy(
      interactionArray(), function(obj) { return obj.date; }
    ).reverse();
  },

  /**
   * Returns and icon/glyph to represent the type of activity
   */
  type: function(type) {

    var glyph = '';

    switch (type) {
      case Meteor.precariMethods.activity.PRAY:
          glyph = '🙏';
        break;
      case Meteor.precariMethods.activity.COMMENT:
          glyph = '💬';
        break;
      default:
        glyph = '❔';
    }
    return glyph;
  }
});

// ---------------------------- Helper methods -------------------------------

/**
 * Gets the postInteraction array
 * @return Array postInteraction array if exists, or an empty array
 */
var interactionArray = function() {

    if (Meteor.user() && Meteor.user().userActivity) {
      return Meteor.user().userActivity.postInteraction;
    } else {
      return [];
    }
};

/**
 * Gets the number of posts for a given visibility type
 * @param Meteor.precariMethods.activity visibility The visibility of the posts
 * @return Integer The number of posts, up to the maximum, of the given type
 */
var postCount = function(visibility) {

  var findOptions = { sort: { submitted: -1, _id: -1 }, limit: maxPosts };
  Meteor.subscribe('usersOwnPostsWithVisibility', findOptions, visibility);
  var post = Posts.find({visibility: visibility});

  if (post) {
    return post.count();
  } else {
    return 0;
  }
};
