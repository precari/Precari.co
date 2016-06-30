
// -------------------------- Template onCreated -------------------------------

Template.postSubmitQuick.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('quickPostSubmitErrors', {});
});

// ---------------------------- Template helpers -------------------------------

Template.postSubmitQuick.helpers({

  // Returns the value regarless of an error or not
  errorMessage: function(field) {
    return Session.get('quickPostSubmitErrors')[field];
  },

  // If the field has an error, return the class 'has-error'
  errorClass: function (field) {
    return !!Session.get('quickPostSubmitErrors')[field] ? 'has-error' : '';
  },

  /**
   * Gets the list of private tags used by the user
   *
   * @return Collection The collection of the user's private tags
   */
  userPrivateTags: function() {
    return PrivateTags.find({}).fetch();
  },

  /**
   * Sets the active tag on the default tag
   *
   * @return String Returns active if the tag is the default tag
   */
  defaultActiveTag: function() {
    if (this.default) {
      return 'active';
    }
  },
});

// ---------------------------- Template events -------------------------------

Template.postSubmitQuick.events({

  /**
   * Select the tag for the post
   *
   * @param jQuery.Event e Event object containing the event data
   */
  'click div.quick-post #tags-dropdown-menu li': function(e) {

    // Clear the active marker from all items in the list and set the
    // current target as selected
    getFormElement('tagListItems').removeClass('active');
    $(e.currentTarget).addClass('active');
  },

  /**
   * Select visibility for the post
   *
   * @param jQuery.Event e Event object containing the event data
   */
  'click div.quick-post #visibility-dropdown-menu li': function(e) {

     // Get the glyphIcon for the clicked value
     var selectedValue = e.currentTarget.textContent;
     var glyphIcon = Blaze._globalHelpers.visibliltyGlyphicon(selectedValue);

     // Set the glyphIcon of the clicked value
     getFormElement('glyphicon').attr('class', glyphIcon);

     // Clear the active marker from all items in the list and set the
     // current target as selected
     getFormElement('visibilityListItems').removeClass('active');
     $(e.currentTarget).addClass('active');
  },

  /**
   * On submit create a new post with the user-provided data
   *
   * @param jQuery.Event e Event object containing the event data
   */
  'submit #quick-post': function(e) {

    e.preventDefault();

    // disregard blank entry; prevents an error from being shown
    if (getFormElement('input').val() === '') {
      return;
    }

    // Get the tag from the list
    var tagLabel = getFormElement('selectedTag').text();
    var tag = PrivateTags.findOne({label: tagLabel});

    if (!tag) {
      tag = PrivateTags.findOne({default: true});
    }

    // Build post object
    var postData = {
      bodyMessage:  getFormElement('input').val(),
      publicTags:   [],
      privateTags:  [tag],
      visibility:   getFormElement('selectedVisibility').text()
    };

    // Validate the data and return any errors
    var errors = validatePost(postData);
    if (errors.bodyMessage || errors.privateTags) {
      return Session.set('quickPostSubmitErrors', errors);
    }

    // Insert the post
    Meteor.call('postInsert', postData, function(error, result) {

      // Display the error to the user and abort
      if (error) {
        return throwError(error.reason);
      }

      // clear the input box
      getFormElement('input').val('');
    });
  },
});

// ---------------------------- Helper methods -------------------------------

/**
 * Gets the form element
 *
 * @param String name Name of element to get
 * @return Elem The form element
 */
var getFormElement = function(name) {

  switch (name) {
    case 'tagListItems':
      return $('div.quick-post #tags-dropdown-menu li');
    case 'selectedTag':
      return $('div.quick-post #tags-dropdown-menu li.active');
    case 'visibilityListItems':
      return $('div.quick-post #visibility-dropdown-menu li');
    case 'selectedVisibility':
      return $('div.quick-post #visibility-dropdown-menu li.active');
    case 'glyphicon':
      return $('div.quick-post #visibility-dropdown-glyphicon');
    case 'input':
      return $('div.quick-post input');
    default:
      return $('');
  }
};
