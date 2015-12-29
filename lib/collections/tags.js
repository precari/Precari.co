// The collection for tags in the posts
Tags = new Mongo.Collection('tags');

Meteor.methods({

  /**
   * Formats the tag array as private tags
   * @param array tagArray The array of tags to format as private
   */
   formatTagsPrivate: function(tagArray) {

      check(tagArray, [String]);

      for (var i = 0; i < tagArray.length; i++) {
        var tag = tagArray[i];
        var tagIsPrivate =   Meteor.precariMethods.tags.isPrivateTag(tag);

        // Format and add some random character and denote as private
        if (!tagIsPrivate) {
          tagArray[i] = PRIVATE_TAG_CHAR + tag;
        }
      }

      return tagArray;
   },

  /**
   * Inserts an array of tags into the Tags collection (or db). If tags by
   * the same name already exist, duplicates are not created.
   * @param array tagArray The array of tags to insert
   */
   tagInsertByArray: function(tagArray) {

      check(tagArray, [String]);

      for (var i = 0; i < tagArray.length; i++) {
        Meteor.call('tagInsert', tagArray[i]);
      }
   },

  /**
   * Inserts the tag into the Tags collection (or db). If a tag by the same
   * name already exists, the ID of the exising tag is returned
   * @param string tag The tag to insert
   * @return string The id of the inserted tag or the id an exising tog by
                    same name.
   */
  tagInsert: function(tag) {

    check(tag, String);

    // Get the tag by name to check if it exists
    var tagExists = Tags.findOne({name: tag});

    // If the tag does not exist, add it
    if (!tagExists) {

      // Determine the tag privacy. The first char is the indicator if the
      // tag is private
      privateTag = tag.indexOf(PRIVATE_TAG_CHAR) === 0;

      var tagId = Tags.insert({
        name:     tag,
        private:  privateTag
      });

      // Return the ID of the new tag
      return {
        _id: tagId
      };
    } else {

      // Return the ID of the existing tag
      return {
        _id: tagExists._id
      };
    }
  }
});
