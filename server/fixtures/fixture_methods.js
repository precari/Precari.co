/*
    fixture_methods.js contains methods for populating the db with test data.
    Some of this code is duplicates of the collection code, but Meteor was
    generating errors when tryign to access Meteor methods in lib.
*/

//----------------------------- Constannsts ------------------------------------

/* Denotes a private tag */
PRIVATE_TAG_CHAR = '~';

//--------------------------- Precari methods ----------------------------------

Meteor.precariFixtureMethods = {

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
};
