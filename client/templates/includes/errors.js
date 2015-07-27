Template.errors.helpers({

  // Returns all errors
  errors: function() {
    return Errors.find();
  }
});

Template.error.onRendered(function() {

  // Clear error after a set amout of time
  var error = this.data;
  Meteor.setTimeout(function () {
    Errors.remove(error._id);
  }, 3000);
});
