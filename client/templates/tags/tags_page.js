// -------------------------- Template onCreated -------------------------------

Template.tagsPage.onCreated(function() {

  var self = this;

  // On template create, refresh the post subscription and rebuild the
  // tag arrays. Without this, only a page refresh will display any newly
  // created tags since they are extracted from post data.

  // Use self.subscribe with the data context reactively
  self.autorun(function () {
    self.subscribe("usersPostsForTagList");
  });
});

// ---------------------------- Template helpers -------------------------------

Template.tagsPage.helpers({

  /**
   * Gets the list of tags from the user's own posts.
   */
  userTags: function() {

    // Get the user posts that contain their tags
    var posts = Posts.find().fetch();

    var tagArray = [];
    var privateTagArray = [];

    for (var i = 0; i < posts.length; i++) {

      // Add the tags to the respective list
      tagArray = tagArray.concat(posts[i].tags);
      privateTagArray = privateTagArray.concat(posts[i].privateTags);
    }

    // Join the tags and privateTags. (keeping public tags first)
    tagArray = tagArray.concat(privateTagArray);

    // Filter duplicates and then sort alphabetically
    tagArray = _.uniq(tagArray);
    tagArray = _.sortBy(tagArray, function (name) {
      return name;
    });

    // Return only unique values
    return tagArray;
  },

  /**
   * Gets the list of tags
   */
  tags: function() {
    return Tags.find({});
  }
});
