// The collection for posts
Posts = new Mongo.Collection('posts');

Posts.schema = new SimpleSchema({
  title: {                  // The title of request/post
     type: String,
     label: "Title",
  },
  bodyMessage:  {           // The message of request/post in the body
     type: String,
     label: "Prayer request",
  },
  publicTags: {             // KV pair {name: text}
    type: [Object],
    label: "Public tags",
  },
  privateTags: {            // KV pair {label: text}
    type: [Object],
    label: "Private tags",
  },
  'publicTags.$.name': {    // Name of the private tag
    type: String,
    max: 50,
    label: "Public tag visible name",
  },
  'privateTags.$.label': {  // label of the private tag
    type: String,
    max: 50,
    label: "Private tag visible name",
  },
  visibility: {             // visibility setting of where the post is visible
    type: String,
    defaultValue: 'private',
    label: "Prayer request privacy settings",
  },
  userId: {               // unique id of the author
    type: String,
    label: "The author's ID of prayer request",
  },
  author: {               // username of the author
    type: String,
    label: "The author prayer request",
  },
  submitted: {           // date created
    type: Date,
    label: "The date submitted",
  },
  commentsCount: {       // the number of comments
    type: Number,
    label: "The number of comments on the prayer request",
  },
  precatis: {            // precatis: those who prays. (pray-ers didn't work)
    type: [String],
    label: "Those who have clicked the prayed button",
  },
  prayedCount: {
    type: Number,
    label: "The number of times the pray button has been clicked",
  },
});

// Attach the schema for auto validation
Posts.attachSchema(Posts.schema);

// For allow / deny explanation, see https://book.discovermeteor.com/chapter/allow-and-deny
// If one allow is true, then the allow condition is satisfied
// If one deny is true, then the request is denied

// Set the allow conditions
Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); },
});

Posts.deny({
  update: function(userId, post, fieldNames) {

    // may only edit the following fields:
    return (_.without(fieldNames,
              'bodyMessage', 'title', 'publicTags', 'privateTags').length > 0);
  }
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {

    // If post validation fails, the post is denied
    var errors = validatePost(modifier.$set);
    return errors.title || errors.bodyMessage || errors.publicTags || errors.privateTags;
  }
});

/**
 * Validates the post before allowing the submissions
 * @param collection post The post data to Validates
 * @return collection Any generated error. An empty collection if no errors.
 */
validatePost = function (post) {

  // Clear any errors
  var errors = {};

  if (!post.title) {
    errors.title = "Please add a tile";
  }

  if (!post.bodyMessage) {
    errors.bodyMessage =  "Please add a prayer request";
  }

  if (post.publicTags.length <= 0 && post.privateTags.length <= 0) {
    errors.publicTags =  "Please add at least one tag";
    errors.privateTags =  "Please add at least one tag";
  }

  return errors;
};

// ------------------------- Meteor methods -----------------------------------

Meteor.methods({

  /**
   * Inserts the post into the Posts collection
   * @param collection postData The data required for the post.
   * @return string The id of the inserted post, if successful. Otherwise,
   *                generates an error.
   */
  postInsert: function(postData) {

    // verify the arg data
    check(this.userId, String);
    check(postData, {
      title: String,
      bodyMessage: String,
      publicTags: [Object],
      privateTags: [Object],
      visibility: String,
    });

    // Non-UI errors. Hopefully the user never sees these
    var errors = validatePost(postData);
    if (errors.title || errors.bodyMessage || errors.publicTags || errors.privateTags) {
      var msg = 'You must set a title, description, and add at least one tag for your request';
      throw new Meteor.Error('invalid-post', msg);
    }

    // Set the post data and insert
    var user = Meteor.user();
    var post = _.extend(postData, {
      userId: user._id,           // unique id of the author
      author: user.profile.name,  // username of the author
      submitted: new Date(),      // date created
      commentsCount: 0,           // the number of comments
      precatis: [],               // precatis: those who prays. (pray-ers didn't work)
      prayedCount: 0              // the number of times prayed for
    });

    try {
      // Insert the tags into the collections
      Meteor.call('publicTagInsertByArray', postData.publicTags);
      Meteor.call('privateTagInsertByArray', postData.privateTags);
    } catch (e) {
        console.log(e);
    }

    // validate and insert the post
    Posts.schema.clean(post);
    Posts.schema.validate(post);
    var postId = Posts.insert(post);

    // Return the post ID
    return {
      _id: postId
    };
  },

  /**
   * Updates the post into the Posts collection
   * @param collection postData The data required for the post.
   * @param collection postMetadata Additional data about the post
   * @return string The id of the updated post, if successful. Otherwise,
   *                generates an error.
   */
  postUpdate: function(postData, postMetadata) {

    // verify the arg data
    check(this.userId, String);
    check(postData, {
      title: String,
      bodyMessage: String,
      publicTags: [Object],
      privateTags: [Object],
      visibility: String,
    });
    check(postMetadata, {
      postId: String,
    });

    // Non-UI errors. Hopefully the user never sees these
    var errors = validatePost(postData);
    if (errors.title || errors.bodyMessage || errors.publicTags || errors.privateTags) {
      var msg = 'You must set a title, description, and add at least one tag for your request';
      throw new Meteor.Error('invalid-post', msg);
    }

    try {
      // Update/Insert any tags.
      Meteor.call('publicTagInsertByArray', postData.publicTags);
      Meteor.call('privateTagInsertByArray', postData.privateTags);
    } catch (e) {
        console.log(e);
    }

    // validate and update the post
    Posts.schema.clean(postData);
    //Posts.schema.validate(postData);
    Posts.update(postMetadata.postId, {$set: postData});

    // Return the post ID
    return {
      _id: postMetadata.postId
    };
  },

  /**
   * Updates/marks the post/request as prayed for
   * @param string postId The ID of the post to mark as prayed for
   */
  prayedFor: function(postId) {

    // Verify a user is logged in and the post id is exists
    check(this.userId, String);
    check(postId, String);

    // Update the post with who prayed for it and increment the counter.
    var affected = Posts.update({
      _id: postId,
      precatis: {$ne: this.userId}
    }, {
      $addToSet: {precatis: this.userId},   // Set who clicked the button
      $inc: {prayedCount: 1}                // Increment the button click count
    });

    // Oops. The update never happened. Send the message
    if (!affected) {
      throw new Meteor.Error('invalid', "You weren't able to mark that request as prayed for.");
    }
  },
});
