import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface CopyAsDatePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CopyAsDatePluginSettings = {
	mySetting: 'default'
}

export default class CopyAsDatePlugin extends Plugin {
	settings: CopyAsDatePluginSettings;

	async onload() {
    console.log("copy-as-date loaded...");
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFile) {
					menu.addItem((item) => {
					item
						.setTitle("Copy as yyyy-mm-dd")
						.setIcon("documents")
						.onClick(async () => {
							this.copyAsDate(file);
						});
					});
				}
			})
		);
	
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const activeFile = this.app.workspace.getActiveFile()
				if ( activeFile instanceof TFile) {
					menu.addItem((item) => {
						item
						.setTitle("Copy as yyyy-mm-dd")
						.setIcon("documents")
						.onClick(async () => {
							this.copyAsDate(activeFile);
						});
					});
				}
			})
		);
	

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async copyAsDate(originalFile: TFile, nameSuffix = " 1", openFile = true) {
    let currentDate = new Date()
    const offset = currentDate.getTimezoneOffset()
    currentDate = new Date(currentDate.getTime() - (offset*60*1000))
    const strCurrentDate = currentDate.toISOString().split('T')[0]

		const newFilePath = originalFile.parent?.path + '/' + strCurrentDate + "." + originalFile.extension;
    const newFile = await this.app.vault.copy(originalFile, newFilePath);

		if (openFile === true) {
			this.app.workspace.getLeaf().openFile(newFile);
			const name = 'view-header-title';
			//@ts-ignore
			document.getElementsByClassName(name)[0].focus();
		}
    
	}

	onunload() {
    console.log("copy-as-date unloaded.");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



class SampleSettingTab extends PluginSettingTab {
	plugin: CopyAsDatePlugin;

	constructor(app: App, plugin: CopyAsDatePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Copy as Date Settings'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
