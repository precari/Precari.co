/*
 * tag_helpers.js contains common helper functions for working with tags.
 * Access these methods by: Blaze._globalHelpers.funcName(arg)
 */

/**
 * Gets the user's tags from their posts.
 * @param Array posts The posts array to get the tags from (Posts.find().fetch())
 * @return Array A 2D array containing the arrays of taga.
 *          [tagArray {name: tagName}], [privateTagArray {name: tagName}]
 */
Template.registerHelper('getTagsFromPosts', function(posts) {

  var tagArray = [];
  var privateTagArray = [];

  // Return empty array to prevent errors
  if (posts === undefined) {
    return [tagArray, privateTagArray];
  }

  // Loop through the posts scraping all tag data
  for (var i = 0; i < posts.length; i++) {

    // Add the tags to the respective list
    tagArray = tagArray.concat(posts[i].tags);
    privateTagArray = privateTagArray.concat(posts[i].privateTags);
  }

  // Filter duplicates and then sort alphabetically
  tagArray = _.uniq(tagArray);
  tagArray = _.sortBy(tagArray, function (name) { return name; });

  privateTagArray = _.uniq(privateTagArray);
  privateTagArray = _.sortBy(privateTagArray, function (name) { return name; });

  // convert tag array to a KV pair { name: tag } to keep format with the
  // Tags collection
  tagArray = Blaze._globalHelpers.convertTagsArrayToKVPair(tagArray);
  privateTagArray = Blaze._globalHelpers.convertTagsArrayToKVPair(privateTagArray);

  // Return the two tag arrays
  return [tagArray, privateTagArray];
});

/**
 * Converts a tag array to a KV pair: {name: tagName}
 * @param Array tagArray An array containing the names of the tags: [tag1, tag2]
 * @return Array An array containing the KV data:
 *              [{name: tagName, private: tagPrivacy}]
 */
Template.registerHelper('convertTagsArrayToKVPair', function(tagArray) {

  // Return empty array to prevent errors
  if (tagArray === undefined) {
     return [];
   }

  // convert to a KV pair
  for (var i = 0; i < tagArray.length; i++) {

    // If there is an undefined entry, continue to next tag
    // Some browsers (Edge, Opera) Initialize an array with a length of 1
    // var array = []  is really array = [undefined]
    if (tagArray[i] === undefined) {
      continue;
    }

    // If the tag is already formmated in a KV pair, continue to next tag
    if (tagArray[i].name) {
      continue;
    }

    // Determine the tags privacy setting and build the KV pair
    var tagPrivacy = Meteor.precariMethods.tags.isPrivateTag(tagArray[i]);
    tagArray[i] = { name: tagArray[i], private: tagPrivacy };
  }

  return tagArray;
});

/**
 * Inserts an HTML tag based on the type (public or private)
 * @param Meteor.precariMethods.tags.tagTypeEnum tagTypeEnum tag type to insert
 * @param string name Name of the tag
 * @return Boolean True if successful, otherwise false
 */
Template.registerHelper('insertTag', function(tagTypeEnum, tagName) {

  var publicTag = Meteor.precariMethods.tags.tagTypeEnum.PUBLIC.name;
  var privateTag = Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name;

  // Perform basic text fomatting
  tagName = tagName.replace(',', '');
  tagName = tagName.trim();

  // If the tag is empty, return false
  if (tagName === '') {
    return false;
  }

  if (tagTypeEnum === publicTag) {
    Blaze.renderWithData(Template.publicTagItemWithRemoveGlyph,
      { name: tagName }, $("#public-tag-cloud")[0]);
    return true;
  } else if (tagTypeEnum === privateTag) {
    Blaze.renderWithData(Template.privateTagItemWithRemoveGlyph,
      { name: tagName }, $("#private-tag-cloud")[0]);
    return true;
  }
});
