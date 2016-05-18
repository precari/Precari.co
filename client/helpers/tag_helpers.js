/*
 * tag_helpers.js contains common helper functions for working with tags.
 * Access these methods by: Blaze._globalHelpers.funcName(arg)
 */

/**
 * Gets the user's tags from their posts.
 * @param Array posts The posts array to get the tags from (Posts.find().fetch())
 * @return Array A 2D array containing the arrays of taga.
 *          [publicTagArray {name: tagName}], [privateTagArray {name: tagName}]
 */
Template.registerHelper('getTagsFromPosts', function(posts) {

  var publicTagArray = [];
  var privateTagArray = [];

  // Return empty array to prevent errors
  if (posts === undefined) {
    return [publicTagArray, privateTagArray];
  }

  // Loop through the posts scraping all tag data
  for (var i = 0; i < posts.length; i++) {

    // Add the tags to the respective list
    publicTagArray = publicTagArray.concat(posts[i].publicTags);
    privateTagArray = privateTagArray.concat(posts[i].privateTags);
  }

  // Filter duplicates and then sort alphabetically
  publicTagArray = _.uniq(publicTagArray);
  publicTagArray = _.sortBy(publicTagArray, function (name) { return name; });

  privateTagArray = _.uniq(privateTagArray);
  privateTagArray = _.sortBy(privateTagArray, function (name) { return name; });

  // convert tag array to a KV pair { name: tag } to keep format with the
  // tag collections
  publicTagArray = Blaze._globalHelpers.convertTagsArrayToKVPair(publicTagArray);
  privateTagArray = Blaze._globalHelpers.convertPrivateTagsArrayToKVPair(privateTagArray);

  // Return the two tag arrays
  return [publicTagArray, privateTagArray];
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

    // Build the KV pair
    tagArray[i] = { name: tagArray[i] };
  }

  return tagArray;
});

Template.registerHelper('convertPrivateTagsArrayToKVPair', function(tagArray) {

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

    // Attempt to get the tag
    var privateTag = Blaze._globalHelpers.getTagData(tagArray[i],
                        Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name);

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
 * @param Meteor.precariMethods.tags.tagTypeEnum tagTypeEnum tag type to insert
 * @param string name Name of the tag
 * @return Boolean True if successful, otherwise false
 */
Template.registerHelper('addTagToForm', function(tagTypeEnum, tagName) {

  var publicTagType = Meteor.precariMethods.tags.tagTypeEnum.PUBLIC.name;
  var privateTagType = Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name;

  // Perform basic text fomatting
  tagName = tagName.replace(',', '');
  tagName = tagName.trim();

  // If the tag is empty, return false
  if (tagName === '') {
    return false;
  }

  if (tagTypeEnum === publicTagType) {

    // Gets the correct tag format / fields
    var publicTag = Blaze._globalHelpers.buildMinimalTag(tagName, publicTagType);

    Blaze.renderWithData(Template.publicTagItemWithRemoveGlyph,
      publicTag, $("#public-tag-cloud")[0]);
    return true;
  } else if (tagTypeEnum === privateTagType) {

    // Gets the correct tag format / fields
    var privateTag = Blaze._globalHelpers.buildMinimalTag(tagName, privateTagType);

    Blaze.renderWithData(Template.privateTagItemWithRemoveGlyph,
      privateTag, $("#private-tag-cloud")[0]);
    return true;
  }
});

/**
 * Builds a tag for display in the form
 * @param String tag Label of the tag to display
 * @param Meteor.precariMethods.tags.tagTypeEnum tagTypeEnum tag type to find
 * @return Tag object A minimal PrivateTag/PublicTag object is successful
 */
Template.registerHelper('buildMinimalTag', function(tag, tagTypeEnum) {

  // Determine collection to query
  if(tagTypeEnum === Meteor.precariMethods.tags.tagTypeEnum.PUBLIC.name) {
    return { name: tag };
  } else if(tagTypeEnum === Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name) {
    return { label: tag };
  } else {
    // Wrong enum type. Return empty object
    return {};
  }
});

/**
 * Gets the a tag object from a search criteria (tagName, tagLabel)
 * @param String queryData name, label, id, ect in which to find the tag
 * @param Meteor.precariMethods.tags.tagTypeEnum tagTypeEnum tag type to find
 * @return Tag object A matching PrivateTag/PublicTag object is successful
 */
Template.registerHelper('getTagData', function(queryData, tagTypeEnum) {

  var collection;
  var userId = Meteor.user()._id;
  var result;

  // Determine collection to query
  if(tagTypeEnum === Meteor.precariMethods.tags.tagTypeEnum.PUBLIC.name) {
    collection = PublicTags;
  } else if(tagTypeEnum === Meteor.precariMethods.tags.tagTypeEnum.PRIVATE.name) {
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
