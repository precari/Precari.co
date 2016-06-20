/*
    fixture_methods.js contains methods for populating the db with test data.
    Some of this code is duplicates of the collection code, but Meteor was
    generating errors when tryign to access Meteor methods in lib.
*/

Meteor.precariFixtureMethods = {

  /**
   * Determines if the environment is specifically a staging environment
   * @return Boolean true if the environment is a staging env, otherwise false
   */
  isStagingEnvironment: function() {

    // Attempt to get settings var. If undefined, generates a TypeError
    try {

      // If env is staging, return true
      if (Meteor.settings.env.environment === 'staging') {
        return true;
      } else {
        return false;
      }

    } catch (e) {
        console.log(e);
        return false;
    }
  },

  /**
   * Determine if the instance should be staged
   * @return Boolean true to stage the instance, otherwise false
   */
  stageCurrentInstance: function() {

    // Attempt to get staging flag. If undefined, generates a TypeError
    try {

      // If env is staging, always stage
      if (Meteor.precariFixtureMethods.isStagingEnvironment()) {
        return true;
      }

      // If development with staging flag set for instance, stage
      if (Meteor.isDevelopment && Meteor.settings.env.stage === 'true') {
        return true;
      }

      // Otherwise. Do not stage.
      return false;

    } catch (e) {
        console.log(e);
        return false;
    }
  },

  /**
   * Converts the tag name to a KV pair {name: tagName} or {label: tagName}
   * @param String type private or public
   * @param String name Name or label of the tag
   * @return Object An object containing the KV data:
   *              {name: tagName} or {label: tagName}
   */
  buildTagKVPair: function(type, name) {

    check(type, String);
    check(name, String);

      // Build the KV pair
    if (type === 'private') {
      return { label: name };
    } else {
      return { name: name };
    }
  },

  /**
   * Inserts the tag into the PublicTags collection (or db). If a tag by the same
   * name already exists, the ID of the exising tag is returned
   * @param string tag The tag to insert
   * @return string The id of the inserted tag or the id an exising tog by
                    same name.
   */
  publicTagInsert: function(tag) {

    check(tag, Object);

    // Get the tag by name to check if it exists
    var existingTag = PublicTags.findOne({name: tag.Name});

    // If the tag does not exist, add it
    if (!existingTag) {

      // validate and insert
      PublicTags.schema.clean(tag);
      PublicTags.schema.validate(tag);
      var tagId = PublicTags.insert(tag);

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
  privateTagInsert: function(tag, userId) {

    check(tag, Object);
    check(userId, String);

    var tagLabel = tag.label;

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
