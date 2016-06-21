
var isStagingEnvironment = Meteor.precariFixtureMethods.isStagingEnvironment();
var stageCurrentInstance = Meteor.precariFixtureMethods.stageCurrentInstance();

var createTestData = false;

// Check for current environment, output some messages, and stage as necessary
if (isStagingEnvironment) {
  console.log('Staging environment found. Staging instance...');
  console.log('');
  createTestData = true;
} else if (Meteor.isDevelopment && stageCurrentInstance) {
  console.log('Staging development instance...');
  console.log('');
  createTestData = true;
} else if (Meteor.isDevelopment && !stageCurrentInstance) {
  console.log('Development instance without stage');
  console.log('');
} else if (Meteor.isProduction) {
  console.log('Production instance without stage');
  console.log('');
}

// Creates a few test users
instanceTestData = function() {

  if (Meteor.users.find().count() > 0) {
    console.log('***** Users already exist. Cannot create test data.');
    console.log('Did you forget to run: meteor reset?');
    return;
  }

// ------------------------- Create test users ---------------------------------

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

    var publicTag1 = Meteor.precariFixtureMethods.buildTagKVPair('public', faker.lorem.words(1).toString());
    var publicTag2 = Meteor.precariFixtureMethods.buildTagKVPair('public', faker.lorem.words(1).toString());
    var publicTag3 = Meteor.precariFixtureMethods.buildTagKVPair('public', faker.lorem.words(1).toString());
    var user1PublicTag = Meteor.precariFixtureMethods.buildTagKVPair('public', user1.profile.name);
    var user2PublicTag = Meteor.precariFixtureMethods.buildTagKVPair('public', user2.profile.name);
    var user3PublicTag = Meteor.precariFixtureMethods.buildTagKVPair('public', user3.profile.name);
    var privateTag1 = Meteor.precariFixtureMethods.buildTagKVPair('private', faker.lorem.words(1).toString());
    var privateTag2 = Meteor.precariFixtureMethods.buildTagKVPair('private', faker.lorem.words(1).toString());
    var privateTag3 = Meteor.precariFixtureMethods.buildTagKVPair('private', faker.lorem.words(1).toString());

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


    // Add some additional data
    for (var i = 0; i <= 5; i++) {

      tag = Meteor.precariFixtureMethods.buildTagKVPair
                              ('public', faker.lorem.words(1).toString());

      // Insert the tag for the posttag
      Meteor.precariFixtureMethods.publicTagInsert(tag);

      post = {
        title: faker.lorem.sentence(),
        userId: user2._id,
        author: user2.profile.name,
        bodyMessage: faker.lorem.paragraphs(i + 5),
        submitted: new Date(now - i - 15 * 3600 * 1000 + 1),
        commentsCount: 0,
        precatis: [],
        prayedCount: 0,
        publicTags:[publicTag1, tag, user1PublicTag],
        privateTags:[privateTag1, privateTag2],
        visibility: 'public'
      };

      console.log('adding post: ' + post.title);

      Posts.schema.clean(post);
      Posts.schema.validate(post);
      Posts.insert(post);
    }

      console.log('');
      console.log('Created posts...');
      console.log('Fixture data created!');
  }

};

if (createTestData) {
  instanceTestData();
}
