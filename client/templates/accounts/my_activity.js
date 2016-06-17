
// --------------------------- Template helpers --------------------------------

Template.myActivity.helpers({

  /**
   * Determines if use has prayed
   * @return Boolean True if the use has prayed at least once, otherwise false
   */
  hasPrayed: function() {

    var results = _.where(interactionArray(), {
      type: Meteor.precariMethods.activity.PRAY
    });

    return (results.length > 0);
  },

  /**
   * Determines if use has commented.
   * @return Boolean True if the use has commented at least once, otherwise false
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
