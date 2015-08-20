// ---------------------------- Template helpers -------------------------------

Template.burnerAccount.helpers({

  // Get the data from the session collection
  getUsername: function() {
    if (!Session.get('burnerAccount')) {
      return '';
    } else {
      return Session.get('burnerAccount').username;
    }
  },

  // Get the data from the session collection
  getPassword: function () {
    if (!Session.get('burnerAccount')) {
      return '';
    } else {
      return Session.get('burnerAccount').password;
    }
  },
});
