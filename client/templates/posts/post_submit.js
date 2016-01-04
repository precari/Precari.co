
/* stores the user's tags */
var currentUsersPublicTags;
/* stores the user's private tags */
var currentUsersPrivateTags;

// -------------------------- Template onCreated -------------------------------

Template.postSubmit.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('postSubmitErrors', {});

  var self = this;

  // On template create, refresh the post subscription and rebuild the
  // tag arrays. Without this, only a page refresh will display any newly
  // created tags since they are extracted from post data.

  // Use self.subscribe with the data context reactively
  self.autorun(function () {
    self.subscribe("usersPostsForTagList");
  });

  // Now that the updated post data is returned, rebuild the tags lists
  setUserTagArrays();
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
   * Gets the list of tags from the user's own posts.
   */
  userPublicTags: function() {

    // If the tag array has been built, use it. Otherwise build the arrays
    if (currentUsersPublicTags === undefined) {
      Blaze._globalHelpers.setUserTagArrays();
    }

    return currentUsersPublicTags;
  },

  /**
   * Gets the list of private tags from the user's own posts.
   */
  userPrivateTags: function() {

    // If the tag array has been built, use it. Otherwise build the arrays
    if (currentUsersPrivateTags === undefined) {
      setUserTagArrays();
    }

    return currentUsersPrivateTags;
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
  'keyup #public-tags-input': function (e) {

    // If comma ',' or carriage return, add tag
    if (e.keyCode == 13 || e.keyCode == 188) {
      var tagText = e.currentTarget.value;
      var tagType = Meteor.precariMethods.tags.tagTypeEnum.PUBLIC.name;
      Blaze._globalHelpers.insertTag(tagType, tagText);
      e.currentTarget.value = '';
    }
  },

  /**
   * Add a new random private tag
   * @param jQuery.Event e Event object containing the event data
   */
  'click #add-private-tag': function (e) {

    // Get the random tag
    Meteor.call('generateRandomTag', function(error, result) {

      // start out with less secure random string
      tagText = Math.random().toString(36).substr(2, 10);

      // If the result was successfully returned, use it.
      if (result) {
        tagText = result;
      }

      var tagType = Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name;
      Blaze._globalHelpers.insertTag(tagType, tagText);
    });
  },

  /**
   * Add the tag from the list of tags to the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click #user-public-tag-cloud .tag a.add': function (e) {
    var tagText = $(e.currentTarget.parentElement).text();
    var tagType = Meteor.precariMethods.tags.tagTypeEnum.PUBLIC.name;
    Blaze._globalHelpers.insertTag(tagType, tagText);
  },

  /**
   * Add the private tag from the list of tags to the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click #user-private-tag-cloud .tag a.add': function (e) {
    var tagText = $(e.currentTarget.parentElement).text();
    var tagType = Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name;
    Blaze._globalHelpers.insertTag(tagType, tagText);
  },

  /**
   * Remove the tag from the post tag list
   * @param jQuery.Event e Event object containing the event data
   */
  'click .tag a.remove': function (e) {
    e.currentTarget.parentElement.remove();
  },

  /**
   * On form submit, create a new post with the user-provided data
   * @param jQuery.Event e Event object containing the event data
   */
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    tagArray =   getSelectedTags(e, 'public-tag-cloud');
    privateTagArray =   getSelectedTags(e, 'private-tag-cloud');

    // Get the data from the fields
    var postData = {
      prayerRequest: $(e.target).find('[name=prayer-request]').val(),
      title: $(e.target).find('[name=title]').val(),
      tags: tagArray,
      privateTags: privateTagArray,
      private: $(e.target).find('[name=private-post]').is(':checked'),
    };

    // Validate the data and return any errors
    var errors = validatePost(postData);
    if (errors.title || errors.prayerRequest || errors.tags || errors.privateTags) {
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
 * Gets the list of tags from the user's own posts. This allows the data
 * collection to run once, but access the array data multiple times.
 */
var setUserTagArrays = function() {

  // Initialize and populate
  currentUsersPublicTags = [];
  currentUsersPrivateTags = [];

  var posts = Posts.find().fetch();
  tagArrays = Blaze._globalHelpers.getTagsFromPosts(posts);

  currentUsersPublicTags = tagArrays[0];
  currentUsersPrivateTags = tagArrays[1];
};

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
