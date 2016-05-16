// The collection for tags in the posts
PrivateTags = new Mongo.Collection('privateTags');

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

});
