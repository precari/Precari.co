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
console.log('** Starting instance **');
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
if (Meteor.users.find().count() === 0) {

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
                      name: faker.name.firstName(),
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

  var user1 = Meteor.users.findOne(userId1);
  var user2 = Meteor.users.findOne(userId2);
  var user3 = Meteor.users.findOne(userId3);
  var user4 = Meteor.users.findOne(userId4);

  if (!user1) {
    console.log('User data not created. Exiting...');
    return;
  }

  var now = new Date().getTime();

  var publicTag1 = Meteor.precariFixtureMethods.buildTagKVPair('public', 'tag 1');
  var publicTag2 = Meteor.precariFixtureMethods.buildTagKVPair('public', 'tag 2');
  var publicTag3 = Meteor.precariFixtureMethods.buildTagKVPair('public', 'tag 3');
  var user1PublicTag = Meteor.precariFixtureMethods.buildTagKVPair('public', user1.profile.name);
  var user2PublicTag = Meteor.precariFixtureMethods.buildTagKVPair('public', user2.profile.name);
  var user3PublicTag = Meteor.precariFixtureMethods.buildTagKVPair('public', user3.profile.name);
  var privateTag1 = Meteor.precariFixtureMethods.buildTagKVPair('private', 'pvt-tag 1');
  var privateTag2 = Meteor.precariFixtureMethods.buildTagKVPair('private', 'pvt-tag 2');
  var privateTag3 = Meteor.precariFixtureMethods.buildTagKVPair('private', 'pvt-tag 3');

  // Insert the public tags
  Meteor.precariFixtureMethods.publicTagInsert(publicTag1);
  Meteor.precariFixtureMethods.publicTagInsert(publicTag2);
  Meteor.precariFixtureMethods.publicTagInsert(publicTag3);
  Meteor.precariFixtureMethods.publicTagInsert(user1PublicTag);
  Meteor.precariFixtureMethods.publicTagInsert(user2PublicTag);
  Meteor.precariFixtureMethods.publicTagInsert(user3PublicTag);

  // Insert the private tags
  var u1pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTag1, user1._id);
  var u1pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTag2, user1._id);
  var u1pvtTag3 = Meteor.precariFixtureMethods.privateTagInsert(privateTag3, user1._id);
  var u2pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTag1, user2._id);
  var u2pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTag2, user2._id);
  var u2pvtTag3 = Meteor.precariFixtureMethods.privateTagInsert(privateTag3, user2._id);
  var u3pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTag1, user3._id);
  var u3pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTag2, user3._id);
  var u3pvtTag3 = Meteor.precariFixtureMethods.privateTagInsert(privateTag3, user3._id);
  var u4pvtTag1 = Meteor.precariFixtureMethods.privateTagInsert(privateTag1, user4._id);
  var u4pvtTag2 = Meteor.precariFixtureMethods.privateTagInsert(privateTag2, user4._id);
  var u4pvtTag3 = Meteor.precariFixtureMethods.privateTagInsert(privateTag3, user4._id);

  // Create test data
  var post = {
    title: 'Request 1 (private)',
    userId: user1._id,
    author: user1.profile.name,
    bodyMessage: faker.lorem.paragraphs(3),
    submitted: new Date(now - 7 * 3600 * 1000),
    commentsCount: 2,
    precatis: [],
    prayedCount: 0,
    publicTags:[publicTag1, user1PublicTag],
    privateTags:[privateTag1],
    visibility: 'private'
  };

  Posts.schema.clean(post);
  Posts.schema.validate(post);
  var request1Id = Posts.insert(post);

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

  post = {
    title: 'Request 2 (URL/Link)',
    userId: user2._id,
    author: user2.profile.name,
    bodyMessage: faker.lorem.paragraphs(1),
    submitted: new Date(now - 10 * 3600 * 1000),
    commentsCount: 0,
    precatis: [userId1, userId2],
    prayedCount: 2,
    publicTags:[publicTag1, publicTag2, user2PublicTag],
    privateTags:[privateTag1, privateTag2],
    visibility: 'link'
  };

  Posts.schema.clean(post);
  Posts.schema.validate(post);
  var request2Id = Posts.insert(post);

  Comments.insert({
    postId: request2Id,
    userId: user3._id,
    author: user3.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'User 3 comment for request 2'
  });

  post = {
    title: 'Request 3 (Tag)',
    userId: user3._id,
    author: user3.profile.name,
    bodyMessage: faker.lorem.paragraphs(2),
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    precatis: [userId1, userId3, userId3],
    prayedCount: 3,
    publicTags:[publicTag1, publicTag2, publicTag3, user3PublicTag],
    privateTags:[privateTag1, privateTag2, privateTag3],
    visibility: 'tag'
  };

  Posts.schema.clean(post);
  Posts.schema.validate(post);
  Posts.insert(post);

  post = {
     title: 'test4 request - no public tags',
     userId: user4._id,
     author: user4.profile.name,
     bodyMessage: faker.lorem.paragraphs(3),
     submitted: new Date(now - 12 * 3600 * 1000),
     commentsCount: 0,
     precatis: [userId1, userId3, userId3],
     prayedCount: 3,
     publicTags:[],
     privateTags:[privateTag1, privateTag2, privateTag3],
     visibility: 'public'
   };

   Posts.schema.clean(post);
   Posts.schema.validate(post);
   Posts.insert(post);

  posts = {
    title: 'Request 4 (public)',
    userId: user3._id,
    author: user3.profile.name,
    bodyMessage: faker.lorem.paragraphs(3),
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    precatis: [],
    prayedCount: 0,
    publicTags:[user3PublicTag],
    privateTags:[],
    visibility: 'public'
  };

  Posts.schema.clean(post);
  Posts.schema.validate(post);
  Posts.insert(post);

  // Add some additional data
  for (var i = 0; i <= 5; i++) {

    var tag = 'tag ';
    // var tag = 'tag ' + i;

    if (i > 10) {
      tag += i - 10;
    } else {
      tag += i;
    }

    tag = Meteor.precariFixtureMethods.buildTagKVPair('public', tag);

    // Insert the tag for the posttag
    Meteor.precariFixtureMethods.publicTagInsert(tag);

    post = {
      title: 'Test #' + i,
      author: user1.profile.name,
      userId: user1._id,
      bodyMessage: faker.lorem.paragraphs(i),
      submitted: new Date(now - i - 15 * 3600 * 1000 + 1),
      commentsCount: 0,
      precatis: [],
      prayedCount: 0,
      publicTags:[publicTag1, tag, user1PublicTag],
      privateTags: [privateTag1, privateTag2],
      visibility: 'public'
    };

    Posts.schema.clean(post);
    Posts.schema.validate(post);
    Posts.insert(post);
  }

   console.log('Created posts...');
   console.log('Fixture data created!');
}
