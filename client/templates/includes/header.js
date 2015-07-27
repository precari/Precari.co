/*
  See: https://book.discovermeteor.com/chapter/voting
  A helper that uses the current path and one or more named routes to set an
  active class on the navigation items

  The reason why we want to support multiple named routes is that both our home
  and newPosts routes (which correspond to the / and /new URLs respectively)
  bring up the same template. Meaning that our activeRouteClass should be smart
  enough to make the <li> tag active in both cases.
*/

Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name;
    });

    return active && 'active';
  }
});
