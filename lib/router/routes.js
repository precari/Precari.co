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

// ------------------------------- Post Routes ---------------------------------

/**
 * The landing page
 */
Router.route('/', {
  name: 'home',
  controller: LatestPostsController
});

/**
 * The most recently submitted posts
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
 * The least voted posts
 */
Router.route('/least/:postsLimit?', {
  name: 'leastPosts'
});

/**
 *  The posts belonging to the logged in user
 */
Router.route('/myposts/:postsLimit?', {
  name: 'myPosts'
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
    return Meteor.subscribe('usersPostsForTagList');
  },
// Send the current post to the template to edit.
  data: function() { return Posts.findOne(this.params._id); }
});

/**
 * The route to a submit a post
 */
Router.route('/submit', {
  name: 'postSubmit',
});

// ------------------------------- Tag Routes ----------------------------------

/**
 * The tags page
 */
Router.route('/tags', {
  name: 'tagsPage',

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

// ------------------------------- User Routes ---------------------------------

/**
 * The profile edit page
 */
Router.route('/profile/edit', {
  name: 'profileEdit'
});

/**
 * The burner page explains the details about the burner accounts
 */
 Router.route('/burner', {
  name: 'burnerAccount'
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
Router.onBeforeAction('dataNotFound', {only: 'tagsPage'});
Router.onBeforeAction('dataNotFound', {only: 'postsContainingTag'});
Router.onBeforeAction('dataNotFound', {only: 'myPosts'});

// Verify the user is logged in prior to loading these pages:
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
Router.onBeforeAction(requireLogin, {only: 'profileEdit'});
Router.onBeforeAction(requireLogin, {only: 'myPosts'});
