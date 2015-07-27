Template.postSubmit.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('postSubmitErrors', {});
});

Template.postSubmit.helpers({

  // Returns the value regarless of an error or not
  errorMessage: function(field) {
    return Session.get('postSubmitErrors')[field];
  },

  // If the field has an error, return the class 'has-error'
  errorClass: function (field) {
    return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.postSubmit.events({
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    // Get the data from the fields
    var post = {
      prayer_request: $(e.target).find('[name=prayer_request]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    // Validate the data and return any errors
    var errors = validatePost(post);
    if (errors.title || errors.prayer_request) {
      return Session.set('postSubmitErrors', errors);
    }

    Meteor.call('postInsert', post, function(error, result) {

      // Display the error to the user and abort
      if (error) {
        return throwError(error.reason);
      }

      // Post has been submitted. Redirect to the new post
      Router.go('postPage', {_id: result._id});
    });
  }
});
