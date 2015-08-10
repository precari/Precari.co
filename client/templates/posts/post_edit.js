Template.postEdit.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('postEditErrors', {});
});

Template.postEdit.helpers({

  // Returns the value regarless of an error or not
  errorMessage: function(field) {
    return Session.get('postEditErrors')[field];
  },

  // If the field has an error, return the class 'has-error'
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
  }
});

Template.postEdit.events({
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    var currentPostId = this._id;

    // Get the data from the fields
    var postProperties = {
      prayer_request: $(e.target).find('[name=prayer_request]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    // Validate the data and return any errors
    var errors = validatePost(postProperties);
    if (errors.title || errors.prayer_request) {
      return Session.set('postEditErrors', errors);
    }

    Posts.update(currentPostId, {$set: postProperties}, function(error) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
      } else {
        Router.go('postPage', {_id: currentPostId});
      }
    });
  },

  'click .delete': function(e) {

    // prevents the browser from handling the event
    e.preventDefault();

    // Prompt user to delete and process accordingly
    if (confirm("Delete this request?")) {
      var currentPostId = this._id;
      Posts.remove(currentPostId);
      Router.go('home');
    }
  }
});