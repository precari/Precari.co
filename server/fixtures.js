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


  var telescopeId = Posts.insert({
    title: 'Introducing Telescope',
    userId: test1._id,
    author: test1.profile.name,
    url: 'http://test1greif.com/introducing-telescope/',
    submitted: new Date(now - 7 * 3600 * 1000),
    commentsCount: 2,
    upvoters: [], votes: 0
  });

  Comments.insert({
    postId: telescopeId,
    userId: test2._id,
    author: test2.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'Interesting project test1, can I get involved?'
  });

  Comments.insert({
    postId: telescopeId,
    userId: test1._id,
    author: test1.profile.name,
    submitted: new Date(now - 3 * 3600 * 1000),
    body: 'You sure can test2!'
  });

  Posts.insert({
    title: 'Meteor',
    userId: test2._id,
    author: test2.profile.name,
    url: 'http://meteor.com',
    submitted: new Date(now - 10 * 3600 * 1000),
    commentsCount: 0,
    upvoters: [], votes: 0
  });

  Posts.insert({
    title: 'The Meteor Book',
    userId: test2._id,
    author: test2.profile.name,
    url: 'http://themeteorbook.com',
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    upvoters: [], votes: 0
  });

  for (var i = 0; i < 10; i++) {
    Posts.insert({
      title: 'Test post #' + i,
      author: test1.profile.name,
      userId: test1._id,
      url: 'http://google.com/?q=test-' + i,
      submitted: new Date(now - i * 3600 * 1000 + 1),
      commentsCount: 0,
      upvoters: [], votes: 0
    });
  }
}
