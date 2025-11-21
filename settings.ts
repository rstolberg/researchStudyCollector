import { App, PluginSettingTab, Setting } from 'obsidian';
import ResearchStudyCollector from './main';

export class ResearchCollectorSettingTab extends PluginSettingTab {
	plugin: ResearchStudyCollector;

	constructor(app: App, plugin: ResearchStudyCollector) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Research Study Collector Settings' });

		// Claude Configuration
		containerEl.createEl('h3', { text: 'Claude Configuration' });

		new Setting(containerEl)
			.setName('Claude Code CLI path')
			.setDesc('Path to the Claude Code CLI executable (desktop only, e.g., "claude" or "/usr/local/bin/claude")')
			.addText(text => text
				.setPlaceholder('claude')
				.setValue(this.plugin.settings.claudeCodePath)
				.onChange(async (value) => {
					this.plugin.settings.claudeCodePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Claude API key')
			.setDesc('API key for Claude (required for mobile, optional for desktop). Get one at console.anthropic.com')
			.addText(text => {
				text
					.setPlaceholder('sk-ant-api...')
					.setValue(this.plugin.settings.claudeApiKey)
					.onChange(async (value) => {
						this.plugin.settings.claudeApiKey = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

		// Default Research Source
		new Setting(containerEl)
			.setName('Default research source')
			.setDesc('Choose which research database to search by default')
			.addDropdown(dropdown => dropdown
				.addOption('arxiv', 'arXiv')
				.addOption('pubmed', 'PubMed')
				.addOption('semantic-scholar', 'Semantic Scholar')
				.addOption('all', 'All sources')
				.setValue(this.plugin.settings.defaultResearchSource)
				.onChange(async (value) => {
					this.plugin.settings.defaultResearchSource = value as any;
					await this.plugin.saveSettings();
				}));

		// Max Results
		new Setting(containerEl)
			.setName('Maximum results')
			.setDesc('Maximum number of research papers to retrieve per query')
			.addText(text => text
				.setPlaceholder('10')
				.setValue(String(this.plugin.settings.maxResults))
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num) && num > 0) {
						this.plugin.settings.maxResults = num;
						await this.plugin.saveSettings();
					}
				}));

		// Research Database Configuration
		containerEl.createEl('h3', { text: 'Research Database Configuration' });

		new Setting(containerEl)
			.setName('Semantic Scholar API key')
			.setDesc('Optional: API key for Semantic Scholar (increases rate limits)')
			.addText(text => text
				.setPlaceholder('Enter API key')
				.setValue(this.plugin.settings.semanticScholarApiKey)
				.onChange(async (value) => {
					this.plugin.settings.semanticScholarApiKey = value;
					await this.plugin.saveSettings();
				}));

		// PubMed Email
		new Setting(containerEl)
			.setName('PubMed email')
			.setDesc('Optional: Email for PubMed API (increases rate limits)')
			.addText(text => text
				.setPlaceholder('your@email.com')
				.setValue(this.plugin.settings.pubmedEmail)
				.onChange(async (value) => {
					this.plugin.settings.pubmedEmail = value;
					await this.plugin.saveSettings();
				}));

		// Prompt Template
		containerEl.createEl('h3', { text: 'Claude Prompt Template' });

		new Setting(containerEl)
			.setName('Prompt template')
			.setDesc('Template for Claude analysis. Use {NOTE_CONTENT} as placeholder.')
			.addTextArea(text => {
				text
					.setPlaceholder('Enter prompt template')
					.setValue(this.plugin.settings.promptTemplate)
					.onChange(async (value) => {
						this.plugin.settings.promptTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 10;
				text.inputEl.cols = 50;
			});
	}
}
