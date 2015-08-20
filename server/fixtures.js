/**
 * Contains sample data
 */

// A check for current environment. If production, do not create seed data
if (process.env.ROOT_URL === 'http://localhost:3000/') {
     console.log('Starting development server');
 } else {
     console.log('Starting production server');
     return;
 }

// Fixture user data
if(Meteor.users.find().count() === 0) {

  console.log('No users found. creating....');

   // create real test users
   var userId1 = createTestUser('test1', 'test1');
   console.log('Created user 1: ' + userId1);

   var userId2 = createTestUser('test2', 'test2');
   console.log('Created user 2: ' + userId2);

   var userId3 = createTestUser('test3', 'test3');
   console.log('Created user 3: ' + userId3);
   console.log('');
 }

// Fixture post data
if (Posts.find().count() === 0) {

  if(!Meteor.users.findOne()) {
    console.log('No users exists. Cannot make post data');
    return;
  }

  console.log('Created posts...');

  var test1 = Meteor.users.findOne(userId1);
  var test2 = Meteor.users.findOne(userId2);
  var test3 = Meteor.users.findOne(userId3);

  if (!test1) {
    console.log('User data not created. Exiting...');
    return;
  }

  var now = new Date().getTime();

  var tag1 = 'tag 1';
  var tag2 = 'tag 2';
  var tag3 = 'tag 3';

  // Create test data
  var request1Id = Posts.insert({
    title: 'Request 1',
    userId: test1._id,
    author: test1.profile.name,
    prayer_request: 'This is request #1',
    submitted: new Date(now - 7 * 3600 * 1000),
    commentsCount: 2,
    precatis: [],
    prayedCount: 0,
    tags:[tag1]
  });

  Comments.insert({
    postId: request1Id,
    userId: test2._id,
    author: test2.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'User 2 comment for request 1'
  });

  Comments.insert({
    postId: request1Id,
    userId: test1._id,
    author: test1.profile.name,
    submitted: new Date(now - 3 * 3600 * 1000),
    body: 'User 1 follow up comment for request 1'
  });

  var request2Id = Posts.insert({
    title: 'Request 2',
    userId: test2._id,
    author: test2.profile.name,
    prayer_request: 'This is request #2',
    submitted: new Date(now - 10 * 3600 * 1000),
    commentsCount: 0,
    precatis: [userId1, userId2],
    prayedCount: 2,
    tags:[tag1, tag2]
  });

  Comments.insert({
    postId: request2Id,
    userId: test3._id,
    author: test3.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'User 3 comment for request 2'
  });

  Posts.insert({
    title: 'Request 3',
    userId: test3._id,
    author: test3.profile.name,
    prayer_request: 'This is request #3',
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    precatis: [userId1, userId3, userId3],
    prayedCount: 3,
    tags:[tag1, tag2, tag3]
  });

  Posts.insert({
    title: 'Taggless request',
    userId: test3._id,
    author: test3.profile.name,
    prayer_request: 'This a request without a tag',
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    precatis: [],
    prayedCount: 0,
    tags:[]
  });

  // Add some additional data
  for (var i = 0; i < 10; i++) {

    var tag = 'tag ' + i;

    Posts.insert({
      title: 'Test #' + i,
      author: test1.profile.name,
      userId: test1._id,
      prayer_request: 'Request # ' + i,
      submitted: new Date(now - i - 15 * 3600 * 1000 + 1),
      commentsCount: 0,
      precatis: [],
      prayedCount: 0,
      tags:[tag]
    });

    // Insert the tags into the Tag collection
    Meteor.call('tagInsert', tag);
  }
}

/**
 * Creates a test user
 */
function createTestUser(username, password) {
  var userId = Accounts.createUser({
                username: username,
                email : faker.internet.email(),
                password : password,
                profile  : {
                    name: faker.name.findName()
                }
  });

  var user = Meteor.users.findOne(userId);
  console.log('Created account for: ' + username);

  return userId;
}
