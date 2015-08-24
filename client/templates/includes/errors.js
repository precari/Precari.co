/**
 * This file contains the alert message template JS code
 */

/**
 *  Gets the timout for the alert messages
 */
var messageTimeout = function() {
  return 5000;
}

// -------------------------- Success Messages ---------------------------------

// Template for all warnings
Template.successMessagesContainer.helpers({

  // Returns all errors
  successMessages: function() {
    return SuccessMessages.find();
  }
});

// Template for a single information message
// On render, displays a single message
Template.successMessage.onRendered(function() {

  // Clear warning after a set amout of time
  var message = this.data;
  Meteor.setTimeout(function () {
    SuccessMessages.remove(message._id);
  }, messageTimeout());
});

// ---------------------------- Info Messages ----------------------------------

// Template for all warnings
Template.infoMessagesContainer.helpers({

  // Returns all errors
  infoMessages: function() {
    return InfoMessages.find();
  }
});

// Template for a single information message
// On render, displays a single message
Template.infoMessage.onRendered(function() {

  // Clear warning after a set amout of time
  var message = this.data;
  Meteor.setTimeout(function () {
    WarningMessages.remove(message._id);
  }, messageTimeout());
});

// ------------------------- Warning Messages ----------------------------------

// Template for all warnings
Template.warningMessagesContainer.helpers({

  // Returns all errors
  warningMessages: function() {
    return WarningMessages.find();
  }
});

// Template for a single warning
// On render, displays a single message
Template.warningMessage.onRendered(function() {

  // Clear warning after a set amout of time
  var message = this.data;
  Meteor.setTimeout(function () {
    WarningMessages.remove(message._id);
  }, messageTimeout());
});

// --------------------------- Error Messages ----------------------------------

// Template for all errors
Template.errorMessagesContainer.helpers({

  // Returns all errors
  errorMessages: function() {
    return ErrorMessages.find();
  }
});

// Template for a single error
// On render, displays a single message
Template.errorMessage.onRendered(function() {

  // Clear error after a set amout of time
  var message = this.data;
  Meteor.setTimeout(function () {
    ErrorMessages.remove(message._id);
  }, messageTimeout());
});
