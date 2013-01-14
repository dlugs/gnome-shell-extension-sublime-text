const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

function SublimeStatusIcon() {
    this._init.apply(this, arguments);
}

SublimeStatusIcon.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'sublime-text-2'); 
	this._parseSublimeConfig();

    },

    _addCommand: function(label, command, menu) {
    	menu.addAction(label, function() { 
            try {
                GLib.spawn_command_line_async(command);
            } catch(e) {
                Main.notify('Error, probably sublime text is not installed.');
            }
        });
    },


    _parseSublimeConfig: function() {
        let _configFile = GLib.get_user_config_dir() + "/sublime-text-2/Settings/Session.sublime_session";
	
	if (GLib.file_test(_configFile, GLib.FileTest.EXISTS)) {
            let filedata = null;

            try {
                filedata = GLib.file_get_contents(_configFile, null, 0);
                let jsondata = JSON.parse(filedata[1]);
		
                let history = jsondata.folder_history;
	                for (let i = 0; i < history.length; i++) {
				        this._addCommand(history[i],"sublime-text-2 "+history[i], this.menu);	
                	}
                if(history.length == 0) {
                    this._addCommand('Open Sublime Text 2',"sublime-text-2", this.menu);   
                }

            }
            catch (e) {
                global.logError(_("Error reading config = ") + e);
            }
        }

    },

}


function init() {}
let _icon;
function enable() {
    _icon = new SublimeStatusIcon();
    Main.panel.addToStatusArea('sublime', _icon);
}
function disable() {
    _icon.destroy();
}
