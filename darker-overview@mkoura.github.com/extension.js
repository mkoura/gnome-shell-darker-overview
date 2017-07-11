// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// jshint moz: true

const Overview = imports.ui.overview;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const SHADE_ANIMATION_TIME = 0.20;
const VIGNETTE_SHARPNESS = 0.7;
const DEFAULT_VIGNETTE_BRIGHTNESS = 0.8;
const DARKNESS_STEP = 0.07;

let settings = null;
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
};

Ext.prototype.enable = function() {
    this.enabled = true;
    resetState();
    overviewInjections['_shadeBackgrounds'] = Overview.Overview.prototype._shadeBackgrounds;
    settings = Convenience.getSettings();
    settings.connect('changed::darkness-factor', Lang.bind(this, this.set_darkness));
    this.set_darkness();
};

Ext.prototype.disable = function() {
    this.enabled = false;
    settings.run_dispose();

    var i;
    for (i in overviewInjections)
        removeInjection(Overview.Overview.prototype, overviewInjections, i);

    resetState();
};

Ext.prototype.set_darkness = function() {
    if(!this.enabled) {
        return;
    }
    let new_darkness = settings.get_int('darkness-factor');
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
