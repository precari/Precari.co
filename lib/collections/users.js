
UsersSchema = {};

// Schema info for user profile fields
UsersSchema.UserProfile = new SimpleSchema({
  name: {
      type: String,
  },
  // Flag for determining if account is real, or a burner.
  burner: {
      type: Boolean,
  },
});

// Schema info for user activity
UsersSchema.UserActivity = new SimpleSchema({
  // User's activity about posts they've interacted with
  postInteraction: {
    type: Array,
    optional: true,
  },
  "postInteraction.$": {
      type: Object,
  },
  // The id of the post
  "postInteraction.$.postId": {
      type: String,
  },
  // Type of activity (prayed, commented)
  "postInteraction.$.type": {
      type: String,
  },
  // Date/time of the activity
  "postInteraction.$.date": {
      type: Date,
  },
});

// UsersSchema.User info is from: https://github.com/aldeed/meteor-collection2

UsersSchema.User = new SimpleSchema({
  username: {
    type: String,
    // Accounts-password package valides this
    optional: true
  },
  emails: {
    type: Array,
    // Accounts-password package valides this
    optional: true
  },
  "emails.$": {
    type: Object
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
      type: Date
  },
  profile: {
    type: UsersSchema.UserProfile,
  },
  userActivity: {
    type: UsersSchema.UserActivity,
    optional: true,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  // Add `roles` to your schema if you use the meteor-roles package.
  // Option 1: Object type
  // If you specify that type as Object, you must also specify the
  // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
  // Example:
  // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
  // You can't mix and match adding with and without a group since
  // you will fail validation in some cases.
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  },
  // In order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true
  }
});

// Attach schema to verify required information and prevent rogue data
Meteor.users.attachSchema(UsersSchema.User);

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

  /**
   * Verifies that the logged in user is removing their own account
   *
   * @param String userId The ID of the user making the request
            (automatically passed in)
   *
   * @return boolean If the userId does not match the logged in user,
              true is returned. Otherwise, false
   */
  remove: function(userId){

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
        if (error) {
          throw new Meteor.Error('updateError', error);
        }
      }
    );
  },

  /**
   * Logs data to the user's account
   * @param String postId The ID of the post activity to log
   * @param ENUM activity Enum type from Meteor.precariMethods.activity
   */
  logUserActivity: function(postId, activityType) {

    // Verify a user is logged in and the post id is exists
    check(this.userId, String);
    check(postId, String);
    check(activityType, String);

    if (activityType !== Meteor.precariMethods.activity.PRAY &&
        activityType !== Meteor.precariMethods.activity.COMMENT) {

        // Wrong activity type.
        throw new Meteor.Error
          ('invalidActivityType', "The activity type could not be located.");
    }

    // Build data to log
    var postInteraction = {
            postId:   postId,
            type:     activityType,
            date:     new Date(),
          };

    // Push the data to the user account
    Meteor.users.update(
      { _id: Meteor.user()._id },
      { $push: { 'userActivity.postInteraction': postInteraction } },
      function(error) {
        if (error) {
          throw new Meteor.Error('updateError', error);
        }
    });
  },

  /**
   * Deletes the logged in user
   */
  deleteUser: function() {

    // Check the user ID type
    check(this.userId, String);
    Meteor.users.remove(this.userId);
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
  if (!Meteor.precariMethods.validateEmail(email) && !errors.email) {
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
