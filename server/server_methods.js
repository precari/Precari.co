
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
      password: Math.random().toString(36).substr(2, 10)
    };
  },

  /**
   * Determines the environment
   * @return String The value of the current environment (development or production)
   */
  getEnvironment: function() {
    if (process.env.ROOT_URL === 'http://localhost:3000') {
        return 'development';
    } else {
        return 'production';
    }
  }
});
