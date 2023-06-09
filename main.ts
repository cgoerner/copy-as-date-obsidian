import { Plugin, TFile } from 'obsidian';

export default class CopyAsDatePlugin extends Plugin {

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

}
