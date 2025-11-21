import { App, Modal } from 'obsidian';
import { ResearchStudy } from './types';

export class ResearchResultsModal extends Modal {
	studies: ResearchStudy[];
	trends: string;
	noteTitle: string;

	constructor(app: App, studies: ResearchStudy[], trends: string, noteTitle: string) {
		super(app);
		this.studies = studies;
		this.trends = trends;
		this.noteTitle = noteTitle;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('research-collector-modal');

		// Add class to modal element itself for width control
		this.modalEl.addClass('research-collector-modal');

		// Header
		const header = contentEl.createEl('div', { cls: 'research-collector-header' });
		header.createEl('h2', { text: `Research Results for: ${this.noteTitle}` });
		header.createEl('p', {
			text: `Found ${this.studies.length} relevant research paper${this.studies.length !== 1 ? 's' : ''}`,
			cls: 'research-collector-count'
		});

		// Trends Section
		if (this.trends) {
			const trendsSection = contentEl.createEl('div', { cls: 'research-collector-trends' });
			trendsSection.createEl('h3', { text: 'Research Trends Analysis' });
			const trendsContent = trendsSection.createEl('div', { cls: 'trends-content' });
			trendsContent.createEl('p', { text: this.trends });
		}

		// Studies List
		const studiesList = contentEl.createEl('div', { cls: 'research-collector-studies' });

		if (this.studies.length === 0) {
			studiesList.createEl('p', {
				text: 'No research papers found. Try adjusting your note content or search parameters.',
				cls: 'no-results'
			});
		} else {
			this.studies.forEach((study, index) => {
				const studyEl = studiesList.createEl('div', { cls: 'research-study-item' });

				// Study number and source badge
				const studyHeader = studyEl.createEl('div', { cls: 'study-header' });
				studyHeader.createEl('span', {
					text: `${index + 1}.`,
					cls: 'study-number'
				});
				studyHeader.createEl('span', {
					text: study.source.toUpperCase(),
					cls: `source-badge source-${study.source}`
				});

				// Title (clickable link)
				const titleLink = studyEl.createEl('a', {
					text: study.title,
					cls: 'study-title',
					href: study.url
				});
				titleLink.setAttribute('target', '_blank');

				// Authors
				if (study.authors.length > 0) {
					const authorsText = study.authors.length > 3
						? `${study.authors.slice(0, 3).join(', ')} et al.`
						: study.authors.join(', ');
					studyEl.createEl('div', {
						text: authorsText,
						cls: 'study-authors'
					});
				}

				// Date
				if (study.publishDate) {
					studyEl.createEl('div', {
						text: `Published: ${study.publishDate}`,
						cls: 'study-date'
					});
				}

				// Abstract (collapsible)
				const abstractContainer = studyEl.createEl('div', { cls: 'abstract-container' });
				const abstractToggle = abstractContainer.createEl('div', {
					cls: 'abstract-toggle',
					text: 'Show abstract ▼'
				});
				const abstractContent = abstractContainer.createEl('div', {
					cls: 'abstract-content hidden'
				});
				abstractContent.createEl('p', { text: study.abstract });

				// Toggle abstract visibility
				abstractToggle.addEventListener('click', () => {
					const isHidden = abstractContent.hasClass('hidden');
					if (isHidden) {
						abstractContent.removeClass('hidden');
						abstractToggle.setText('Hide abstract ▲');
					} else {
						abstractContent.addClass('hidden');
						abstractToggle.setText('Show abstract ▼');
					}
				});

				// IDs (DOI, arXiv ID, PMID)
				const idsContainer = studyEl.createEl('div', { cls: 'study-ids' });
				if (study.doi) {
					const doiLink = idsContainer.createEl('a', {
						text: `DOI: ${study.doi}`,
						href: `https://doi.org/${study.doi}`,
						cls: 'study-id-link'
					});
					doiLink.setAttribute('target', '_blank');
				}
				if (study.arxivId) {
					if (study.doi) idsContainer.createEl('span', { text: ' | ' });
					idsContainer.createEl('span', {
						text: `arXiv: ${study.arxivId}`,
						cls: 'study-id'
					});
				}
				if (study.pmid) {
					if (study.doi || study.arxivId) idsContainer.createEl('span', { text: ' | ' });
					idsContainer.createEl('span', {
						text: `PMID: ${study.pmid}`,
						cls: 'study-id'
					});
				}
			});
		}

		// Add CSS
		this.addStyles();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	addStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.modal.research-collector-modal {
				width: 700px !important;
				max-width: 90vw !important;
			}

			.research-collector-modal .modal-content {
				max-height: 80vh;
			}

			.research-collector-header {
				margin-bottom: 20px;
				padding-bottom: 15px;
				border-bottom: 2px solid var(--background-modifier-border);
			}

			.research-collector-header h2 {
				margin: 0 0 10px 0;
				color: var(--text-normal);
			}

			.research-collector-count {
				color: var(--text-muted);
				font-size: 0.9em;
				margin: 0;
			}

			.research-collector-trends {
				background: var(--background-secondary);
				padding: 15px;
				border-radius: 5px;
				margin-bottom: 20px;
			}

			.research-collector-trends h3 {
				margin: 0 0 10px 0;
				color: var(--text-normal);
			}

			.trends-content p {
				margin: 0;
				line-height: 1.6;
				white-space: pre-wrap;
			}

			.research-collector-studies {
				max-height: 500px;
				overflow-y: auto;
				padding-right: 10px;
			}

			.research-study-item {
				background: var(--background-primary);
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				padding: 15px;
				margin-bottom: 15px;
				transition: box-shadow 0.2s;
			}

			.research-study-item:hover {
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			}

			.study-header {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 8px;
			}

			.study-number {
				font-weight: bold;
				color: var(--text-muted);
			}

			.source-badge {
				display: inline-block;
				padding: 2px 8px;
				border-radius: 3px;
				font-size: 0.75em;
				font-weight: bold;
				text-transform: uppercase;
			}

			.source-arxiv {
				background: #b31b1b;
				color: white;
			}

			.source-pubmed {
				background: #326295;
				color: white;
			}

			.source-semantic-scholar {
				background: #1857b6;
				color: white;
			}

			.study-title {
				display: block;
				font-size: 1.1em;
				font-weight: 600;
				margin-bottom: 8px;
				color: var(--text-accent);
				text-decoration: none;
				line-height: 1.4;
			}

			.study-title:hover {
				text-decoration: underline;
			}

			.study-authors {
				color: var(--text-muted);
				font-size: 0.9em;
				margin-bottom: 5px;
			}

			.study-date {
				color: var(--text-muted);
				font-size: 0.85em;
				margin-bottom: 10px;
			}

			.abstract-container {
				margin-top: 10px;
			}

			.abstract-toggle {
				cursor: pointer;
				color: var(--text-accent);
				font-size: 0.9em;
				user-select: none;
				padding: 5px 0;
			}

			.abstract-toggle:hover {
				text-decoration: underline;
			}

			.abstract-content {
				margin-top: 8px;
				padding: 10px;
				background: var(--background-secondary);
				border-radius: 5px;
				line-height: 1.6;
				font-size: 0.9em;
			}

			.abstract-content.hidden {
				display: none;
			}

			.abstract-content p {
				margin: 0;
			}

			.study-ids {
				margin-top: 10px;
				font-size: 0.8em;
				color: var(--text-muted);
			}

			.study-id-link {
				color: var(--text-accent);
				text-decoration: none;
			}

			.study-id-link:hover {
				text-decoration: underline;
			}

			.no-results {
				text-align: center;
				color: var(--text-muted);
				padding: 40px;
			}
		`;
		document.head.appendChild(style);
	}
}
