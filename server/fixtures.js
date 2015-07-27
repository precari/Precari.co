/*
  Contains sample data
*/

// Fixture data
if (Posts.find().count() === 0) {
  var now = new Date().getTime();

  // create real test users
  var testId1 = Accounts.createUser({
                    username: 'test1',
                    email : '',
                    password : 'test1',
                    profile  : {
                        name: 'Test User 1'
                    }
    });
  var test1 = Meteor.users.findOne(testId1);

  var testId2 = Accounts.createUser({
                    username: 'test2',
                    email : '',
                    password : 'test2',
                    profile  : {
                        name: 'Test User 2'
                    }
    });
  var test2 = Meteor.users.findOne(testId2);

  var testId3 = Accounts.createUser({
                    username: 'test3',
                    email : '',
                    password : 'test3',
                    profile  : {
                        name: 'Test User 3'
                    }
    });
  var test3 = Meteor.users.findOne(testId3);

  // Create test data

  var request1Id = Posts.insert({
    title: 'Request 1',
    userId: test1._id,
    author: test1.profile.name,
    prayer_request: 'This is request #1',
    submitted: new Date(now - 7 * 3600 * 1000),
    commentsCount: 2,
    precatis: [], prayedCount: 0
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
    precatis: [], prayedCount: 0
  });

  Comments.insert({
    postId: request2Id,
    userId: test3._id,
    author: test3.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'User 3 comment for request 2'
  });

  var request3Id = Posts.insert({
    title: 'Request 3',
    userId: test2._id,
    author: test2.profile.name,
    prayer_request: 'This is request #3',
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    precatis: [], prayedCount: 0
  });

  for (var i = 0; i < 10; i++) {
    Posts.insert({
      title: 'Test #' + i,
      author: test1.profile.name,
      userId: test1._id,
      prayer_request: 'Request # ' + i,
      submitted: new Date(now - i - 15 * 3600 * 1000 + 1),
      commentsCount: 0,
      precatis: [], prayedCount: 0
    });
  }
}
