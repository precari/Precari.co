
/**
 * Secure admin config for Meteor Admin (yogiben:admin)
 * https://github.com/yogiben/meteor-admin
 * Client AdminConfig data is located in: /client/lib/admin.js
 * ** Add new collections to both the client and server configs **
 */
AdminConfig = {
  adminEmails: Meteor.settings.yogiben_admin.adminEmails,
  collections: {
    Posts: {},
    Comments: {},
    Notifications: {},
    PrivateTags: {},
    PublicTags: {}
  }
};
