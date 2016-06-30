
/**
  * handlebars.js contains common helper functions for the templates. These are
  * are accessed from within the templates using the {{func arg}} notation.
  */

 /**
  * Returns the app display name
  *
  * @return String The dispaly name of the app from the settings file
  */
 Template.registerHelper('siteName', function() {
   return Meteor.settings.public.siteName;
 });

 /**
 * Gets the maximum allowed tag length
  *
  * @return Integer The max length of a tag
  */
 Template.registerHelper('maxTagLength', function() {
   return parseInt(Meteor.settings.public.tags.maxLength);
 });

/**
 * Pluralizes an English noun by adding an s
 *
 * @param Integer n the number of items
 * @param String thing The English word to pluralize
 * @return String A string value of the pluralized thing if n is greater than 1.
 *                Otherwise, return the value of thing
 */
Template.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

/**
 * If value is true, returns 'checked' for the checkbox
 *
 * @param Boolean value The value to compare
 * @return String A string value of 'checked' if the value is true, otherwise
 *                return an empty string
 */
Template.registerHelper('checked', function(value) {
  return value ? 'checked' : '';
});

/**
 * If value is false, returns 'disabled'
 *
 * @param Boolean value The value to compare
 * @return String A string value of 'disabled' if the value is false, otherwise
 *                return an empty string
 */
Template.registerHelper('disabled', function(value) {
  return value ? '' : 'disabled';
});

/**
 * Formats the data for a standardized look
 *
 * @param Date date Date to format
 * @return String A formatted date value
 */
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('lll');
});

/**
 * Gets the enum value for the visibility setting based on the matching int
 *
 * @param String/Integer num The int value of the visibility level
 * @return String The text value of the corresponding visibility
*/
Template.registerHelper('visibilityValue', function(num) {

  var visibility;

  switch (parseInt(num)) {
    case 0:
      visibility = Meteor.precariMethods.visibility.PRIVATE;
      break;
    case 1:
      visibility = Meteor.precariMethods.visibility.LINK;
      break;
    case 2:
      visibility = Meteor.precariMethods.visibility.TAG;
      break;
    case 3:
      visibility = Meteor.precariMethods.visibility.PUBLIC;
      break;
    default:
    visibility = Meteor.precariMethods.visibility.PRIVATE;
    break;
  }
    return visibility;
});

/**
 * Gets the glyphicon matching the visibility level
 *
 * @param Enum/Integer visibility The value of Meteor.precariMethods.visibility
 *                     or integer equivilent to get the glyphicon for
 * @return String The value of the glyphicon
*/
Template.registerHelper('visibliltyGlyphicon', function(visibility) {

  var glyphicon = '';

  switch (visibility) {
    case Meteor.precariMethods.visibility.PRIVATE:
      glyphicon = 'glyphicon glyphicon-eye-close';
      break;
    case Meteor.precariMethods.visibility.LINK:
      glyphicon = 'glyphicon glyphicon-link';
      break;
    case Meteor.precariMethods.visibility.TAG:
      glyphicon = 'glyphicon glyphicon-tag';
      break;
    case Meteor.precariMethods.visibility.PUBLIC:
      glyphicon = 'glyphicon glyphicon-globe';
      break;
    case 0:
      glyphicon = 'glyphicon glyphicon-eye-close';
      break;
    case 1:
      glyphicon = 'glyphicon glyphicon-link';
      break;
    case 2:
      glyphicon = 'glyphicon glyphicon-tag';
      break;
    case 3:
      glyphicon = 'glyphicon glyphicon-globe';
      break;
    default:
    break;
  }

  return glyphicon;
});

/**
 * Gets the CSS class for the specific tag depending on its properties
 *
 * @param String property Info about the tag about which icon to get
 * @return String The value of the CSS class
*/
Template.registerHelper('tagLabelColorClass', function(property) {

  var cssClass = '';

  switch (property) {
    case 'default':
      cssClass = 'label-info';
      break;
    case 'private':
      cssClass = 'label-success';
      break;
    case 'public':
      cssClass = 'label-primary';
      break;
    default:
      cssClass = 'label-primary';
    break;
  }

  return cssClass;
});
