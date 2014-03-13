YUI.add('moodle-core-handlebars', function (Y, NAME) {

// Handlebars only exists in the global namespace and we do not want to
// Clone the entire thing.

// It should be reasonably safe within Moodle to add some core
// functionality to Handlebars at this level.
Y.Handlebars.registerHelper('get_string', M.util.get_string);

Y.Handlebars.registerHelper('image_url', M.util.image_url);


}, '@VERSION@');
