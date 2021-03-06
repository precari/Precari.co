// -------------------------- Template onCreated -------------------------------

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

      if (!user || !user.profile) {
        return '';
      } else {
        return user.profile.name;
      }
    },

    // Get the email address
    email: function() {
      var user = Meteor.user();

      if (user && user.emails && user.emails[0]) {
        return user.emails[0].address;
      }
    },

    // Get the username
    username: function() {
      var user = Meteor.user();

      if (user && user.username) {
        return user.username;
      }
    },

    // Gets the burner boolean
    burner: function() {
      var user = Meteor.user();

      if (!user || !user.profile) {
        return false;
      } else {
        return user.profile.burner;
      }
    },
});

// --------------------------- Template event methods --------------------------

Template.profileEdit.events({

  /**
   * On form submit, update the user's profile
   */
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    var profileProperties = {};
    var errors = {};

    // Build the profile data to update and perform client side validation.
    //  Profiles are different for a locally created account or for an
    // OAuth account.

    if (isLocalProfile()) {
      // Get the locally created account data to update
      profileProperties = getLocalAccountProfileProperties(e);

      // validate the data and check for errors
      errors = validateProfile(profileProperties);
      if (errors.name || errors.email || errors.username ) {
        return Session.set('profileEditErrors', errors);
      }
    } else {
      // Get the OAuth account data to update
      profileProperties = getOAuthAccountProfileProperties(e);

      // validate the data and check for errors
      errors = validateProfile(profileProperties);
      if (errors.name) {
        return Session.set('profileEditErrors', errors);
      }
    }

    // Update the profile
    Meteor.call('profileUpdate', profileProperties, function(error, result) {

      // Clear errors for UI
      Session.set('profileEditErrors', {});

      // Display the error to the user and abort
      if (error) {
        return throwError('Update failed: ' + error.reason);
      } else {
        return throwSuccess('Profile successfully updated');
      }
    });
  },

  /**
   * On click delete button, prompt user to delete their account
   */
  'click .delete': function(e) {

    // prevents the browser from handling the event
    e.preventDefault();

    // Prompt user to delete and process accordingly
    if (confirm('Are you sure you want to delete your account?')) {

        // Delete the user
        Meteor.call('deleteUser', Meteor.userId(), function(error, result) {

          // Display the error to the user and abort
          if (error) {
            return throwError('Delete failed: ' + error.reason);
          } else {

            Router.go('home');
            // TODO: Implement naxio:flash. This requires a CSS fix
            // Flash.success('top', 'Profile successfully updated', 5000, true);
          }
    	 });
    }
  }
});

// ------------------------------- Other methods -------------------------------

/**
 * Determines which account type to get the profileProperties for and
 * retrieves them
 * @param object e The event object containing the new data from the forms
 * @return object The profileProperties object containing the data to update
 */
 getProfileProperties = function(e) {

  if (isLocalProfile()) {
    return getLocalAccountProfileProperties(e);
  } else {
    return getOAuthAccountProfileProperties(e);
  }
};

/**
 * Get the user data to update for an account created locally
 * @param object e The event object containing the new data from the forms
 * @return object The profileProperties object containing the data to update
 */
function getLocalAccountProfileProperties(e) {

    // Get the name and trimming an leading or trailing spaces
    var name = getControlValue(e, 'display-name');
    var email = getControlValue(e, 'email');
    var username = getControlValue(e, 'username');

    // Build the profile data to update
    var profileProperties = {
      'profile': { name: name },
      'emails': [{address: email}],
      'username': username
    };

    return profileProperties;
}

/**
 * Get the user data to update for an OAuth account (Google, Facebook, etc.)
 * @param object e The event object containing the new data from the forms
 * @return object The profileProperties object containing the data to update
 */
function getOAuthAccountProfileProperties(e) {

  // Get the name and trimming an leading or trailing spaces
  var name = getControlValue(e, 'display-name');

  // Build the profile data to update
  var profileProperties = {
    'profile': { name: name },
  };

  return profileProperties;
}

/**
 * Get the text value from a form control
 * @param object e The event object containing the new data from the forms
 * @param String name The name of the control to get the data from
 * @return String The value from the control
 */
function getControlValue(e, name) {

    var control = $(e.target).find('[name=' + name + ']');

    if (control && control.val()) {
      return control.val().trim();
    } else {
      return '';
    }
}
