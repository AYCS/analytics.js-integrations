
var alias = require('alias');
var callback = require('callback');
var clone = require('clone');
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Trakio);
};


/**
 * Expose `Trakio` integration.
 */

var Trakio = exports.Integration = integration('trak.io')
  .assumesPageview()
  .readyOnInitialize()
  .global('trak')
  .option('token', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);


/**
 * Options aliases.
 */

var optionsAliases = {
  initialPageview: 'auto_track_page_view'
};


/**
 * Initialize.
 *
 * https://docs.trak.io
 *
 * @param {Object} page
 */

Trakio.prototype.initialize = function (page) {
  var self = this;
  var options = this.options;
  window.trak = window.trak || [];
  window.trak.io = window.trak.io || {};
  window.trak.io.load = function(e) {self.load(); var r = function(e) {return function() {window.trak.push([e].concat(Array.prototype.slice.call(arguments,0))); }; } ,i=["initialize","identify","track","alias","channel","source","host","protocol","page_view"]; for (var s=0;s<i.length;s++) window.trak.io[i[s]]=r(i[s]); window.trak.io.initialize.apply(window.trak.io,arguments); };
  window.trak.io.load(options.token, alias(options, optionsAliases));
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Trakio.prototype.loaded = function () {
  return !! (window.trak && window.trak.loaded);
};


/**
 * Load the trak.io library.
 *
 * @param {Function} callback
 */

Trakio.prototype.load = function (callback) {
  load('//d29p64779x43zo.cloudfront.net/v1/trak.io.min.js', callback);
};


/**
 * Page.
 *
 * @param {Page} page
 */

Trakio.prototype.page = function (page) {
  var category = page.category();
  var props = page.properties();
  var name = page.fullName();
  var event;
  var track;

  window.trak.io.page_view(props.path, name || props.title);

  // named pages
  if (name && this.options.trackNamedPages) {
    event = page.event(name);
    track = page.track(event);
    this.track(track);
  }

  // categorized pages
  if (category && this.options.trackCategorizedPages) {
    event = page.event(category);
    track = page.track(event);
    this.track(track);
  }
};


/**
 * Trait aliases.
 *
 * http://docs.trak.io/properties.html#special
 */

var traitAliases = {
  avatar: 'avatar_url',
  firstName: 'first_name',
  lastName: 'last_name'
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Trakio.prototype.identify = function (identify) {
  var traits = identify.traits();
  var avatar = identify.avatar();
  var first = identify.firstName();
  var last = identify.lastName();
  var id = identify.userId();

  if (avatar) traits.avatar_url = avatar;
  if (first) traits.first_name = first;
  if (last) traits.last_name = last;

  traits = alias(traits, traitAliases);

  if (id) {
    window.trak.io.identify(id, traits);
  } else {
    window.trak.io.identify(traits);
  }
};


/**
 * Group.
 *
 * @param {String} id (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 *
 * TODO: add group
 * TODO: add `trait.company/organization` from trak.io docs http://docs.trak.io/properties.html#special
 */


/**
 * Track.
 *
 * @param {Track} track
 */

Trakio.prototype.track = function (track) {
  var props = track.properties();
  var event = track.event();
  window.trak.io.track(event, props);
};


/**
 * Alias.
 *
 * @param {String} to
 * @param {String} from (optional)
 */

Trakio.prototype.alias = function (to, from) {
  if (!window.trak.io.distinct_id) return;
  if (to === window.trak.io.distinct_id()) return;
  if (from) {
    window.trak.io.alias(from, to);
  } else {
    window.trak.io.alias(to);
  }
};
