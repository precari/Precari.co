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
  },

  // If value is true, returns 'checked' for the checkbox
  checked: function (checked) {
    return checked ? 'checked' : '';
  }

});

Template.postEdit.events({
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    // Convert the string to an array
    var tagArray = Meteor.precariMethods.convertCommaListToArray
                                ($(e.target).find('[name=tags]').val());
    var privateTagArray = Meteor.precariMethods.convertCommaListToArray
                                ($(e.target).find('[name=private-tags]').val());

    // Get the data from the fields
    var postData = {
      prayerRequest: $(e.target).find('[name=prayer-request]').val(),
      title: $(e.target).find('[name=title]').val(),
      tags: tagArray,
      privateTags: privateTagArray,
      private: $(e.target).find('[name=private-post]').is(':checked'),
    };

    // Additional data related to the post
    var postMetadata = {
      postId: this._id,
    };

    // Validate the data and return any errors
    var errors = validatePost(postData);
    if (errors.title || errors.prayerRequest || errors.tags || errors.privateTags) {
      return Session.set('postEditErrors', errors);
    }

    // Update the post
    Meteor.call('postUpdate', postData, postMetadata, function(error, result) {

      // Display the error to the user and abort
      if (error) {
        return throwError(error.reason);
      }

      // Post has been updated. Redirect to the  post page.
      Router.go('postPage', {_id: result._id});
    });
  },

  'click .delete': function(e) {

    // prevents the browser from handling the event
    e.preventDefault();

    // Prompt user to delete and process accordingly
    if (confirm('Delete this request?')) {
      var currentPostId = this._id;
      Posts.remove(currentPostId);
      Router.go('home');
    }
  }
});
