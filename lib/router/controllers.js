
// -------------------------------- Controllers --------------------------------

/**
 * A route controller is simply a way to group routing features together in a
 * nifty reusable package that any route can inherit from.
 * see https://book.discovermeteor.com/chapter/pagination
*/

/**
 * The route controller for 'postsList'
 */
PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,

  // Limit the data set to only return a set portion
  postsLimit: function() {
    return parseInt(this.params.postsLimit) || this.increment;
  },

  // Get the options object for .find()
  findOptions: function() {
    return { sort: this.sort, limit: this.postsLimit() };
  },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // The data context for the template. This is what gets passed to the
  // specified template
  data: function() {
    var self = this;
    return {
      posts: self.posts(),
      ready: self.postsSub.ready,

      // Get the path for pagination button
      nextPath: function() {
        if (self.posts().count() === self.postsLimit())
          return self.nextPath();
      }
    };
  }
});

/**
 * The route controller for the latest posts
 */
LatestPostsController = PostsListController.extend({

  // Sorts the list by date submitted
  sort: { submitted: -1, _id: -1 },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.latestPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 *  The route controller for the top posts (most liked, prayed for)
 */
TopPostsController = PostsListController.extend({

  // Sorts the list by the most prayed for
  sort: { prayedCount: -1, submitted: -1, _id: -1 },

  // Get the path for load more
  nextPath: function() {
    return Router.routes.topPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 *  The route controller for the posts with a specific tag
 */
PostsContainingTagController = PostsListController.extend({

  // Get the options object for .find()
  findOptions: function() {
    return { sort: this.sort, limit: this.postsLimit() };
  },

  // Sort option for this controller override
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection matching the tag
  subscriptions: function() {
    postsSub = Meteor.subscribe('postsContainingTag', this.findOptions(), this.params.name);
  },

  // Returns the posts for the controller
  posts: function() {
    return Posts.find({tags: this.params.name}, this.findOptions());
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.postsContainingTag.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});
