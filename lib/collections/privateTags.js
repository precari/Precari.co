// The collection for privateTags in the posts
PrivateTags = new Mongo.Collection('privateTags');

PrivateTags.schema = new SimpleSchema({
  name:     { type: String, max: parseInt(Meteor.settings.public.tags.maxLength) },
  label:    { type: String, max: parseInt(Meteor.settings.public.tags.maxLength) },
  userId:   { type: String },
  type:     { type: String, defaultValue: 'private' },
  default:  { type: Boolean, defaultValue: false }
});

// Attach the schema for auto validation
PrivateTags.attachSchema(PrivateTags.schema);

// Set the allow conditions: The user most own the tag
PrivateTags.allow({
  update: function(userId, tag) { return ownsDocument(userId, tag); },
  remove: function(userId, tag) { return ownsDocument(userId, tag); },
});

// Set deny operations
PrivateTags.deny({
  update: function(userId, post, fieldNames, modifier) {

    // Deny if not valid information
    var errors = validateTag(modifier.$set);
    return errors.label;
  }
});

/**
 * Validates the tag before allowing the submissions
 * @param collection post The post data to Validates
 * @return collection Any generated error. An empty collection if no errors.
 */
validateTag = function (tag) {

  // Clear any errors
  var errors = {};

  var maxTagLength = parseInt(Meteor.settings.public.tags.maxLength);

  if (!tag.label || tag.label === '') {
    errors.label = "Please add a label";
  } else if (tag.label.length > maxTagLength) {
    errors.label = 'The tag is limited to  ' + maxTagLength + ' characters.';
  }

  return errors;
};


/**
 * Creates a default tag for the user if one does not exist
 *
 * @return Object The user's default tag
 */
var createDefaultTag = function() {
  check(Meteor.userId(), String);

  // Search for the logged in user's default tag
  var defaultTag = PrivateTags.findOne( {userId: Meteor.userId(), default: true } );

  if (defaultTag) {
    return defaultTag;
  }

  // If the default tag does not exist, add it
  tag = {
    name: PRIVATE_TAG_CHAR + Random.id(12),
    label: Meteor.settings.public.tags.userDefaultLabel,
    userId: Meteor.userId(),
    default: true,
  };

  // validate and insert the tag
  PrivateTags.schema.clean(tag);
  PrivateTags.schema.validate(tag);
  var id = PrivateTags.insert(tag);

  // return the new tag
  return PrivateTags.findOne( { _id: id } );
};

// ---------------------privateTags meteor methods -----------------------------

Meteor.methods({

  /**
   * Inserts an array of tags into the PrivateTags collection (or db). If tags by
   * the same name already exist, duplicates are not created.
   * @param array tagArray The array of tags to insert
   */
  privateTagInsertByArray: function(tagArray) {
     check(tagArray, [Object]);

     // Create default tag if need be
     createDefaultTag();

     for (var i = 0; i < tagArray.length; i++) {
       Meteor.call('privateTagInsert', tagArray[i].label);
     }
  },

  /**
   * Inserts the tag into the PrivateTags collection (or db). If a tag by the
   * same name already exists, the ID of the exising tag is returned
   * @param string tagLabel The human readable form of the label
   * @return object The name of the newly created tag, or an existing tag name
   */
  privateTagInsert: function(tagLabel) {
    check(this.userId, String);
    check(tagLabel, String);

    // Search for an exising tag with the same label.
    // (note: different users can use the same label)
    var existingTag = PrivateTags.findOne({label: tagLabel, userId: this.userId });
    if (existingTag) {
      return existingTag;
    }

    // If the tag does not exist, add it
    tagObj = {
      name: PRIVATE_TAG_CHAR + Random.id(12),
      label: tagLabel,
      userId: this.userId,
    };

    PrivateTags.schema.clean(tagObj);
    PrivateTags.schema.validate(tagObj);
    var id = PrivateTags.insert(tagObj);

    // return the new tag
    return PrivateTags.findOne( { _id: id } );
  },

  /**
   * Removes the label from the collection and from each post
   * @param Object tag The tag to remove
   */
  privateTagRemove: function(tag) {
    check(this.userId, String);
    check(tag, {
      _id: String,
      name: String,
      label: String,
      userId: String,
      type: String,
      default: Boolean,
    });

    var tagLabel = tag.label;

    // Remove the tag from the PrivateTags collection
    if (ownsDocument(this.userId, tag)) {
      PrivateTags.remove(tag._id);
    }

    // Remove tag from each post
    Posts.update(
      { userId: this.userId },
      { $pull: { privateTags: { label: tagLabel} } },
      { multi: true }
    );
  },

  /**
   * Renames the label in the collection and in each post
   * @param Object tag The tag to update
   * @param String originalLabel The original tag label
   * @return Integer The number of posts that the tag was updated in
   */
  privateTagRename: function(tag, originalLabel) {
    check(this.userId, String);
    check(originalLabel, String);
    check(tag, {
      _id: String,
      name: String,
      label: String,
      userId: String,
      type: String,
      default: Boolean,
    });

    // Should the UI validation fail or is bypasssed
    var errors = validateTag(tag);
    if (errors.label) {
      throw new Meteor.Error('invalid-label', errors.label);
    }

    // Update the tag name in the PrivateTags collection
    if (ownsDocument(this.userId, tag)) {
      PrivateTags.update( { _id: tag._id }, { $set: { label: tag.label } } );
    }

    // Update tag from each post
    var result = Posts.update(
      { userId: this.userId, 'privateTags.label': originalLabel },
      { $set: { 'privateTags.$.label': tag.label } },
      { multi: true }
    );

    return result;
  },
});
