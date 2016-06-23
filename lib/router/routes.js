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

// --------------------------- Post Routes --------------------------------

/**
 * The landing page
 */
Router.route('/', {
  name: 'home',
  controller: PublicPostsController
});

/**
 * The public posts (default)
 */
Router.route('/public/:postsLimit?', {
  name: 'publicPosts',
  controller: PublicPostsController,
});

/**
 *  The posts belonging to the logged in user
 */
Router.route('/myposts/:postsLimit?', {
  name: 'myPosts',
  controller: MyPostsController,
});

/**
 *  The posts belonging to the logged in user
 */
Router.route('/myposts/v/:visibility/:postsLimit?', {
  name: 'myPostsWithVisibility',
  controller: MyPostsWithVisibilityController,
});

/**
 *  The posts belonging to the logged in user
 */
Router.route('/myactivity', {

  name: 'myActivity',
  waitOn: function() {
    return [
      Meteor.subscribe('userActivity'),
    ];
  },
});

/**
 *  The posts belonging to the logged in user
 */
Router.route('/myactivity/prayed/:postsLimit?', {
  name: 'myActivityPrayed',
  controller: MyActivityPrayedController,
});

/**
 *  The posts belonging to the logged in user
 */
Router.route('/myactivity/commented/:postsLimit?', {
  name: 'myActivityCommented',
  controller: MyActivityCommentedController,
});

/**
 * The route to a specific post
 */
Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() {
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('comments', this.params._id),
      Meteor.subscribe('userPrivateTags'),
      Meteor.subscribe('userActivity'),
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
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('userPrivateTags')
    ];
  },
  // Send the current post to the template to edit.
  data: function() { return Posts.findOne(this.params._id); }
});

/**
 * The route to a submit a post
 */
Router.route('/submit', {
  name: 'postSubmit',

    waitOn: function() {
      return Meteor.subscribe('userPrivateTags');
    }
  });

// --------------------------- Tag Routes ---------------------------------

/**
 * The tags page
 */
Router.route('/tags', {
  name: 'tagsPage',

  waitOn: function() {
    return [
      Meteor.subscribe('publicTags'),
      Meteor.subscribe('userPrivateTags')
    ];
  },
  data: function() { return PublicTags.find(); }
});

/**
 * The manage tags page
 */
Router.route('/tags/manage', {
  name: 'manageTags',

  waitOn: function() {
    return [
      Meteor.subscribe('userPrivateTags'),
    ];
  },
  data: function() { return PrivateTags.find(); }
});

/**
 * The route to the page containing the posts from a selected tag
 */
Router.route('/tags/:name/:postsLimit?', {
    name: 'postsContainingTag',
    controller: PostsContainingTagController,
});

// --------------------------- User Routes --------------------------------

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

// --------------------------- Help page Routes ---------------------------

/**
 * Help page for creating posts
 */
Router.route('/help/creating-requests', {
  name: 'helpCreatingsPosts'
});

/**
 * Help page for using tags
 */
Router.route('/help/using-tags', {
  name: 'helpUsingTags'
});

/**
 * Help page for understanding permissions
 */
Router.route('/help/visibility-settings', {
  name: 'helpVisilbilitySettings'
});

// -------------------------- Router actions -----------------------------

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

// If a page return no data, use Iron Router's dataNotFound hook
Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction('dataNotFound', {only: 'postEdit'});
Router.onBeforeAction('dataNotFound', {only: 'postsContainingTag'});

// Verify the user is logged in prior to loading these pages:
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
Router.onBeforeAction(requireLogin, {only: 'profileEdit'});
Router.onBeforeAction(requireLogin, {only: 'myPosts'});
Router.onBeforeAction(requireLogin, {only: 'myActivity'});
Router.onBeforeAction(requireLogin, {only: 'postEdit'});
