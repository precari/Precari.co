// The collection for tags in the posts
Tags = new Mongo.Collection('tags');
var privateTagChar = '~';

Meteor.methods({

  /**
   * Formats the tag array as private tags
   * @param array tagArray The array of tags to format as private
   */
   formatTagsPrivate: function(tagArray) {

      check(tagArray, [String]);

      for (var i = 0; i < tagArray.length; i++) {
        var tag = tagArray[i];
        var tagExists = Tags.findOne({name: tag});
        var tagIsPrivate = (tag.indexOf(privateTagChar) === 0);

        /*
          Cases for making a tag private:
            * Tag does not exist              Result: create private tag
            * Tag exists, but in public form  Result: convert to private tag
            * If tag exists and is private, ignore
        */

        // Format and add some random character and denote as private
        if (!tagExists || !tagIsPrivate) {
          tagArray[i] = privateTagChar + tag + '-' + (0|Math.random()*9e6).toString(36);
          // Random algorithm is from:
          // https://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
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
      privateTag = tag.indexOf(privateTagChar) === 0;

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
