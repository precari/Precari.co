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
   * Gets the list of the current user's own tags from their posts
   */
  userTags: function() {

    var posts = Posts.find().fetch();
    tagArrays = Blaze._globalHelpers.getTagsFromPosts(posts);

    tagArray = tagArrays[0].concat(tagArrays[1]);
    return tagArray;
  },

  /**
   * Gets the list of tags
   */
  tags: function() {
    return Tags.find({});
  }
});
