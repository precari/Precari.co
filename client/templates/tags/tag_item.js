
// ------------- defualtTagItemWithRemoveGlyph Template helpers ----------------

Template.defualtTagItemWithRemoveGlyph.helpers({

  /**
   * Get the label of the user's default tag. If a tag is not found, create one
   *
   * @return String Label for the user's default tag
   */
  label: function() {

    // Get the user's default tag
    var tag = PrivateTags.findOne({userId: Meteor.userId(), default: true});

    if (tag) {
      // If found, return the label
      return tag.label;
    } else {
      // No default tag. On submit the tag will be created
      return Meteor.settings.public.tags.userDefaultLabel;
    }
  },
});

// ------------------ privateTagItemWithLink Template helpers ------------------

Template.privateTagItemWithRemoveGlyph.helpers({

  /**
   * Gets the property of the tag for the CSS class
   *
   * @return String The tag-type info
   */
  getProperty: function() {

    // Attempt to locate the tag from the list
    var tag = PrivateTags.findOne({label: this.label});

    // If tag is found, use the tag's data. Otherwise, assume a new private tag
    if (tag) {
      return determineTagProperty(tag);
    } else {
      return Meteor.precariMethods.tagType.PRIVATE;
    }
  },
});

// ------------------ privateTagItemWithLink Template helpers ------------------

Template.privateTagItemWithCheckGlyph.helpers({

  /**
   * Gets the property of the tag for the CSS class
   *
   * @return String The tag-type info
   */
  getProperty: function() {
    return determineTagProperty(this);
  },
});

// ------------------ privateTagItemWithLink Template helpers ------------------

Template.privateTagItemWithLink.helpers({

  /**
   * Gets the property of the tag for the CSS class
   *
   * @return String The tag-type info
   */
  getProperty: function() {
    return determineTagProperty(this);
  },
});

// ------------------ publicTagItemWithLink Template helpers ------------------

Template.publicTagItemWithLink.helpers({

  /**
   * Gets the property of the tag for the CSS class
   *
   * @return String The tag-type info
   */
  getProperty: function() {
    return determineTagProperty(this);
  },
});

// ---------------------------- Helper methods ---------------------------------

/**
 * Determines the tag type and properties neccessary to retrieve the correct
 * CSS class
 *
 * @param Object tag Tag to determine the properties for
 * @return String The tag's property for the CSS class
 */
var determineTagProperty = function(tag) {

  if (!tag || !tag.type) {
    return '';
  }

  if (tag.default) {
    return 'default';
  } else {
    return tag.type;
  }
};
