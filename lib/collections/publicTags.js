// The collection for publicTags in the posts
PublicTags = new Mongo.Collection('publicTags');

PublicTags.schema = new SimpleSchema({
  name:   { type: String, max: 50 },
  type:   { type: String, defaultValue: 'public' }
});

// Attach the schema for auto validation
PublicTags.attachSchema(PublicTags.schema);

// Set allow (only to insert if correct permissions)
PublicTags.allow({

  // To insert, must have the correct role
  insert: function() {
    return Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator']);
  }
});

// Set deny rules
PublicTags.deny ({

  // To insert, must have the correct role
  insert: function() {
    return !Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator']);
  },

  // No update at this time
  update: function() {
    return true;
  },

  // No removal at this time
  remove: function() {
    return true;
  },

});

Meteor.methods({

  /**
   * Inserts an array of tags into the PublicTags collection (or db). If tags by
   * the same name already exist, duplicates are not created.
   * @param array tagArray The array of tags to insert
   */
  publicTagInsertByArray: function(tagArray) {

      check(tagArray, [Object]);

      for (var i = 0; i < tagArray.length; i++) {
        Meteor.call('publicTagInsert', tagArray[i].name);
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

    // Validate user for permission
    var authorizedUser = Roles.userIsInRole(this.userId, ['admin', 'moderator']);

    if (!authorizedUser) {
      var msg ="You do not have the required permission to add public tags";
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
