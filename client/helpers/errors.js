/*
 * Client side only collections for displaying messages
 */

 // ------------------------ Success Messages ----------------------------------

 SuccessMessages = new Mongo.Collection(null);

 throwSuccess = function(message) {
   SuccessMessages.insert({message: message});
 };

 // ------------------------ Info Messages -------------------------------------

 InfoMessages = new Mongo.Collection(null);

 throwInfo = function(message) {
   InfoMessages.insert({message: message});
 };

// ------------------------ Warning Messages ------------------------------------

WarningMessages = new Mongo.Collection(null);

throwWarning = function(message) {
  WarningMessages.insert({message: message});
};

// ------------------------ Error Messages -------------------------------------

ErrorMessages = new Mongo.Collection(null);

throwError = function(message) {
  ErrorMessages.insert({message: message});
};
