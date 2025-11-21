import { Plugin, Notice, WorkspaceLeaf, MarkdownView, Platform } from 'obsidian';
import { ResearchCollectorSettings, DEFAULT_SETTINGS } from './types';
import { ResearchCollectorSettingTab } from './settings';
import { ResearchResultsModal } from './researchModal';
import { analyzeNoteWithClaude, analyzeNoteWithClaudeAPI } from './claudeIntegration';
import { searchAllSources } from './researchAPIs';

export default class ResearchStudyCollector extends Plugin {
	settings: ResearchCollectorSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon
		const ribbonIconEl = this.addRibbonIcon(
			'microscope',
			'Research Study Collector',
			async (evt: MouseEvent) => {
				await this.collectResearchStudies();
			}
		);
		ribbonIconEl.addClass('research-collector-ribbon-class');

		// Add command
		this.addCommand({
			id: 'collect-research-studies',
			name: 'Analyze current note and collect research',
			callback: async () => {
				await this.collectResearchStudies();
			}
		});

		// Add settings tab
		this.addSettingTab(new ResearchCollectorSettingTab(this.app, this));

		console.log('Research Study Collector plugin loaded');
	}

	onunload() {
		console.log('Research Study Collector plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async collectResearchStudies() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!activeView) {
			new Notice('No active note found. Please open a note first.');
			return;
		}

		const noteContent = activeView.getViewData();
		const noteTitle = activeView.file?.basename || 'Untitled';

		if (!noteContent.trim()) {
			new Notice('Current note is empty. Please add some content first.');
			return;
		}

		new Notice('Analyzing note with Claude...');

		try {
			// Step 1: Analyze note with Claude
			// Use API on mobile, CLI on desktop
			let analysis;
			if (Platform.isMobile) {
				// Mobile: Use Claude API
				if (!this.settings.claudeApiKey) {
					new Notice('Claude API key not configured. Please add it in settings.');
					return;
				}
				analysis = await analyzeNoteWithClaudeAPI(
					noteContent,
					this.settings.claudeApiKey,
					this.settings.promptTemplate
				);
			} else {
				// Desktop: Use Claude CLI
				analysis = await analyzeNoteWithClaude(
					noteContent,
					this.settings.claudeCodePath,
					this.settings.promptTemplate
				);
			}

			new Notice(`Found ${analysis.queries.length} search queries. Searching research databases...`);

			// Step 2: Search research databases
			const studies = await searchAllSources(
				analysis.queries,
				this.settings.defaultResearchSource,
				this.settings.maxResults,
				{
					semanticScholarApiKey: this.settings.semanticScholarApiKey,
					pubmedEmail: this.settings.pubmedEmail
				}
			);

			// Step 3: Display results in modal
			new ResearchResultsModal(
				this.app,
				studies,
				analysis.trends,
				noteTitle
			).open();

		} catch (error) {
			console.error('Error collecting research studies:', error);
			new Notice(`Error: ${error.message}`);
		}
	}
}
