/**
 * Configures the user account and login/register screen.
 * Thisis for package ian:accounts-ui-bootstrap-3
 */
Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL',
    forceEmailLowercase: true,
    forceUsernameLowercase: true,
    requestPermissions: {},
    extraSignupFields: [{
        fieldName: 'name',
        fieldLabel: 'Display name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write a display name for your account");
            return false;
          } else {
            return true;
          }
        }
    }, {
        fieldName: 'terms',
        fieldLabel: 'I accept the terms and conditions',
        inputType: 'checkbox',
        visible: true,
        saveToProfile: false,
        validate: function(value, errorFunction) {
            if (value) {
                return true;
            } else {
                errorFunction('You must accept the terms and conditions.');
                return false;
            }
        }
    }, {
      fieldName: 'burner',
      fieldLabel: 'Create a burner/anonymous account',
      inputType: 'checkbox',
      visible: true,
      saveToProfile: true
    }]
});
