/*
    fixture_methods.js contains methods for populating the db with test data.
    Some of this code is duplicates of the collection code, but Meteor was
    generating errors when tryign to access Meteor methods in lib.
*/

Meteor.fixtureMethods = {

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

    // Only access from the server
    verifyIsServer();

      // Build the KV pair
    if (type === 'private') {
      return { label: name };
    } else {
      return { name: name };
    }
  },

  /**
   * Single method call to build and insert the public tag
   * @param String name Name of the tag
   * @return Object An object containing the KV data:
   *              {name: tagName} or {label: tagName}
   */
  buildAndInsertPublicTag: function(name) {

    check(name, String);

    var tag = Meteor.fixtureMethods.buildTagKVPair('public', name);
    return Meteor.fixtureMethods.publicTagInsert(tag);
  },

  /**
   * Inserts the tag into the PublicTags collection (or db). If a tag by the same
   * name already exists, the ID of the exising tag is returned.
   *
   * This bypasses the security features of the client call
   *
   * @param string tag The tag to insert
   * @return string The id of the inserted tag or the id an exising tog by
                    same name.
   */
  publicTagInsert: function(tag) {

    check(tag, Object);

    // Only access from the server
    verifyIsServer();

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
   *
   * This bypasses the security features of the client call
   *
   * @param string tagLabel The human readable form of the label
   * @param String userId The ID of the user who created the tag
   * @return object The newly created tag, or an existing tag if a match was found
   */
  privateTagInsert: function(tag, userId) {

    check(tag, Object);
    check(userId, String);

    // Only access from the server
    verifyIsServer();

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

/**
 * Determines if the call is from the server, or client
 */
var verifyIsServer = function() {

  if ( this.connection === undefined ) {
    return true;
  } else {
    var msg = 'This method is only accessable from the server';
    throw new Meteor.Error('unauthorized-access', msg);
  }
};
