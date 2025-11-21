# Obsidian Research Study Collector

An Obsidian plugin that intelligently collects and analyzes research studies based on your notes using Claude AI. Reduce the tension and time spent searching for relevant academic research by letting AI discover trends and find papers for you.

## Features

- **AI-Powered Analysis**: Integrates with Claude Code CLI to analyze your notes and identify research topics
- **Multi-Database Search**: Searches across arXiv, PubMed, and Semantic Scholar
- **Beautiful Results Display**: View research papers in a scrollable popup with expandable abstracts
- **Customizable Prompts**: Configure how Claude analyzes your notes
- **Smart Trend Detection**: Get insights about research trends related to your note content
- **Easy Access**: Trigger via command palette or ribbon icon

## Installation

### Prerequisites

1. **Obsidian** (v0.15.0 or higher)
2. **Claude Code CLI** installed and accessible from your terminal
   - Install from: https://claude.com/claude-code
   - Ensure `claude` command is in your PATH

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files to your Obsidian vault's plugins folder:
   - `<vault>/.obsidian/plugins/research-study-collector/`
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

### Development Installation

1. Clone this repository into your vault's plugins folder:
   ```bash
   cd <vault>/.obsidian/plugins
   git clone https://github.com/rstolberg/researchStudyCollector.git research-study-collector
   cd research-study-collector
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Reload Obsidian and enable the plugin

## Usage

1. **Open a note** with content you want to research
2. **Trigger the plugin** either by:
   - Clicking the microscope icon in the left ribbon
   - Using Command Palette: "Analyze current note and collect research"
3. **Wait for analysis**: Claude will analyze your note and identify research topics
4. **Browse results**: A popup will display relevant research papers with abstracts
5. **Expand abstracts**: Click "Show abstract" to read paper summaries
6. **Open papers**: Click paper titles to open them in your browser

## Configuration

Access settings via Settings > Research Study Collector:

### Claude Code Path
- Path to Claude Code CLI executable
- Default: `claude`
- Example: `/usr/local/bin/claude`

### Default Research Source
- Choose which database to search
- Options: arXiv (default), PubMed, Semantic Scholar, All sources

### Maximum Results
- Number of papers to retrieve per query
- Default: 10

### API Configuration
- **Semantic Scholar API Key** (optional): Increases rate limits
- **PubMed Email** (optional): Increases rate limits and helps NCBI contact you

### Prompt Template
- Customize how Claude analyzes your notes
- Use `{NOTE_CONTENT}` as placeholder for note text
- Default template asks for topics, queries, and trends

## How It Works

1. **Note Analysis**: Your note content is sent to Claude Code CLI with a customizable prompt
2. **Topic Extraction**: Claude identifies key research topics and generates search queries
3. **Multi-Database Search**: Queries are sent to selected research databases (arXiv, PubMed, Semantic Scholar)
4. **Deduplication**: Results are deduplicated based on title
5. **Display**: Papers are shown in a modal with metadata, abstracts, and links

## Research Sources

### arXiv
- Open access to preprints in physics, mathematics, computer science, and more
- No API key required
- Best for: STEM research

### PubMed
- Medical and life sciences research from NCBI
- No API key required (email optional for better rate limits)
- Best for: Medical, biological, and health sciences

### Semantic Scholar
- AI-powered cross-disciplinary research database
- Optional API key for higher rate limits
- Best for: Broad interdisciplinary research

## Examples

### Example 1: Literature Review
1. Create a note with your research topic: "Machine learning for protein folding"
2. Run the plugin
3. Claude identifies topics like "deep learning", "AlphaFold", "protein structure prediction"
4. Searches return recent papers from arXiv, PubMed, and Semantic Scholar
5. Review abstracts to find relevant papers

### Example 2: Trend Analysis
1. Create a note exploring a broad topic: "Climate change impacts on agriculture"
2. Run the plugin
3. Claude's trend analysis might reveal: "Research increasingly focuses on adaptation strategies and precision agriculture technologies"
4. Browse papers organized by source (arXiv, PubMed, Semantic Scholar)

## Troubleshooting

### "No active note found"
- Make sure you have a note open and in focus

### "Failed to analyze with Claude"
- Verify Claude Code CLI is installed: `claude --version`
- Check the Claude Code path in settings
- Ensure you're authenticated with Claude Code

### "No research papers found"
- Try making your note content more specific
- Adjust the prompt template to generate better queries
- Try "All sources" instead of a single database

### API Rate Limits
- Add your email for PubMed in settings
- Get a Semantic Scholar API key for higher limits
- Reduce "Maximum results" if hitting limits

## Development

### Building
```bash
npm run build
```

### Development Mode (auto-rebuild)
```bash
npm run dev
```

### Project Structure
- `main.ts` - Plugin entry point and coordination
- `types.ts` - TypeScript interfaces
- `settings.ts` - Settings tab configuration
- `claudeIntegration.ts` - Claude Code CLI integration
- `researchAPIs.ts` - Research database API integrations
- `researchModal.ts` - Results display modal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Created by Riley Stolberg

Powered by:
- Claude AI by Anthropic
- arXiv.org
- PubMed/NCBI
- Semantic Scholar
