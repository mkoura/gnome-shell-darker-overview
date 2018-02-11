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
const DARKNESS_STEP = 0.073;
const ABSOLUTE_DARKNESS = 0.0;

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
    overviewInjections._shadeBackgrounds = Overview.Overview.prototype._shadeBackgrounds;
    settings = Convenience.getSettings();
    settings.connect('changed::darkness-factor', Lang.bind(this, this.set_darkness));
    settings.connect('changed::show-vignette', Lang.bind(this, this.set_darkness));
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
    if (!this.enabled) {
        return;
    }

    let darkness_factor = settings.get_int('darkness-factor');
    let show_vignette = settings.get_boolean('show-vignette');
    let new_brightness = DEFAULT_VIGNETTE_BRIGHTNESS;

    if (darkness_factor !== undefined) {
        new_brightness = DEFAULT_VIGNETTE_BRIGHTNESS - darkness_factor * DARKNESS_STEP;
        new_brightness = new_brightness >= ABSOLUTE_DARKNESS ? new_brightness : ABSOLUTE_DARKNESS;
        new_brightness = new_brightness <= DEFAULT_VIGNETTE_BRIGHTNESS ?
            new_brightness :
            DEFAULT_VIGNETTE_BRIGHTNESS;
    }

    let props = {
        brightness: new_brightness,
        time: SHADE_ANIMATION_TIME,
        transition: 'easeOutQuad'
    };
    if (show_vignette !== false) {
        props.vignette_sharpness = VIGNETTE_SHARPNESS;
    }

    Overview.Overview.prototype._shadeBackgrounds = function() {
        let backgrounds = this._backgroundGroup.get_children();
        for (let i = 0; i < backgrounds.length; i++) {
            Tweener.addTween(backgrounds[i], props);
        }
    };
};

function init() {
    return new Ext();
}
