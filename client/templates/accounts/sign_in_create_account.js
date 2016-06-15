// ------------------ _loginButtonsLoggedInDropdown events ---------------------

Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        Router.go('profileEdit');
    },
});

// --------------- _loginButtonsLoggedOutAllServices events --------------------

// TODO: On account create, clear the session data: Session.set('burnerAccount', {});

Template._loginButtonsLoggedOutAllServices.events({
  'click #login-burner': function(event) {
    event.stopPropagation();

    // Get the random user data for the burner account
    Meteor.call('randomUserData', function(error, result) {

      // Oops....something went wrong. Display the error.
      if (error) {
        return throwError('Oops...something went wrong: ' + error.reason);
      }

      // If the user checked the box, set the generated data
      if($('#login-burner').is(':checked')) {

        // Initialize the session collection to temporarily store the use data
        Session.set('burnerAccount', {
          username: result.username,
          email: result.email,
          name: result.name,
          firstName: result.firstName,
          lastName: result.lastName,
          password: result.password
        });

        // Populate the form controls with the generated data
        $('#login-username').val(result.username);
        $('#login-email').val(result.email);
        $('#login-name').val(result.firstName);
        $('#login-password').val(result.password);

        // Prevent initial editing of the account data
        $('#login-username').attr('disabled', 'disable');
        $('#login-email').attr('disabled', 'disable');
        $('#login-name').attr('disabled', 'disable');
        $('#login-password').attr('disabled', 'disable');

        // Redirect to the burner account information page
        Router.go('burnerAccount');
      } else {

        // Box was unchecked. Clear the temp user data
        Session.set('burnerAccount', {});

        // Enable the controls and clear the data
        $('#login-username').removeAttr('disabled');
        $('#login-email').removeAttr('disabled');
        $('#login-name').removeAttr('disabled');
        $('#login-password').removeAttr('disabled');

        $('#login-username').val('');
        $('#login-email').val('');
        $('#login-name').val('');
        $('#login-password').val('');
      }
    });
  }
});
