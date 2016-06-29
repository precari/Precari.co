
// Posts collection for dynamic sorting
var posts = new ReactiveVar();
// Dynamic sort object for the current collection (default sort is most recent)
var sort = new ReactiveVar({ submitted: -1, _id: -1 });

// --------------------------- Template helpers --------------------------------

Template.postsList.helpers({

  /**
   * Returns true if the current route is myPosts
   */
  isMyPostsPage: function() {

    var route = '';

    if (Router.current() && Router.current().route) {
      route = Router.current().route.getName();
    }
    return (route === 'myPosts');
  },

  /**
   * Returns the posts collection to the template. The router does return this
   * this, but we need to explicitly specify it here for the dynamic sort
   */
  posts: function() {
    return posts.get();
  },

  /**
   * Gets the number of user's posts
   */
  userPostsCount: function() {
    return Posts.find().count();
  },
});

// -------------------------- Template onRendered ------------------------------

Template.postsList.onRendered(function () {

  var template = this;

  /**
   * On dynamic sort request, autorun is triggered and updates the client-side
   * collection to reflect the change.
   */
  template.autorun(function() {
    posts.set(Posts.find({}, { sort: sort.get()}));
  });

  // Handle animations related to post actions
  this.find('.wrapper')._uihooks = {
    insertElement: function (node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },

    /**
     * Animations to show the change of items instead of having them just
     * appear
     */
    moveElement: function (node, next) {
      var $node = $(node), $next = $(next);
      var oldTop = $node.offset().top;
      var height = $(node).outerHeight(true);

      // find all the elements between next and node
      var $inBetween = $(next).nextUntil(node);
      if ($inBetween.length === 0)
        $inBetween = $(node).nextUntil(next);

      // now put node in place
      $(node).insertBefore(next);

      // measure new top
      var newTop = $(node).offset().top;

      // move node *back* to where it was before
      $(node)
        .removeClass('animate')
        .css('top', oldTop - newTop);

      // push every other element down (or up) to put them back
      $inBetween
        .removeClass('animate')
        .css('top', oldTop < newTop ? height : -1 * height);

      // force a redraw
      $(node).offset();

      // reset everything to 0, animated
      $(node).addClass('animate').css('top', 0);
      $inBetween.addClass('animate').css('top', 0);
    },

    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
});

// ----------------------------- Template events -------------------------------

Template.header.events({

  /**
   * Click event for sort options. These elements reside in header.html
   */
  'click .sortable': function(e) {
    e.preventDefault();

    // Set the dynamic sort option for the current list
    // Calling sort.set() triggers template.autorun

    switch (e.currentTarget.id) {
      case 'most-recent-posts':
        sort.set({ submitted: -1, _id: -1 });
        break;
      case 'top-posts':
        sort.set({ prayedCount: -1, submitted: -1, _id: -1 });
        break;
      case 'least-posts':
        sort.set({ prayedCount: 1, submitted: -1, _id: -1 });
        break;
      default:
        sort.set({});
    }
  }
});
