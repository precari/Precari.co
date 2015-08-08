/**
 * The routes here are using iron:router
 * Routes defines the paths in the URL
*/

Router.configure({
  layoutTemplate: 'layout',     // client/templates/appliation/layout.html
  loadingTemplate: 'loading',   // client/templates/includes/loading.html
  notFoundTemplate: 'notFound', // client/templates/appliation/not_found.html
  waitOn: function() {
    return [Meteor.subscribe('notifications')];
  }
});

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

  // Get the options object
  findOptions: function() {
    return {sort: this.sort, limit: this.postsLimit()};
  },

  // Sets the subscription to the posts collection with the options being set
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },

  // Returns the posts subscription
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

      // Get the next data set from the pagination button
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
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.latestPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

/**
 *  The route controller for the top posts (most liked, prayed for)
 */
TopPostsController = PostsListController.extend({

  // Sorts the list by the most prayed for
  sort: {prayedCount: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.topPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

/**
 *  The route controller for the posts with a specific tag
 */
PostsWithTagController = PostsListController.extend({

  // Sets the subscription to the posts collection matching the tag
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('postsFromTag', this.params._tag);
  },

  // The data context for the template. This is what gets passed to the
  // specified template
  data: function() {
    var self = this;
    return {
      posts: self.posts(),
      ready: self.postsSub.ready,

      // Get the next data set from the pagination button
      nextPath: function() {
        if (self.posts().count() === self.postsLimit())
          return self.nextPath();
      }
    };
  }
});

/**
 * The landing page route
 */
Router.route('/', {
  name: 'home',
  controller: LatestPostsController
});

/**
 * The latest posts route
 */
Router.route('/latest/:postsLimit?', {
  name: 'latestPosts'
});

/**
 * The top posts route
 */
Router.route('/top/:postsLimit?', {
  name: 'topPosts'
});

/**
 * The route to a specific post
 */
Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() {
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() { return Posts.findOne(this.params._id); }
});

/**
 * The route to edit a specific post
 */
Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function() {
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

/**
 * The route to a submit a post
 */
Router.route('/submit', {
  name: 'postSubmit'
});

/**
 * The route to the tags page
 */
Router.route('/tags', {
  name: 'tagsList',
  waitOn: function() {
    return Meteor.subscribe('tags');
  },
  data: function() { return Tags.find(); }
});

/**
 * The route to the page containing the posts from a selected tag
 */
Router.route('/tags/:_tag', {
    name: 'postsWithTag',
    controller: PostsWithTagController
});

// Verfies the user is logged in. If not, dispalays the accessDenied page
var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
};

// If post page return no data, use Iron Router's dataNotFound hook
Router.onBeforeAction('dataNotFound', {only: 'postPage'});

// Before submitting a post, verify the user is logged in
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
