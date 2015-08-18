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
      return (_.without(fieldNames, 'profile').length > 0);
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

// ---------------------------- Validation methods -----------------------------

/**
 * Validates the profile data before allowing the update
 * @param object user The user data to validate
 * @return collection Any generated error. An empty collection if no errors.
 */
validateProfile = function (user) {
  // Clear any errors
  var errors = {};

  // Validate the data
  if (!user.profile.name || user.profile.name.trim().length <= 0) {
    errors.name = "Please add a name";
  }

  return errors;
};
