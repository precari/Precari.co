/**
 * Contains sample data
 */

/*
  Use to determine state
  Meteor.isDevelopment
  Meteor.isProduction
  Meteor.isTest
  Meteor.isAppTest
*/

var isStagingEnvironment = Meteor.precariFixtureMethods.isStagingEnvironment();
var stageCurrentInstance = Meteor.precariFixtureMethods.stageCurrentInstance();

// Print some start up info
console.log('** Starting server **');
console.log('ROOT_URL: ------------------> ' + process.env.ROOT_URL);
console.log('isStagingEnvironment--------> ' + isStagingEnvironment);
console.log('isDevelopment : ------------> ' + Meteor.isDevelopment);
console.log('isTest : -------------------> ' + Meteor.isTest);
console.log('isAppTest : ----------------> ' + Meteor.isAppTest);
console.log('isProduction : -------------> ' + Meteor.isProduction);
console.log('stageCurrentInstance : -----> ' + stageCurrentInstance);
console.log('');

var stage = false;

// Check for current environment, output some messages, and stage as necessary
if (isStagingEnvironment) {
  console.log('Staging environment found. Staging instance...');
  console.log('');
  stage = true;
} else if (Meteor.isDevelopment && stageCurrentInstance) {
  console.log('Staging development instance...');
  console.log('');
  stage = true;
} else if (Meteor.isDevelopment && !stageCurrentInstance) {
  console.log('Development instance without stage');
  console.log('');
} else if (Meteor.isProduction) {
  console.log('Production instance without stage');
  console.log('');
}

if (!stage) {
  return;
}

// ------------------------- Create test users ---------------------------------

