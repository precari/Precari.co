Template.postItem.helpers({
  ownPost: function() {
    return this.userId == Meteor.userId();
  },
  prayedForClass: function() {
    var userId = Meteor.userId();

    // If user not logged in, disable able. Otherwise, display button
    // based on the user action
    if (!userId) {
      return 'disabled';
    } else if (!_.include(this.precatis, userId)) {
      return 'btn-primary prayable';
    } else {
      return 'btn-success disabled';
    }
  },
  userPrayed: function() {
    var userId = Meteor.userId();

    // If logged in and clicked the payed button, display thank you.
    if (!userId || !_.include(this.precatis, userId)) {
      return 'I prayed!';
    } else {
      return 'Thank you!';
    }
  }
});

Template.postItem.events({
  'click .prayable': function(e) {
    e.preventDefault();
    Meteor.call('prayedFor', this._id);
  }
});
