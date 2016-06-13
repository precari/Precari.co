// ---------------------------- Template helpers -------------------------------

Template.tagsPage.helpers({

  /**
   * Gets the count of the user's own tags
   */
  userTagsCount: function() {
    return PrivateTags.find().count();
  },

  /**
   * Gets the list of the current user's own tags
   */
  userTags: function() {
    return PrivateTags.find({});
  },

  /**
   * Gets the list of public tags
   */
  publicTags: function() {
    return PublicTags.find({});
  },
});
