
// -------------------------- Template onCreated -------------------------------

Template.postEdit.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('postEditErrors', {});
});

// ---------------------------- Template helpers -------------------------------

Template.postEdit.helpers({

  // Returns the value regarless of an error or not
  errorMessage: function(field) {
    return Session.get('postEditErrors')[field];
  },

  // If the field has an error, return the class 'has-error'
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
  },

  /**
   * Gets the list of public tags.
   */
  userPublicTags: function() {
    return PublicTags.find().fetch();
  },

  /**
   * Gets the list of the user's private tags
   */
  userPrivateTags: function() {
    return PrivateTags.find().fetch();
  },

  /**
   * Determines if the user can use public tags
   */
  authorizedUser: function() {
    return false;
  },

  /**
   * Gets the enum value for the visibility setting
   */
  visibilityValue: function(num) {

    var visibility;

    switch (num) {
      case 0:
        visibility = Meteor.precariMethods.visibility.PRIVATE;
        break;
      case 1:
        visibility = Meteor.precariMethods.visibility.LINK;
        break;
      case 2:
        visibility = Meteor.precariMethods.visibility.TAG;
        break;
      case 3:
        visibility = Meteor.precariMethods.visibility.PUBLIC;
        break;
      default:
        visibility = Meteor.precariMethods.visibility.PRIVATE;
      break;
    }
      return visibility;
  },

  /**
   * Gets the enum value for the visibility setting
   */
  privacyRadioCheked: function(num) {

    var checked;

    switch (num) {
      case 0:
        if (this.visibility === Meteor.precariMethods.visibility.PRIVATE) {
          checked = 'checked';
        }
        break;
      case 1:
        if (this.visibility === Meteor.precariMethods.visibility.LINK) {
          checked = 'checked';
        }
        break;
      case 2:
        if (this.visibility === Meteor.precariMethods.visibility.TAG) {
          checked = 'checked';
        }
        break;
      case 3:
        if (this.visibility === Meteor.precariMethods.visibility.PUBLIC) {
          checked = 'checked';
        }
        break;
      default:
        checked = '';
      break;
    }
      return checked;
  },

  /**
   * Gets the maximum allowed title length
   */
  maxTitleLength: function() {
    return parseInt(Meteor.settings.public.maxTitleLength);
  },
});

// ---------------------------- Template events -------------------------------

Template.postEdit.events({

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
   * Add the tag from the list of tags to the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click #user-tag-cloud .tag a.add': function (e) {
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
   * Processes the submitted data in the form
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
      title: $(e.target).find('[name=title]').val(),
      bodyMessage: $(e.target).find('[name=prayer-request]').val(),
      publicTags: publicTagArray,
      privateTags: privateTagArray,
      visibility: $(e.target).find('input[name=privacy-radio]:checked').val(),
    };

    // Additional data related to the post
    var postMetadata = {
      postId: this._id,
    };

    // Validate the data and return any errors
    var errors = validatePost(postData);
    if (errors.title || errors.bodyMessage || errors.publicTags || errors.privateTags) {
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
