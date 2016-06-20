
// If staging the server, configure Houston admin panel
if (Meteor.precariFixtureMethods.stageCurrentInstance()) {
  try {

    // Set users collection in the Houston admin panel
    Houston.add_collection(Meteor.users);
    Houston.add_collection(Houston._admins);

  } catch (e) {
      console.log(e);
  }
}
