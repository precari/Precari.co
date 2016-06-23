
// -------------------------- Template onCreated -------------------------------

Template.manageTags.onCreated(function() {

  // Initialize the session collection to store errors on submit
  Session.set('tagErrors', {});
});

// ------------------------------- on rendered ---------------------------------

Template.manageTags.onRendered(function() {

  // Create a custom event handler for tagRenamed to control order of events
  // Attach to each editable tag element in the table
  $.each($('td.edit-tag-label'), function( index, value ) {
    $(value).on('tagRenamed',function(e, data){ });
  });

  // MindMup editableTableWidget: https://mindmup.github.io/editable-table/
  $('.table').editableTableWidget();
  $('.table').editableTableWidget({editor: $('<textarea>')});
  $('.table').editableTableWidget({
  	cloneProperties: ['background', 'border', 'outline']
  });

  $('table td').on('validate', function(evt, newValue) {

    // If validation fails, then the original value remains in the textbox
    // upon submit
    if(newValue === '') {
      return false;
    } else if (newValue.length > parseInt(Meteor.settings.public.maxTagLength)) {
      return false;
    }

    // Dev note: Had to hardcode the maxTagLength value in the text box.
    // Input box is created in: client\lib\mindmup-editabletable.js

  });

  $('table td').on('change', function(e, newValue) {
    // Fire the custom tagRenamed event
    $(e.currentTarget).trigger('tagRenamed',{ newValue: newValue });

    // TODO: Fix double event issue. It occurs because we have to clear the
    // text box before updating the tag in the collection. Perhaps can watch for
    // the same tag on the same obj and then don't fire the event the 2nd time.

  });
});

// ---------------------------- Template helpers -------------------------------

Template.manageTags.helpers({

  /**
   * Gets the list of the current user's own tags
   *
   * @return Collection The collection of private tags
   */
  userTags: function() {
    return PrivateTags.find({}).fetch();
  },
});

// ---------------------------- Template events -------------------------------

Template.manageTags.events({

  /**
   * Delete tag event received. Process tag delete
   *
   * @param jQuery.Event e Event object containing the event data
   */
  'click td .no-edit, .delete': function(e) {

    // Ask the user to confirm
    if (confirm("Delete tag '" + this.label + "'?")) {

      Meteor.call('privateTagRemove', this, function(error, result) {
        if (error){
          throwError(error.reason);
        }
      });
    }
  },

  /**
   * Tag was renamed. Makes changes in the collections
   *
   * Created a custom event for this to avoid the event firing twice, but it
   * still does. The issue is that the returned valued from Collection.update
   * appends to the textfield, and doesn't replace it.
   *
   * @param jQuery.Event e Event object containing the event data
   */
  'tagRenamed td.edit-tag-label': function(e) {

    var originalLabel = this.label;

    // Set the new data in the tag
    var tagData = this;
    tagData.label = e.currentTarget.innerText;

    // Validate the data and return any errors
    var errors = validateTag(tagData);
    if (errors.label) {
      Session.set('tagErrors', errors);
      throwError(errors.label);
      return;
    }

    // Update the tag in the collection
    Meteor.call('privateTagRename', tagData, originalLabel , function(error, result) {
      if (error){
        Session.set('tagErrors', { serverError: error.reason });
        throwError(error.reason);
      }
    });

    // Clear the current value in the element since the collection will set the
    // updated name. Instead of replacing the text in the element, it appends it
    e.currentTarget.textContent = '';
  },
});
