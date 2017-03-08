// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const Overview = imports.ui.overview;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

const SHADE_ANIMATION_TIME = 0.20;
const VIGNETTE_SHARPNESS = 0.7;
const DEFAULT_VIGNETTE_BRIGHTNESS = 0.8;
const DARKNESS_STEP = 0.07;


let overviewInjections;

function resetState() {
    overviewInjections = { };
}

function removeInjection(object, injection, name) {
    object[name] = injection[name];
}

var noop = function() {};

function Ext() {
	this._init.apply(this, arguments);
}

Ext.prototype = {};
Ext.prototype._init = function() {
	this.enabled = false;
	this.unbind = noop;
};

Ext.prototype.enable = function() {
	this.enabled = true;
    resetState();
    overviewInjections['_shadeBackgrounds'] = Overview.Overview.prototype._shadeBackgrounds;
	var pref = (new Settings.Prefs()).DARKNESS;

	var binding = pref.changed(Lang.bind(this, function() {
		this.set_darkness(pref.get());
	}));
	this.unbind = function() {
		pref.disconnect(binding);
		this.unbind = noop;
	};
	this.set_darkness(pref.get());
};

Ext.prototype.disable = function() {
	this.enabled = false;
	this.unbind();

    var i;

    for (i in overviewInjections)
        removeInjection(Overview.Overview.prototype, overviewInjections, i);

    resetState();
};

Ext.prototype.set_darkness = function(new_darkness) {
	if(!this.enabled) {
		return;
	}
    if (new_darkness === undefined) {
	    new_darkness = DEFAULT_VIGNETTE_BRIGHTNESS;
    } else {
	    new_darkness = DEFAULT_VIGNETTE_BRIGHTNESS - new_darkness * DARKNESS_STEP;
        new_darkness = new_darkness >= 0.1 ? new_darkness : 0.1;
        new_darkness = new_darkness <= DEFAULT_VIGNETTE_BRIGHTNESS ?
            new_darkness :
            DEFAULT_VIGNETTE_BRIGHTNESS;
    }

    Overview.Overview.prototype._shadeBackgrounds = function() {
        let backgrounds = this._backgroundGroup.get_children();
        for (let i = 0; i < backgrounds.length; i++) {
            Tweener.addTween(backgrounds[i],
                             { brightness: new_darkness,
                               vignette_sharpness: VIGNETTE_SHARPNESS,
                               time: SHADE_ANIMATION_TIME,
                               transition: 'easeOutQuad'
                             });
        }
    };
};

function init() {
	return new Ext();
}
