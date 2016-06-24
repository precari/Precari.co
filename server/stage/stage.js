
Meteor.stage = {

  /**
   * Determines if the environment is specifically a staging environment
   * @return Boolean true if the environment is a staging env, otherwise false
   */
  isStagingEnvironment: function() {

    // Attempt to get settings var. If undefined, generates a TypeError
    try {

      // If env is staging, return true
      if (Meteor.settings.env.environment === 'staging') {
        return true;
      } else {
        return false;
      }

    } catch (e) {
        console.log(e);
        return false;
    }
  },

  /**
   * Determine if the instance should be staged
   * @return Boolean true to stage the instance, otherwise false
   */
  stageCurrentInstance: function() {

    // Attempt to get staging flag. If undefined, generates a TypeError
    try {

      // If env is staging, always stage
      if (Meteor.stage.isStagingEnvironment()) {
        return true;
      }

      // If development with staging flag set for instance, stage
      if (Meteor.isDevelopment && Meteor.settings.env.stage === 'true') {
        return true;
      }

      // Otherwise. Do not stage.
      return false;

    } catch (e) {
        console.log(e);
        return false;
    }
  },

  /**
   * Determines if the environment is specifically a staging environment
   * @return Boolean true if the environment is a staging env, otherwise false
   */
  stageTestData: function() {
    Meteor.stageTestData.instanceData();
  },

  stageCentralAsiaRegion: function() {
    Meteor.stageRegionData.centralAsia();
  }
};
