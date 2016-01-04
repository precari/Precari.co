
/*
 * handlebars.js contains common helper functions for the templates. These are
 * are accessed from within the templates using the {{func arg}} notation.
 */

/**
 * Pluralizes an English noun by adding an s
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
 * @param Boolean value The value to compare
 * @return String A string value of 'checked' if the value is true, otherwise
 *                return an empty string
 */
Template.registerHelper('checked', function(value) {
    return value ? 'checked' : '';
});
