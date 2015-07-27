Template.commentSubmit.onCreated(function() {

  // Initialize the session collection to store errors
  Session.set('commentSubmitErrors', {});
});

Template.commentSubmit.helpers({

  // Returns the value regarless of an error or not
  errorMessage: function(field) {
    return Session.get('commentSubmitErrors')[field];
  },

  // If the field has an error, return the class 'has-error'
  errorClass: function (field) {
    return !!Session.get('commentSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.commentSubmit.events({

  // prevents the browser from handling the event and submitting the form
  'submit form': function(e, template) {
    e.preventDefault();

    // Get the data from the fields
    var $body = $(e.target).find('[name=body]');
    var comment = {
      body: $body.val(),
      postId: template.data._id
    };

    // Clear the errors and verify there is a comment
    var errors = {};
    if (!comment.body) {
      errors.body = "Please write some content";
      return Session.set('commentSubmitErrors', errors);
    }

    // Insert the comment or throw error
    Meteor.call('commentInsert', comment, function(error, commentId) {
      if (error){
        throwError(error.reason);
      } else {
        $body.val('');
      }
    });
  }
});
