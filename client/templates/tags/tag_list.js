// ---------------------------- Template helpers -------------------------------

Template.tagsList.helpers({

  /**
   * Displays the value of the tag, as a string
   */
  tags: function() {
    return Tags.find({});
  }

});
