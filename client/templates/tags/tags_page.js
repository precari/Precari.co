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
  publicTags: function() {
    return PublicTags.find({});
  }
});