// Fixture user data
if(Meteor.users.find().count() === 0) {

  /**
   * Creates a test user. Have inside of the if block should prevent it from
   * being called from the outside
   */
  var createTestUser = function (username, password, burner) {
    var userId = Accounts.createUser({
                  username: username,
                  email : faker.internet.email(),
                  password : password,
                  profile  : {
                      name: faker.name.findName(),
                      burner: burner
                  }
    });

    var user = Meteor.users.findOne(userId);
    console.log('Created account for: ' + username);

    return userId;
  };

   // create real test users
   var userId1 = createTestUser('test1', 'test1', false);
   console.log('Created user 1: ' + userId1);

   var userId2 = createTestUser('test2', 'test2', true);
   console.log('Created user 2: ' + userId2);

   var userId3 = createTestUser('test3', 'test3', false);
   console.log('Created user 3: ' + userId3);

   var userId4 = createTestUser('test4', 'test4', false);
   console.log('Created user 4: ' + userId4);
   console.log('');
 } else {
   console.log('Instance already staged.');
   console.log('');
 }

 // --------------------------- Add test posts ---------------------------------

 // Fixture post data
 if (Posts.find().count() === 0) {

   if(!Meteor.users.findOne()) {
     console.log('No users exists. Cannot make post data');
     return;
   }

   /**
    * If value is even, return true. Otherwise return false
    */
   var determinePrivate = function(value) {

     if (value % 2) {
       return true;
     } else {
       return false;
     }
   };

   var user1 = Meteor.users.findOne(userId1);
   var user2 = Meteor.users.findOne(userId2);
   var user3 = Meteor.users.findOne(userId3);
   var user4 = Meteor.users.findOne(userId4);

   if (!user1) {
     console.log('User data not created. Exiting...');
     return;
   }

   var now = new Date().getTime();

   var tag1 = 'tag 1';
   var tag2 = 'tag 2';
   var tag3 = 'tag 3';
   var privateTagLabel1 = 'pvt-tag 1';
   var privateTagLabel2 = 'pvt-tag 2';
   var privateTagLabel3 = 'pvt-tag 3';

   // Inserert the tags
   Meteor.precariFixtureMethods.publicTagInsert(tag1);
   Meteor.precariFixtureMethods.publicTagInsert(tag2);
   Meteor.precariFixtureMethods.publicTagInsert(tag3);
   Meteor.precariFixtureMethods.publicTagInsert(user1.profile.name);
   Meteor.precariFixtureMethods.publicTagInsert(user2.profile.name);
   Meteor.precariFixtureMethods.publicTagInsert(user3.profile.name);

   // test for duplicate
   var u1pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel1, user1._id);
   var u2pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel1, user2._id);
   var u2pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel2, user2._id);
   var u3pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel1, user3._id);
   var u3pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel2, user3._id);
   var u3pvtTag3 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel3, user3._id);
   var u4pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel1, user4._id);
   var u4pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel2, user4._id);
   var u4pvtTag3 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel3, user4._id);


   // Create test data
   var request1Id = Posts.insert({
     title: 'Request 1 (private)',
     userId: user1._id,
     author: user1.profile.name,
     prayerRequest: 'This is request #1',
     submitted: new Date(now - 7 * 3600 * 1000),
     commentsCount: 2,
     precatis: [],
     prayedCount: 0,
     publicTags:[tag1, user1.profile.name],
     privateTags:[u1pvtTag1.label],
     private: true
   });

   Comments.insert({
     postId: request1Id,
     userId: user2._id,
     author: user2.profile.name,
     submitted: new Date(now - 5 * 3600 * 1000),
     body: 'User 2 comment for request 1'
   });

   Comments.insert({
     postId: request1Id,
     userId: user1._id,
     author: user1.profile.name,
     submitted: new Date(now - 3 * 3600 * 1000),
     body: 'User 1 follow up comment for request 1'
   });

   var request2Id = Posts.insert({
     title: 'Request 2 (public)',
     userId: user2._id,
     author: user2.profile.name,
     prayerRequest: 'This is request #2',
     submitted: new Date(now - 10 * 3600 * 1000),
     commentsCount: 0,
     precatis: [userId1, userId2],
     prayedCount: 2,
     publicTags:[tag1, tag2, user2.profile.name],
     privateTags:[u2pvtTag1.label, u2pvtTag2.label],
     private: false
   });

   Comments.insert({
     postId: request2Id,
     userId: user3._id,
     author: user3.profile.name,
     submitted: new Date(now - 5 * 3600 * 1000),
     body: 'User 3 comment for request 2'
   });

    Posts.insert({
      title: 'Request 3 (private)',
      userId: user3._id,
      author: user3.profile.name,
      prayerRequest: 'This is request #3',
      submitted: new Date(now - 12 * 3600 * 1000),
      commentsCount: 0,
      precatis: [userId1, userId3, userId3],
      prayedCount: 3,
      publicTags:[tag1, tag2, tag3, user3.profile.name],
      privateTags:[u3pvtTag1.label, u3pvtTag2.label, u3pvtTag3.label],
      private: true
    });

     Posts.insert({
       title: 'test4 request - no public tags',
       userId: user4._id,
       author: user4.profile.name,
       prayerRequest: 'This is request for test4',
       submitted: new Date(now - 12 * 3600 * 1000),
       commentsCount: 0,
       precatis: [userId1, userId3, userId3],
       prayedCount: 3,
       publicTags:[],
       privateTags:[u4pvtTag1.label, u4pvtTag2.label, u4pvtTag3.label],
       private: true
     });

   Posts.insert({
     title: 'Request 4 (public)',
     userId: user3._id,
     author: user3.profile.name,
     prayerRequest: 'This a request without a tag',
     submitted: new Date(now - 12 * 3600 * 1000),
     commentsCount: 0,
     precatis: [],
     prayedCount: 0,
     publicTags:[user3.profile.name],
     privateTags:[],
     private: false
   });

   // Add some additional data
   for (var i = 0; i <= 20; i++) {

     var tag = 'tag ';
     // var tag = 'tag ' + i;

    if (i > 10) {
       tag += i - 10;
     } else {
       tag += i;
     }

     // Insert the tag for the post
     Meteor.precariFixtureMethods.publicTagInsert(tag);
     var u1pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(tag, user1._id);
     var u1pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTagLabel2, user1._id);

     Posts.insert({
       title: 'Test #' + i,
       author: user1.profile.name,
       userId: user1._id,
       prayerRequest: 'Request # ' + i,
       submitted: new Date(now - i - 15 * 3600 * 1000 + 1),
       commentsCount: 0,
       precatis: [],
       prayedCount: 0,
       publicTags:[tag1, tag, user1.profile.name],
       privateTags: [u1pvtTag1.label, u1pvtTag2.label],
       private: determinePrivate(i)
     });
   }

   console.log('Created posts...');
   console.log('Fixture data created!');
 }
