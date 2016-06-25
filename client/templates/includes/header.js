
// ---------------------------- Template helpers -------------------------------

Template.header.helpers({

  /**
   * Determines which header/menu item should be marked as active since the
   * same page is used to display various types of posts:
   * (myPosts, topPosts, publicPosts, postsFromTags, etc)
   *
   * @return String The text 'active' for the class name
   */
  activeRouteClass: function(/* route names */) {

    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function(name) {

      if (Router.current() && Router.current().route) {
        return Router.current().route.getName() === name;
      }
    });

    return active && 'active';
  },

  /**
   * Determines is the page has posts (and is sortable)
   *
   * @return Boolean True if the page is sortable (has posts), otherwise false
   */
  isSortable: function() {
    if(Posts.findOne({})) {
      // myActivity is an exception. There are posts in memory, but not
      // displayed on the page. They display the post count infomation
      if (Router.current().route.getName() == 'myActivity') {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  },
});

// --------------------------- Template event methods --------------------------

Template.header.events({

  /**
   * On click, set the active marker in the menu item on the element that
   * was clicked
   */
  'click li.sortable': function(e) {

    // clear the active marker from all items in the list
    $('li.sortable').removeClass('active');
    $(e.currentTarget).addClass('active');
  }

});
