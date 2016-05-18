// The collection for publicTags in the posts
PublicTags = new Mongo.Collection('publicTags');

PublicTags.schema = new SimpleSchema({
  name:   { type: String, max: 50 },
  type:   { type: String, defaultValue: 'public' }
});

// Attach the schema for auto validation
PublicTags.attachSchema(PublicTags.schema);

Meteor.methods({

  /**
   * Inserts an array of tags into the PublicTags collection (or db). If tags by
   * the same name already exist, duplicates are not created.
   * @param array tagArray The array of tags to insert
   */
  publicTagInsertByArray: function(tagArray) {

      check(tagArray, [String]);

      for (var i = 0; i < tagArray.length; i++) {
        Meteor.call('publicTagInsert', tagArray[i]);
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

    check(tag, String);

    var authorizedUser = false;

    // Valide user for permission
    if (!authorizedUser) {
      var msg ="You do not have the required permission to use public tags";
      throw new Meteor.Error('unauthorized', msg);
    }

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
  }
 });
