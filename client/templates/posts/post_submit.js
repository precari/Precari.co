
/* stores the user's tags */
var formTagArray;
/* stores the user's private tags */
var formPrivateTagArray;

/**
 * Gets the list of tags from the user's own posts. This allows the Loop
 * to run once, but access the array data multiple times.
 */
var setFormTagArrays = function() {

  // Initialize and populate
  formTagArray = [];
  formPrivateTagArray = [];

  // Get the user posts that contain their tags
  var posts = Posts.find().fetch();

  // Loop through the posts getting the tags used by the user
  for (var i = 0; i < posts.length; i++) {

    // Add the tags to the respective list
    formTagArray = formTagArray.concat(posts[i].tags);
    formPrivateTagArray = formPrivateTagArray.concat(posts[i].privateTags);
  }

  // Filter duplicates and then sort alphabetically
  formTagArray = _.uniq(formTagArray);
  formTagArray = _.sortBy(formTagArray, function (name) {
    return name;
  });

  formPrivateTagArray = _.uniq(formPrivateTagArray);
  formPrivateTagArray = _.sortBy(formPrivateTagArray, function (name) {
     return name;
   });
};

/**
 * Gets the tags from the form to submit with the new post
 * @param object e Form event data
 * @param string name Name of the tag type (controls) to get the data from
 * @return array An array containing the tag names
 */
 var getTagFormArray = function(e, name) {

  // Convert the string to an array
  var tagArray = Meteor.precariMethods.convertCommaListToArray
                  ($(e.target).find('[name=' + name + ']').val());

  // Get the checkbox data
  name += '-checkbox';

  $(e.target).find('[name=' + name + ']:checked').each(function () {
    tagArray.push(this.value);
  });

  // Return only unique values. Filter out any duplicates
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

  /**
   * Gets the list of tags from the user's own posts.
   */
  userTags: function() {

    // If the tag array has been built, use it. Otherwise build the arrays
    if (formTagArray === undefined) {
      setFormTagArrays();
    }

    return formTagArray;
  },

  /**
   * Gets the list of private tags from the user's own posts.
   */
  userPrivateTags: function() {

    // If the tag array has been built, use it. Otherwise build the arrays
    if (formPrivateTagArray === undefined) {
      setFormTagArrays();
    }

    return formPrivateTagArray;
  },
});

// ---------------------------- Template events -------------------------------

Template.postSubmit.events({
  'submit form': function(e) {

    // prevents the browser from handling the event and submitting the form
    e.preventDefault();

    tagArray = getTagFormArray(e, 'tags');
    privateTagArray = getTagFormArray(e, 'private-tags');

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
