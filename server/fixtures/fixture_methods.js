/*
    fixture_methods.js contains methods for populating the db with test data.
    Some of this code is duplicates of the collection code, but Meteor was
    generating errors when tryign to access Meteor methods in lib.
*/

Meteor.precariFixtureMethods = {

  /**
   * Inserts the tag into the PublicTags collection (or db). If a tag by the same
   * name already exists, the ID of the exising tag is returned
   * @param string tag The tag to insert
   * @return string The id of the inserted tag or the id an exising tog by
                    same name.
   */
  publicTagInsert: function(tag) {

    check(tag, String);

    // Get the tag by name to check if it exists
    var existingTag = PublicTags.findOne({name: tag});

    // If the tag does not exist, add it
    if (!existingTag) {

      tagObj = {
        name: tag
      };

      // validate and insert
      PublicTags.schema.clean(tagObj);
      PublicTags.schema.validate(tagObj);
      var tagId = PublicTags.insert(tagObj);

      // Return the ID of the new tag
      return {
        _id: tagId
      };
    } else {

      // Return the ID of the existing tag
      return {
        _id: existingTag._id
      };
    }
  },
  /**
   * Inserts the tag into the PrivateTags collection (or db). If a tag by the same
   * name already exists, the ID of the exising tag is returned
   * @param string tagLabel The human readable form of the label
   * @param String userId The ID of the user who created the tag
   * @return object The newly created tag, or an existing tag if a match was found
   */
  privateTagInsert: function(tagLabel, userId) {

    check(tagLabel, String);
    check(userId, String);

    // Search for an exising tag with the same label.
    // (note: different users can use the same label)
    var existingTag = PrivateTags.findOne({label: tagLabel, userId: userId});
    if (existingTag) {
      return existingTag;
    }

    // If the tag does not exist, add it
    tagObj = {
      name: PRIVATE_TAG_CHAR + Random.id(12),
      label: tagLabel,
      userId: userId
    };

    // validate and insert the tag
    PrivateTags.schema.clean(tagObj);
    PrivateTags.schema.validate(tagObj);
    var id = PrivateTags.insert(tagObj);

    // return the new tag
    return PrivateTags.findOne({_id: id});
  }
};
