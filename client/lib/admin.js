
/**
 * Clientside Admin config for Meteor Admin (yogiben:admin)
 * https://github.com/yogiben/meteor-admin
 * Sensitive/server AdminConfig data is located in: /server/lib/admin.js
 * ** Add new collections to both the client and server configs **
 */
AdminConfig = {
  name: Meteor.settings.public.siteName + ' Admin',
  collections: {
    Posts: {},
    Comments: {},
    Notifications: {},
    PrivateTags: {},
    PublicTags: {}
  }
};
