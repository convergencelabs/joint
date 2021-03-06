
joint.mvc.View = Backbone.View.extend({

    options: {},
    theme: null,
    themeClassNamePrefix: joint.util.addClassNamePrefix('theme-'),
    requireSetThemeOverride: false,
    defaultTheme: joint.config.defaultTheme,

    constructor: function(options) {

        Backbone.View.call(this, options);
    },

    initialize: function(options) {

        this.requireSetThemeOverride = options && !!options.theme;

        this.options = joint.util.assign({}, this.options, options);

        joint.util.bindAll(this, 'setTheme', 'onSetTheme', 'remove', 'onRemove');

        joint.mvc.views[this.cid] = this;

        this.setTheme(this.options.theme || this.defaultTheme);
        this._ensureElClassName();
        this.init();
    },

    // Override the Backbone `_ensureElement()` method in order to create an
    // svg element (e.g., `<g>`) node that wraps all the nodes of the Cell view.
    _ensureElement: function() {
        var el;

        if (this.svgElement) {

            if (!this.el) {

                var tagName = joint.util.result(this, 'tagName');
                var attrs = joint.util.assign({}, joint.util.result(this, 'attributes'));
                if (this.id) attrs.id = joint.util.result(this, 'id');
                if (this.className) attrs['class'] = joint.util.result(this, 'className');
                el = V(tagName, attrs).node;

            } else {

                el = joint.util.result(this, 'el');
            }

            this.setElement(el, false);

        } else {

            Backbone.View.prototype._ensureElement.call(this);

        }

    },

    // Utilize an alternative DOM manipulation API by
    // adding an element reference wrapped in Vectorizer.
    _setElement: function(el) {

        if (this.svgElement) {

            this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
            this.el = this.$el[0];
            this.vel = V(this.el);

        } else {

            Backbone.View.prototype._setElement.call(this, el);

        }

    },

    _ensureElClassName: function() {

        var className = joint.util.result(this, 'className');
        var prefixedClassName = joint.util.addClassNamePrefix(className);

        this.$el.removeClass(className);
        this.$el.addClass(prefixedClassName);
    },

    init: function() {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    onRender: function() {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    setTheme: function(theme, opt) {

        opt = opt || {};

        // Theme is already set, override is required, and override has not been set.
        // Don't set the theme.
        if (this.theme && this.requireSetThemeOverride && !opt.override) {
            return this;
        }

        this.removeThemeClassName();
        this.addThemeClassName(theme);
        this.onSetTheme(this.theme/* oldTheme */, theme/* newTheme */);
        this.theme = theme;

        return this;
    },

    addThemeClassName: function(theme) {

        theme = theme || this.theme;

        var className = this.themeClassNamePrefix + theme;

        this.$el.addClass(className);

        return this;
    },

    removeThemeClassName: function(theme) {

        theme = theme || this.theme;

        var className = this.themeClassNamePrefix + theme;

        this.$el.removeClass(className);

        return this;
    },

    onSetTheme: function(oldTheme, newTheme) {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    remove: function() {

        this.onRemove();

        joint.mvc.views[this.cid] = null;

        Backbone.View.prototype.remove.apply(this, arguments);

        return this;
    },

    onRemove: function() {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    getEventNamespace: function() {
        // Returns a per-session unique namespace
        return '.joint-event-ns-' + this.cid;
    }

}, {

    extend: function() {

        var args = Array.from(arguments);

        // Deep clone the prototype and static properties objects.
        // This prevents unexpected behavior where some properties are overwritten outside of this function.
        var protoProps = args[0] && joint.util.assign({}, args[0]) || {};
        var staticProps = args[1] && joint.util.assign({}, args[1]) || {};

        // Need the real render method so that we can wrap it and call it later.
        var renderFn = protoProps.render || (this.prototype && this.prototype.render) || null;

        /*
            Wrap the real render method so that:
                .. `onRender` is always called.
                .. `this` is always returned.
        */
        protoProps.render = function() {

            if (renderFn) {
                // Call the original render method.
                renderFn.apply(this, arguments);
            }

            // Should always call onRender() method.
            this.onRender();

            // Should always return itself.
            return this;
        };

        return Backbone.View.extend.call(this, protoProps, staticProps);
    }
});

