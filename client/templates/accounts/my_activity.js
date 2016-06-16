
// --------------------------- Template helpers --------------------------------

Template.myActivity.helpers({

  /**
   * Returns the reverse-sorted post interaction list
   */
  postInteraction: function() {

    if (Meteor.user() && Meteor.user().userActivity) {
      var interactions = Meteor.user().userActivity.postInteraction;
      return _.sortBy(interactions, function(obj) { return obj.date; }).reverse();
    }
  },

  /**
   * Returns and icon/glyph to represent the type of activity
   */
  type: function() {

    var glyph = '';

    switch (this.type) {
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
