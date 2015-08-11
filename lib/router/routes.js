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

// ---------------------------------- Routes -----------------------------------

/**
 * The landing page
 */
Router.route('/', {
  name: 'home',
  controller: LatestPostsController
});

/**
 * The latest posts
 */
Router.route('/latest/:postsLimit?', {
  name: 'latestPosts'
});

/**
 * The top posts
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

  // Tags is needed when submitting a new post also adds to this collection
  waitOn: function() {
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('tags')
    ];
  },
  data: function() { return Posts.findOne(this.params._id); }
});

/**
 * The route to a submit a post
 */
Router.route('/submit', {
  name: 'postSubmit',

  // Tags is needed when submitting a new post also adds to this collection
  waitOn: function() {
    return Meteor.subscribe('tags');
  },
});

/**
 * The tags page
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
Router.route('/tags/:name/:postsLimit?', {
    name: 'postsContainingTag',
    controller: PostsContainingTagController,
});

// ------------------------------ Router actions -------------------------------


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
