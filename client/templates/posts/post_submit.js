
// -------------------------- Template onCreated -------------------------------

Template.postSubmit.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('postSubmitErrors', {});
});

// ---------------------------- Template helpers -------------------------------

Template.postSubmit.helpers({

  // Returns the value regarless of an error or not
  errorMessage: function(field) {
    return Session.get('postSubmitErrors')[field];
  },

  // If the field has an error, return the class 'has-error'
  errorClass: function (field) {
    return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
  },

  /**
   * Gets the list of public tags.
   */
  userPublicTags: function() {
    return PublicTags.find().fetch();
  },

  /**
   * Gets the list of private tags used by the user
   */
  userPrivateTags: function() {
    return PrivateTags.find().fetch();
  },
});

// ---------------------------- Template events -------------------------------

Template.postSubmit.events({

  /**
   * Supress the submitting of the form with the enter key
   * @param jQuery.Event e Event object containing the event data
   */
  'keypress form input[type="text"]': function(e) {

    // If enter key is pressed on the form, surpress the default action
    if(event.keyCode == 13 || e.keyCode == 188) {
      event.preventDefault();
      return false;
    }
  },

  /**
   * On keyup event, search for trigger keys and create a new tag from the
   * value in the input control
   * @param jQuery.Event e Event object containing the event data
   */
  'keyup input.tag-input-textbox': function (e) {

    // If comma ',' or carriage return, add tag
    if (e.keyCode == 13 || e.keyCode == 188) {
      var tagText = e.currentTarget.value;
      var tagType = Meteor.precariMethods.tagType.PRIVATE;

      // If public tag, mark public
      if (e.currentTarget.id.indexOf('public') >= 0) {
          tagType = Meteor.precariMethods.tagType.PUBLIC;
      }

      Blaze._globalHelpers.addTagToForm(tagType, tagText);
      e.currentTarget.value = '';
    }
  },

  /**
   * On loose focus event, add new tag from the value in the input control
   * @param jQuery.Event e Event object containing the event data
   */
  'blur .tag-input-textbox': function (e) {

      var tagText = e.currentTarget.value;
      var tagType = Meteor.precariMethods.tagType.PRIVATE;

      // If public tag, mark public
      if (e.currentTarget.id.indexOf('public') >= 0) {
          tagType = Meteor.precariMethods.tagType.PUBLIC;
      }

      Blaze._globalHelpers.addTagToForm(tagType, tagText);
      e.currentTarget.value = '';
  },

  /**
   * Add the tag from the list of tags to the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click #user-public-tag-cloud .tag a.add': function (e) {
    var tagText = $(e.currentTarget.parentElement).text();
    var tagType = Meteor.precariMethods.tagType.PUBLIC;
    Blaze._globalHelpers.addTagToForm(tagType, tagText);
  },

  /**
   * Add the private tag from the list of tags to the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click #user-private-tag-cloud .tag a.add': function (e) {
    var tagText = $(e.currentTarget.parentElement).text();
    var tagType = Meteor.precariMethods.tagType.PRIVATE;
    Blaze._globalHelpers.addTagToForm(tagType, tagText);
  },

  /**
   * Remove the tag from the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click .tag a.remove': function (e) {
    e.currentTarget.parentElement.remove();
  },

  'click #privacy-radio-group .radio': function (e) {

    // Visually warn the user if making a public request. TODO: Find a better
    // woy for this. Dialog box?
    if ($(e.target).find('input[name=privacy-radio]').val() === 'public') {
      $(e.currentTarget).addClass('alert-danger');
    } else {
      // Remove the class if exists on the particluar element
      if ($(e.currentTarget).attr('id') != 'public-request-div'){
        $('#public-request-div').removeClass('alert-danger');
      }
    }
  },

  /**
   * On form submit, create a new post with the user-provided data
   * @param jQuery.Event e Event object containing the event data
   */
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    publicTagArray =   getSelectedTags(e, 'public-tag-cloud');
    privateTagArray =   getSelectedTags(e, 'private-tag-cloud');

    publicTagArray = Blaze._globalHelpers.convertTagsToKVPair
      (Meteor.precariMethods.tagType.PUBLIC, publicTagArray);
    privateTagArray = Blaze._globalHelpers.convertTagsToKVPair
      (Meteor.precariMethods.tagType.PRIVATE, privateTagArray);

    // Get the data from the fields
    var postData = {
      bodyMessage: $(e.target).find('[name=prayer-request]').val(),
      publicTags: publicTagArray,
      privateTags: privateTagArray,
      visibility: $(e.target).find('input[name=privacy-radio]:checked').val()
    };

    // Validate the data and return any errors
    var errors = validatePost(postData);
    if (errors.bodyMessage || errors.publicTags || errors.privateTags) {
      return Session.set('postSubmitErrors', errors);
    }

    // Insert the post
    Meteor.call('postInsert', postData, function(error, result) {

      // Display the error to the user and abort
      if (error) {
        return throwError(error.reason);
      }

      // Post has been submitted. Redirect to the new post
      Router.go('postPage', {_id: result._id});
    });
  },
});

// ---------------------------- Helper methods -------------------------------

/**
 * Gets the selected tags from the form to submit with the new post
 * @param object e Form event data
 * @param string name Name of the tag type (controls) to get the data from
 * @return array An array containing the tag names
 */
var getSelectedTags = function(e, name) {

  var tagArray = [];

  var selector = '#' + name + ' .tag';

  // Loop through each tag and add it to the array
  $(selector).each(function () {
    tagArray.push($(this).text());
  });

  // Return only unique values; Filter out any duplicates
  return _.uniq(tagArray);
};
