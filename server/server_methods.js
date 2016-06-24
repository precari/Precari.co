/*
    server_methods.js contains public-ish methods accessed server-side
*/

//------------------------------ Constants ------------------------------------

/* Denotes a private tag */
PRIVATE_TAG_CHAR = '~';

//--------------------------- Meteor methods ----------------------------------

Meteor.methods({

  /**
   * Using package digilord:faker, retrieves random data used for creating
   * anonymous accounts.
   * @return Object Random user data
   */
  randomUserData: function() {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      name: faker.name.findName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: Random.id(16),
    };
  },

  /**
    * Determine if the tag is marked as private
    * @param string tag Tag to determing the privacy setting of
    * @return Boolean True if the tag is private, otherwise false
    */
  isPrivateTag: function(tag) {

    check(tag, String);

    // If tag starts with the private tag char, then treat as private
    return (tag.indexOf(PRIVATE_TAG_CHAR) === 0);
  },

});
