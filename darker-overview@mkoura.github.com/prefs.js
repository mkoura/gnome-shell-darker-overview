// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// jshint moz: true

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const GettextDomain = 'DarkerOverview';
const Gettext = imports.gettext.domain(GettextDomain);
const _ = Gettext.gettext;
const N_ = function(e) { return e; };

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

function init() {
    Convenience.initTranslations(GettextDomain);
}

const DarkerOverviewSettings = new GObject.Class({
    Name: 'DarkerOverviewPrefs',
    Extends: Gtk.Grid,

    _init: function(params) {
        this.parent(params);
        this.margin = 24;
        this.spacing = 30;
        this.row_spacing = 10;
        this._settings = Convenience.getSettings();

        let label = null;
        let widget = null;
        let value = null;
        let radio = null;
        let key = null;

        // Darkness Factor
        key = 'darkness-factor';
        label = new Gtk.Label({
            label: _('Overview darkness\n<small>(0 = normal, 10 = darkest)</small>'),
            use_markup: true,
            hexpand: true,
            halign: Gtk.Align.START
        });
        widget = new Gtk.SpinButton({halign: Gtk.Align.END});
        widget.set_sensitive(true);
        widget.set_range(0, 10);
        widget.set_value(this._settings.get_int(key));
        widget.set_increments(1, 2);
        widget.connect('value-changed', Lang.bind(this, function(w){
            value = w.get_value_as_int();
            if (value != this._settings.get_int(key)) {
                this._settings.set_int(key, value);
            }
        }));
        this.attach(label, 0, 1, 1, 1);
        this.attach(widget, 1, 1, 1, 1);
    },
});

function buildPrefsWidget() {
    let widget = new DarkerOverviewSettings();
    widget.show_all();

    return widget;
}
