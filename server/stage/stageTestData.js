

Meteor.stageTestData = {

  /**
   * Determines if the environment is specifically a staging environment
   * @return Boolean true if the environment is a staging env, otherwise false
   */
  instanceData: function() {

      if (Meteor.users.find().count() > 0) {
        console.log('   *** Users already exist. Cannot create test data.');
        console.log("       Run 'meteor reset' to add the test data");
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

        // Build some tag KV pair objects
        var publicTag1 = Meteor.fixtureMethods.buildTagKVPair('public', 'tag1-in all posts');
        var publicTag2 = Meteor.fixtureMethods.buildTagKVPair('public', 'tag2-in all posts');
        var publicTag3 = Meteor.fixtureMethods.buildTagKVPair('public', faker.lorem.words(1).toString());
        var user1PublicTag = Meteor.fixtureMethods.buildTagKVPair('public', user1.profile.name);
        var user2PublicTag = Meteor.fixtureMethods.buildTagKVPair('public', user2.profile.name);
        var user3PublicTag = Meteor.fixtureMethods.buildTagKVPair('public', user3.profile.name);
        var privateTag1 = Meteor.fixtureMethods.buildTagKVPair('private', 'tag1-in all posts');
        var privateTag2 = Meteor.fixtureMethods.buildTagKVPair('private', 'tag2-in all posts');
        var privateTag3 = Meteor.fixtureMethods.buildTagKVPair('private', faker.lorem.words(1).toString());

        // Insert the public tags
        Meteor.fixtureMethods.publicTagInsert(publicTag1);
        Meteor.fixtureMethods.publicTagInsert(publicTag2);
        Meteor.fixtureMethods.publicTagInsert(publicTag3);
        Meteor.fixtureMethods.publicTagInsert(user1PublicTag);
        Meteor.fixtureMethods.publicTagInsert(user2PublicTag);
        Meteor.fixtureMethods.publicTagInsert(user3PublicTag);

        // Insert the private tags
        var u1pvtTag1 = Meteor.fixtureMethods.privateTagInsert(privateTag1, user1._id);
        var u1pvtTag2 = Meteor.fixtureMethods.privateTagInsert(privateTag2, user1._id);
        var u1pvtTag3 = Meteor.fixtureMethods.privateTagInsert(privateTag3, user1._id);
        var u2pvtTag1 = Meteor.fixtureMethods.privateTagInsert(privateTag1, user2._id);
        var u2pvtTag2 = Meteor.fixtureMethods.privateTagInsert(privateTag2, user2._id);
        var u2pvtTag3 = Meteor.fixtureMethods.privateTagInsert(privateTag3, user2._id);

        // Add some additional data
        for (var i = 0; i <= 15; i++) {

          var tag = Meteor.fixtureMethods.buildTagKVPair
                    ('public', faker.lorem.words(3).toString().replace(/,/g , ' '));
          var pvTag = Meteor.fixtureMethods.buildTagKVPair
                    ('private', faker.lorem.words(3).toString().replace(/,/g , ' '));

          // Insert the tag for the posttag
          Meteor.fixtureMethods.publicTagInsert(tag);
          Meteor.fixtureMethods.privateTagInsert(pvTag, user2._id);

          var bodyParaCount = i + 1;
          if (i > 20) {
            bodyParaCount = 20;
          }

          post = {
            title: faker.lorem.sentence(),
            userId: user2._id,
            author: user2.profile.name,
            bodyMessage: faker.lorem.paragraphs(bodyParaCount),
            submitted: new Date(now - i - 15 * 3600 * 1000 + 1),
            commentsCount: 0,
            precatis: [],
            prayedCount: 0,
            publicTags:[publicTag1, user2PublicTag, tag],
            privateTags:[privateTag1, privateTag2, pvTag],
            visibility: 'public'
          };

          try {
            Posts.schema.clean(post);
            Posts.schema.validate(post);
            Posts.insert(post);

            console.log('Added post: ' + post.title);

          } catch (e) {
            console.log(e);
            console.log(post.title);
            console.log(post.userId);
            console.log(post.author);
            console.log(post.submitted);
            console.log(post.bodyMessage);
            console.log(post.publicTags);
            console.log(post.privateTags);
            console.log(post.publicTags.length);
            console.log(post.privateTags.length);

            // Stop here to see debug data
            return;
          }
        }

        console.log('');
        console.log('Created posts...');
        console.log('Fixture data created!');
      }
  },
};

// Creates a few test users
instanceTestData = function() {
};
