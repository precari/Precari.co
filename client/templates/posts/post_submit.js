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

    // Convert the string to an array
    var tagArray = Meteor.precariFunctions.convertCommaListToArray($(e.target).find('[name=tags]').val());

    // Get the data from the fields
    var postData = {
      prayer_request: $(e.target).find('[name=prayer_request]').val(),
      title: $(e.target).find('[name=title]').val(),
      tags: tagArray,
      private: $(e.target).find('[name=private-post]').is(':checked'),
    };

    // Additional data related to the post
    var postMetadata = {
      privateTags: $(e.target).find('[name=private-tags]').is(':checked')
    };

    // Validate the data and return any errors
    var errors = validatePost(postData);
    if (errors.title || errors.prayer_request || errors.tags) {
      return Session.set('postSubmitErrors', errors);
    }

    // Insert the post
    Meteor.call('postInsert', postData, postMetadata, function(error, result) {

      // Display the error to the user and abort
      if (error) {
        return throwError(error.reason);
      }

      // Post has been submitted. Redirect to the new post
      Router.go('postPage', {_id: result._id});
    });
  }
});
