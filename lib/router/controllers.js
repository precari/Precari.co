
// -------------------------------- Controllers --------------------------------

/**
 * A route controller is simply a way to group routing features together in a
 * nifty reusable package that any route can inherit from.
 * see https://book.discovermeteor.com/chapter/pagination
*/

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

  // Sets the subscription to the posts collection matching the options
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

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

  // Sets the subscription to the posts collection matching the options
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // Get the path for load more
  nextPath: function() {
    return Router.routes.topPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 *  The route controller for the least posts (least liked, prayed for)
 */
LeastPostsController = PostsListController.extend({

  // Sorts the list by the least prayed for
  sort: { prayedCount: 1, submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection matching the options
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({}, this.findOptions());
  },

  // Get the path for load more
  nextPath: function() {
    return Router.routes.topPosts.path({
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
    this.postsSub = Meteor.subscribe('usersOwnPosts', this.findOptions());
  },

  // Returns the posts for the template
  posts: function() {
    return Posts.find({userId: Meteor.userId()}, this.findOptions());
  },

  nextPath: function() {
    return Router.routes.myPosts.path({
      postsLimit: this.postsLimit() + this.increment
    });
  }
});

/**
 *  The route controller for the posts with a specific tag
 */
PostsContainingTagController = PostsListController.extend({

  // Sort option for this controller override
  sort: { submitted: -1, _id: -1 },

  // Sets the subscription to the posts collection matching the tag
  subscriptions: function() {

      // Get subscription of either public posts or those belonging to the
      // private tag

      var subscription = 'publicPostsFromTag';

      // If getting posts from a private tag, get all posts
      if (Meteor.precariMethods.tags.isPrivateTag(this.params.name)) {
        subscription = 'allPostsFromTag';
      }

      // subscribe to the dataset
      this.postsSub = Meteor.subscribe
        (subscription, this.findOptions(), this.params.name);
  },

  // Returns the posts for the controller
  posts: function() {

    // Return the full dataset since the subscription is already limited
    // Further filtering here exposes the non-filtered data in the Post object.
    return Posts.find();
  },

  // Get the path for pagination button
  nextPath: function() {
    return Router.routes.postsContainingTag.path({
      name: this.params.name,
      postsLimit: this.postsLimit() + this.increment
    });
  }
});
