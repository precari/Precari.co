// ---------------------------- Template helpers -------------------------------

Template.tagsPage.helpers({

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
