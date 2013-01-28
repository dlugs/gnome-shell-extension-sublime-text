const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

function SublimeStatusIcon() {
    this._init.apply(this, arguments);
}

SublimeStatusIcon.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'sublime-text-2'); 

        this._buildMenu();

    },

    _buildMenu: function() {
        this._addCommand('Open Sublime Text 2',"sublime-text", this.menu); 
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
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
                if(history.length > 0) {
                    this.menu.addMenuItem(new PopupMenu.PopupMenuItem("Folders", { reactive: false, style_class: 'popup-subtitle-menu-item' }));
	                for (let i = 0; i < history.length; i++) {
				        this._addCommand(history[i],"sublime-text "+history[i], this.menu);	
                	}
                } 

                let workspaces = jsondata.workspaces.recent_workspaces;
                if(workspaces.length != 0) {
                    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
                    this.menu.addMenuItem(new PopupMenu.PopupMenuItem("Projects", { reactive: false, style_class: 'popup-subtitle-menu-item' }));
                }
                    for (let i = 0; i < workspaces.length; i++) {
                        this._addCommand(workspaces[i],"sublime-text --project "+workspaces[i], this.menu);   
                    }

            }
            catch (e) {
                global.logError(_("Error reading config = ") + e);
            }
        } else this._addCommand('Open Sublime Text 2',"sublime-text", this.menu);   

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
