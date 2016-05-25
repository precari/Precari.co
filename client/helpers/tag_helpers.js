/*
 * tag_helpers.js contains common helper functions for working with tags.
 * Access these methods by: Blaze._globalHelpers.funcName(arg)
 */

/**
 * Converts a tag array to a KV pair: {name: tagName} or {label: tagName}
 * @param Meteor.precariMethods.tagType tagType tag type to insert
 * @param Array tagArray An array containing the names of the tags: [tag1, tag2]
 * @return Array An array containing the KV data:
 *              [{name: tagName, private: tagPrivacy}]
 */
Template.registerHelper('convertTagsToKVPair', function(type, tagArray) {

  // Return empty array to prevent errors
  if (tagArray === undefined) {
     return [];
   }

   var tag;

  // convert to a KV pair
  for (var i = 0; i < tagArray.length; i++) {

    // If there is an undefined entry, continue to next tag
    // Some browsers (Edge, Opera) Initialize an array with a length of 1
    // var array = []  is really array = [undefined]
    if (tagArray[i] === undefined) {
      continue;
    }

    // Replace the text only entry with the object form
    tagArray[i] = Blaze._globalHelpers.buildDefaultTag(tagArray[i], type);
  }

  return tagArray;
});


/**
 * Gets the complete data for the private tag based on what the user has
 * access to.
 * @param Array tagArray An array containing the names of the tags: [tag1, tag2]
 * @return Array An array containing the KV data:
 *              [{name: tagName, private: tagPrivacy}]
 */
 Template.registerHelper('getFullPrivateTagObj', function(tagArray) {

  // Return empty array to prevent errors
  if (tagArray === undefined) {
     return [];
   }

  // Loop through tags getting the data
  for (var i = 0; i < tagArray.length; i++) {

    // If there is an undefined entry, continue to next tag
    // Some browsers (Edge, Opera) Initialize an array with a length of 1
    // var array = []  is really array = [undefined]
    if (tagArray[i] === undefined || tagArray[i].label === undefined ) {
      continue;
    }

    // Attempt to get the tag
    var privateTag = Blaze._globalHelpers.getTagData(tagArray[i].label,
                        Meteor.precariMethods.tagType.PRIVATE);

    if (privateTag === undefined) {
      continue;
    }

    // Add to array
    tagArray[i] = privateTag;
  }

  return tagArray;
});

/**
 * Inserts an HTML tag based on the type (public or private)
 * @param Meteor.precariMethods.tagType tagType tag type to insert
 * @param string name Name of the tag
 * @return Boolean True if successful, otherwise false
 */
Template.registerHelper('addTagToForm', function(tagType, tagName) {

  var publicTagType = Meteor.precariMethods.tagType.PUBLIC;
  var privateTagType = Meteor.precariMethods.tagType.PRIVATE;
  var tag;

  // Perform basic text fomatting
  tagName = tagName.replace(',', '');
  tagName = tagName.trim();

  // If the tag is empty, return false
  if (tagName === '') {
    return false;
  }

  if (tagType === publicTagType) {

    // Gets the correct tag format / fields
    tag = Blaze._globalHelpers.buildDefaultTag(tagName, publicTagType);
    Blaze.renderWithData(Template.publicTagItemWithRemoveGlyph,
      tag, $("#public-tag-cloud")[0]);

    return true;
  } else if (tagType === privateTagType) {

    // Gets the correct tag format / fields
    tag = Blaze._globalHelpers.buildDefaultTag(tagName, privateTagType);

    Blaze.renderWithData(Template.privateTagItemWithRemoveGlyph,
      tag, $("#private-tag-cloud")[0]);

    return true;
  }
});

/**
 * Builds a tag for display in the form
 * @param String tag Label of the tag to display
 * @param Meteor.precariMethods.tagType tagType tag type to find
 * @return Tag object A minimal PrivateTag/PublicTag object is successful
 */
Template.registerHelper('buildDefaultTag', function(tag, tagType) {

  if (tag === undefined) {
    return {};
  }

  var tagObj;

  switch (tagType) {
    case Meteor.precariMethods.tagType.PUBLIC:
      tagObj = { name: tag };
      break;
    case Meteor.precariMethods.tagType.PRIVATE:
      tagObj = { label: tag };
      break;
    default:
      tagObj = {};
  }

  return tagObj;
});

/**
 * Gets the a tag object from a search criteria (tagName, tagLabel)
 * @param String queryData name, label, id, ect in which to find the tag
 * @param Meteor.precariMethods.tagType tagType tag type to find
 * @return Tag object A matching PrivateTag/PublicTag object is successful
 */
Template.registerHelper('getTagData', function(queryData, tagType) {

  var collection;
  var userId = Meteor.user()._id;
  var result;

  // Determine collection to query
  if(tagType === Meteor.precariMethods.tagType.PUBLIC) {
    collection = PublicTags;
  } else if(tagType === Meteor.precariMethods.tagType.PRIVATE) {
    collection = PrivateTags;
  } else {
    return result;
  }

  // search for a label
  result = collection.findOne({label: queryData, userId: userId });
  if (result) {
    return result;
  }

  // search for a name
  result = collection.findOne({name: queryData, userId: userId });
  if (result) {
    return result;
  }

  // search for an id
  result = collection.findOne({_id: queryData, userId: userId });
  if (result) {
    return result;
  }

  // Nothing found. Returns undefined
  return result;
});
