
// -------------------------------- Controllers --------------------------------

/**
 * A route controller is simply a way to group routing features together in a
 * nifty reusable package that any route can inherit from.
 * see https://book.discovermeteor.com/chapter/pagination
*/

// ----------------------------- Base Controllers ------------------------------

/**
 * The base route controller for the postsList template, where all posts
 * are displayed as a list
 */
PostsListController = RouteController.extend({
  template: 'postsList',
  increment: parseInt(Meteor.settings.public.postsPerPage),

  // Limit the data set to only return a set portion
  postsLimit: function() {
    return parseInt(this.params.postsLimit) || this.increment;
  },

  // Get the options object for .find()
  findOptions: function() {
    return { sort: this.sort, limit: this.postsLimit() };
  },

  // Determines the ready state of the subscriptions
  getReadyState: function(subscription) {

    // undefined check
    if (subscription === undefined) {
      return false;
    }

    // Start with true and set false if any subscription is not ready
    ready = true;

    // If not array, return the subscription ready state as is
    if (!Array.isArray(subscription)) {
      ready = subscription.ready();
    } else {
      // If array, process each subscription and check the value
      for (var i = 0; i < subscription.length; i++) {
        if (!subscription[i].ready()) {
          ready = subscription[i].ready();
        }
      }
    }

    return ready;
  },

  // The data context for the template. This is what gets passed to the
  // specified template
  data: function() {
    var self = this;
    return {
      posts: self.posts(),
      ready: self.getReadyState(self.postsSub),

      // Get the path for pagination button
      nextPath: function() {
        if (self.posts().count() === self.postsLimit())
          return self.nextPath();
      }
    };
  }
});

/**
 * The base route controller for the postsList template with rendering
 * the dataNotFound templates
 */
PostsListControllerDataNotFound = PostsListController.extend({

  // The data context for the template. This is what gets passed to the
  // specified template
  data: function() {

    // If not data, generate the the dataNotFound template
    if (this.posts() === undefined || this.posts().count() <= 0) {
      return undefined;
    }

    // At this point, it would be helpful to call the parent object,
    // but could not  figure out how to.

    var self = this;
    return {
      posts: self.posts(),
      ready: self.getReadyState(self.postsSub),

      // Get the path for pagination button
      nextPath: function() {
        if (self.posts().count() === self.postsLimit())
          return self.nextPath();
      }
    };
  }
});

// ---------------------------Extended Controllers -----------------------------

/**
 * The route controller for all public posts
 */
PublicPostsController = PostsListController.extend({

  // Sorts the list by date submitted
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = [
      Meteor.subscribe('publicPosts', this.findOptions()),
      Meteor.subscribe('userActivity'),
      Meteor.subscribe('userPrivateTags'),
    ];
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.publicPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 * The route controller for the user's own posts
 */
MyPostsController = PostsListController.extend({

  // Sorts the list by date submitted
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = [
      Meteor.subscribe('userPrivateTags'),
      Meteor.subscribe('usersOwnPosts', this.findOptions()),
      Meteor.subscribe('userActivity'),
    ];
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({userId: Meteor.userId()}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.myPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 * The route controller for the user's own posts
 */
MyPostsWithVisibilityController = PostsListController.extend({

  // Sorts the list by date submitted
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = [
      Meteor.subscribe('userPrivateTags'),
      Meteor.subscribe('usersOwnPostsWithVisibility', this.findOptions(),
        this.params.visibility),
      Meteor.subscribe('userActivity'),
    ];
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find(
      {userId: Meteor.userId()}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.myPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 * The route controller the posts that the user has prayed for
 */
MyActivityPrayedController = PostsListController.extend({

  // Sorts the list by date submitted
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = [
      Meteor.subscribe('userPrayedPosts', this.findOptions()),
      Meteor.subscribe('userActivity'),
    ];
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.myActivityPrayed.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 * The route controller that the user has commented on
 */
MyActivityCommentedController = PostsListController.extend({

  // Sorts the list by date submitted
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = [
      Meteor.subscribe('userCommentedPosts', this.findOptions()),
      Meteor.subscribe('userActivity'),
    ];
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.myActivityCommented.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 *  The route controller for the posts with a specific tag
 */
PostsContainingTagController = PostsListControllerDataNotFound.extend({

  // Sort option for this controller override
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection matching the tag
  subscriptions: function() {
    this.postsSub = [
      Meteor.subscribe('postsFromTag', this.findOptions(), this.params.name),
      Meteor.subscribe('userPrivateTags'),
      Meteor.subscribe('userActivity'),
    ];
  },

  // Returns the posts for the controller
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.postsContainingTag.path({
      name: this.params.name,
      postsLimit: this.postsLimit() + this.increment
    });
  }
});
