
/* stores the user's tags */
var currentUsersTags;
/* stores the user's private tags */
var currentUsersPrivateTags;

/**
 * Gets the list of tags from the user's own posts. This allows the data
 * collection to run once, but access the array data multiple times.
 */
var setFormTagArrays = function() {

  // Initialize and populate
  currentUsersTags = [];
  currentUsersPrivateTags = [];

  var posts = Posts.find().fetch();
  tagArrays = Meteor.precariMethods.getTagsFromPosts(posts);

  currentUsersTags = tagArrays[0];
  currentUsersPrivateTags = tagArrays[1];
};

/**
 * Gets the checked tags from the form to submit with the new post
 * @param object e Form event data
 * @param string name Name of the tag type (controls) to get the data from
 * @return array An array containing the tag names
 */
 var getCheckedTagValues = function(e, name) {

  // Convert the string to an array
  var tagArray = Meteor.precariMethods.convertCommaListToArray
                  ($(e.target).find('[name=' + name + ']').val());

  // Get the checkbox data
  name += '-checkbox';

  $(e.target).find('[name=' + name + ']:checked').each(function () {
    tagArray.push(this.value);
  });

  // Return only unique values; Filter out any duplicates
  return _.uniq(tagArray);
};

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
  setFormTagArrays();
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

  // If value is true, returns 'checked' for the checkbox
  checked: function (checked) {
    return checked ? 'checked' : '';
  },

  /**
   * Gets the list of tags from the user's own posts.
   */
  userTags: function() {

    // If the tag array has been built, use it. Otherwise build the arrays
    if (currentUsersTags === undefined) {
      setFormTagArrays();
    }

    return currentUsersTags;
  },

  /**
   * Gets the list of private tags from the user's own posts.
   */
  userPrivateTags: function() {

    // If the tag array has been built, use it. Otherwise build the arrays
    if (currentUsersPrivateTags === undefined) {
      setFormTagArrays();
    }

    return currentUsersPrivateTags;
  },
});

// ---------------------------- Template events -------------------------------

Template.postSubmit.events({
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    tagArray = getCheckedTagValues(e, 'tags');
    privateTagArray = getCheckedTagValues(e, 'private-tags');

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
  }
});
