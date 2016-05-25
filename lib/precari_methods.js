/*
  precari_functions.js contains project wide methods
*/

//------------------------------ Constants ------------------------------------

/* Denotes a private tag */
PRIVATE_TAG_CHAR = '~';

//--------------------------- Precari methods ----------------------------------

Meteor.precariMethods = {

  /**
   * Converts a comma dilmented list to an array. It also trims any leading or
   * trailing whitespaces from each item
   * @param string commaList A comma dilmented text string
   * @return array An array containing each element from the list
   */
  convertCommaListToArray: function(commaList) {

    var initialArray = commaList.split(',');
    var finalArray = [];

    // From: https://stackoverflow.com/questions/3245088/how-to-split-a-comma-separated-string-and-process-in-a-loop-using-javascript
    // Alternative: 'Hello, cruel , world!'.split(/\s*,\s*/);
    // But, this does not remove the trailing whitespace from the last element

    for(var i = 0; i < initialArray.length; i++) {

      // Trim the excess whitespace before or after the
      var value = initialArray[i].replace(/^\s*/, '').replace(/\s*$/, '');

      // If the value is not empty, add to the array
      if (value !== '') {
        finalArray.push(value);
      }
    }

    return finalArray;
  },

  /**
   * Performs a basic syntax check on an email address. The only true test
   * is to send a verification email. This expression is from:
   * https://stackoverflow.com/questions/46155/validate-email-address-in-javascript
   * @param String email Email address to validate
   * @return Boolean True if the email is valid, otherwise false
   */
  validateEmail: function(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  },

};

// ----------------------- Tag related methods ---------------------------------

Meteor.precariMethods.tagType = {
    PRIVATE:  'private',
    PUBLIC:   'public',
};

Meteor.precariMethods.visibility = {
    PRIVATE:  'private',
    LINK:     'link',
    TAG:      'tag',
    PUBLIC:   'public',
};
