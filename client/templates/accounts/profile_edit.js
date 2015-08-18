Template.profileEdit.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('profileEditErrors', {});
});

// ---------------------------- Template helpers -------------------------------

Template.profileEdit.helpers({

    // Returns the value regardless of an error or not
    errorMessage: function(field) {
      return Session.get('profileEditErrors')[field];
    },

    // If the field has an error, return the class 'has-error'
    errorClass: function (field) {
      return !!Session.get('profileEditErrors')[field] ? 'has-error' : '';
    },

    // Gets the user name
    name: function() {
      var user = Meteor.user();

      if (user === null) {
        return '';
      } else {
        return user.profile.name;
      }
    },

    // Get the email address (experimental)
    email: function() {
      var user = Meteor.user();

      if (user.emails && user.emails[0]) {
        return user.emails[0].address;
      }
    }
});

Template.profileEdit.events({

  // Form sumbit event
  'submit form': function(e) {

  // prevents the browser from handling the event and submitting the form
  e.preventDefault();

  // Get the name and trimming an leading or trailing spaces
  var name = $(e.target).find('[name=display-name]').val().trim();

  // Build the profile data to update
  var profileProperties = {
    'profile': { name: name }
  };

  // validate the data and check for errors
  var errors = validateProfile(profileProperties);
  if (errors.name) {
    return Session.set('profileEditErrors', errors);
  }

  // Update the user profile
  Meteor.users.update(
    { _id: Meteor.user()._id }, { $set: profileProperties}, function(error) {
      if (error) {
       // display the error to the user
       throwError('Update failed: ' + error.reason);
      } else {
        // Clear errors for UI before refreshing the page
        Session.set('profileEditErrors', {});
        // TODO: Implement naxio:flash. This requires a CSS fix
        // Flash.success('top', 'Profile successfully updated', 5000, true);
      }
    });
  }
});
