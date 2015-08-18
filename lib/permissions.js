/**
 * Check that the userId specified owns the documents
 * @param String userId The id of the user to Verify
 * @param String doc The document to verify against the specified user
 * @return Boolean true if the userId mathes document's userId
 */
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
};

/**
 * Checks that the userId is the logged in user
 * @param String userId The id of the user to verify
 * @return Boolean true if the userId mathes the logged in user
 */
ownsUserId = function (userId) {
  return Meteor.user()._id === userId;
};
