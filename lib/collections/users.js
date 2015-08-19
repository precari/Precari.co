// --------------------------- User deny statements ----------------------------

// Verifies the user
Meteor.users.deny({

  /**
   * Verifies that the logged in user is modifying their own profile
   *
   * @param String userId The ID of the user making the request
            (automatically passed in)
    *
    * @return boolean If the userId does not match the logged in user,
              true is returned. Otherwise, false
   */
     update: function(userId){

    // If userId matches logged in user, return false
    return !ownsUserId(userId);
  },
});

// Verifies only specified fields are updated
Meteor.users.deny({

  /**
   * Checks and validates each field prior to updating. If the field is not
   * on the whitelist, the update fails.
   *
   * @param String userId The ID of the user making the request
            (automatically passed in)
   * @param object user The user data object to updated (pre-updated state)
            (automatically passed in)
   * @param object fieldNames The field names of the user object to update
            (sent from Meteor.users.update( ... ) in profile_edit.js)
    *
    * @return boolean If any field name is is not located, true is returned.
              Otherwise, false
   */
    update: function(userId, user, fieldNames){

      // A zero length says that the text (i.e. profile) was located.
      // If the text (i.e. profile) is not located, 'profile' is returned and
      // thus creating a true condition

      if (isLocalProfile) {
        return (_.without(fieldNames, 'emails', 'username', 'profile').length > 0);
      } else {
        return (_.without(fieldNames, 'profile').length > 0);
      }
    }
});

// Validates the modifier (data to update in the collection)
Meteor.users.deny({

  /**
   * Checks and validates each value prior to updating. If any value fails
   * the validationg test, the update fails.
   *
   * @param String userId The ID of the user making the request
            (automatically passed in)
   * @param object user The user data object to updated (pre-updated state)
            (automatically passed in)
   * @param object fieldNames The field names of the user object to update
            (sent from Meteor.users.update( ... ) in profile_edit.js)
   * @param object modifier The new values from { $set: profileProperties}
            (sent from Meteor.users.update( ... ) in profile_edit.js)
    *
    * @return boolean If any errors, true is returned. Otherwise, false
   */
  update: function(userId, user, fieldNames, modifier) {

    // If post validation fails, the post is denied
    var errors = validateProfile(modifier.$set);
    return errors.name;
  }
});

// -------------------------- Meteor methods -----------------------------------

Meteor.methods({

  /**
   * Updates the user profile
   * @param Object profileProperties The new user profile data
   * @return Object Error object is any update errors
   */
   profileUpdate: function(profileProperties) {

    // Perform necessary type validations
    check(this.userId, String);

    if (isLocalProfile()) {
      check(profileProperties, {
        profile: { name: String },
        emails: [{address: String}],
        username: String
      });
    } else {
      check(profileProperties, {
        profile: { name: String }
      });
    }

    // Update the user profile
    Meteor.users.update(
    { _id: Meteor.user()._id }, { $set: profileProperties}, function(error) {

      return error;
    });
  }
});

// ------------------------ Validation/other methods ---------------------------

/**
 * Determines if the current use has a local account, or an OAuth account
 * @return Boolean True if the user has a local account, otherwise false
 */
isLocalProfile = function() {

  var user = Meteor.user();

  if (user.username) {
    return true;
  } else {
    return false;
  }
};

/**
 * Determines which account type to validate and validates the data
 * @param object profileProperties The user data to validate
 * @return collection Any generated error. An empty collection if no errors.
 */
 validateProfile = function(profileProperties) {

  if (isLocalProfile()) {
    return validateLocalProfile(profileProperties);
  } else {
    return validateOAuthProfile(profileProperties);
  }
};

/**
 * Validates the local profile data before allowing the update
 * @param object profileProperties The user data to validate
 * @return collection Any generated error. An empty collection if no errors.
 */
validateLocalProfile = function (profileProperties) {
  // Clear any errors
  var errors = {};

  var profile = profileProperties.profile;
  var email = profileProperties.emails[0].address;
  var username = profileProperties.username;

  // Validate the data
  if (!profile.name || profile.name.trim().length <= 0) {
    errors.name = "Please add a name";
  }
  if (!email || email.trim().length <= 0) {
    errors.email = "Please add an email address";
  }
  if (!username || username.trim().length <= 0) {
    errors.username = 'Please add a username';
  }
  if (!Meteor.precariFunctions.validateEmail(email) && !errors.email) {
    errors.email = 'Invalid email format. Please format using: name@domain.abc';
  }

  return errors;
};

/**
 * Validates the OAuth profile data before allowing the update
 * @param object profileProperties The user data to validate
 * @return collection Any generated error. An empty collection if no errors.
 */
validateOAuthProfile = function (profileProperties) {
  // Clear any errors
  var errors = {};

  var profile = profileProperties.profile;

  // Validate the data
  if (!profile.name || profile.name.trim().length <= 0) {
    errors.name = "Please add a name";
  }

  return errors;
};
