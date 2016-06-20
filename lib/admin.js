
/**
 * Admin config file for Meteor Admin (yogiben:admin)
 * https://github.com/yogiben/meteor-admin
 */
AdminConfig = {
  name: Meteor.settings.public.yogiben_admin.appName,
  adminEmails: Meteor.settings.public.yogiben_admin.adminEmails,
  collections: {
    Posts: {},
    Comments: {},
    Notifications: {},
    PrivateTags: {},
    PublicTags: {}
  }
};
