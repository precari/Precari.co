Template.notifications.helpers({

  // Gets any unread notifications
  notifications: function() {
    return Notifications.find({userId: Meteor.userId(), read: false});
  },

  // Ges the number of unread notifications
  notificationCount: function(){
  	return Notifications.find({userId: Meteor.userId(), read: false}).count();
  }
});

// Gets the path for the post of the notification
Template.notificationItem.helpers({
  notificationPostPath: function() {
    return Router.routes.postPage.path({_id: this.postId});
  }
});

// On click, set the notification as read
Template.notificationItem.events({
  'click a': function() {
    Notifications.update(this._id, {$set: {read: true}});
  }
});
