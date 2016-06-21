

/*
  Use to determine state
  Meteor.isDevelopment
  Meteor.isProduction
  Meteor.isTest
  Meteor.isAppTest
*/


// Print some start up info
console.log('');
console.log('** Starting instance **');
console.log('ROOT_URL: ------------------> ' + process.env.ROOT_URL);
console.log('isDevelopment : ------------> ' + Meteor.isDevelopment);
console.log('isTest : -------------------> ' + Meteor.isTest);
console.log('isAppTest : ----------------> ' + Meteor.isAppTest);
console.log('isProduction : -------------> ' + Meteor.isProduction);
console.log('');

// Process the one-time events when staging the server for production
if (Meteor.precariFixtureMethods.stageCurrentInstance()) {
  try {

    // Set users collection in the Houston admin panel
    Houston.add_collection(Meteor.users);
    Houston.add_collection(Houston._admins);

  } catch (e) {
      console.log(e);
  }
}

// Process anything that needs to happen each time Meteor starts
Meteor.startup( function() {
  process.env.MAIL_URL = Meteor.settings.mail.url;
});
