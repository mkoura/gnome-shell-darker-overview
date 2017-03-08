// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const SCHEMA_PATH = 'org.gnome.shell.extensions.darker-overview';

function Prefs() {
	var self = this;
	var settings = this.settings = Convenience.getSettings(SCHEMA_PATH);
	this.DARKNESS = {
		key: 'darkness-factor',
		get: function() { return settings.get_double(this.key); },
		set: function(v) { settings.set_double(this.key, v); },
		changed: function(cb) { return settings.connect('changed::' + this.key, cb); },
		disconnect: function() { return settings.disconnect.apply(settings, arguments); },
	};
};
