// Local (client-only) collection for tracking errors
Errors = new Mongo.Collection(null);

throwError = function(message) {
  Errors.insert({message: message});
};
