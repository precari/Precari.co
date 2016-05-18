// The collection for privateTags in the posts
PrivateTags = new Mongo.Collection('privateTags');

PrivateTags.schema = new SimpleSchema({
  name:   { type: String, max: 50 },
  label:  { type: String, max: 50 },
  userId: { type: String },
  type:   { type: String, defaultValue: 'private' }
});

// Attach the schema for auto validation
PrivateTags.attachSchema(PrivateTags.schema);

Meteor.methods({

  /**
   * Inserts an array of tags into the PrivateTags collection (or db). If tags by
   * the same name already exist, duplicates are not created.
   * @param array tagArray The array of tags to insert
   */
  privateTagInsertByArray: function(tagArray) {

     check(tagArray, [String]);

     for (var i = 0; i < tagArray.length; i++) {
       Meteor.call('privateTagInsert', tagArray[i]);
     }
  },

  /**
   * Inserts the tag into the PrivateTags collection (or db). If a tag by the same
   * name already exists, the ID of the exising tag is returned
   * @param string tagLabel The human readable form of the label
   * @return object The name of the newly created tag, or an existing tag name
   */
  privateTagInsert: function(tagLabel) {

    check(tagLabel, String);

    // Search for an exising tag with the same label.
    // (note: different users can use the same label)
    var existingTag = PrivateTags.findOne({label: tagLabel, userId: this.userId });
    if (existingTag) {
      return existingTag;
    }
    //Meteor.user()._id

    // If the tag does not exist, add it
    tagObj = {
      name: PRIVATE_TAG_CHAR + Random.id(12),
      label: tagLabel,
      userId: this.userId
    };

    // validate and insert the tag
    PrivateTags.schema.clean(tagObj);
    PrivateTags.schema.validate(tagObj);
    var id = PrivateTags.insert(tagObj);

    // return the new tag
    return PrivateTags.findOne({_id: id});
  }
});
