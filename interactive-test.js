#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function print(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

function header(text) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + text.toUpperCase() + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(70) + colors.reset + '\n');
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(colors.yellow + prompt + colors.reset, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function multipleChoice(questionText, options, correctIndex, explanation) {
  print('\n' + questionText, 'bright');
  options.forEach((option, index) => {
    console.log(`  ${index + 1}. ${option}`);
  });

  const answer = await question('\nYour answer (1-' + options.length + '): ');
  const answerIndex = parseInt(answer) - 1;

  if (answerIndex === correctIndex) {
    print('\n✓ Correct!', 'green');
  } else {
    print('\n✗ Not quite. The correct answer is: ' + options[correctIndex], 'red');
  }

  print('\nExplanation:', 'cyan');
  print(explanation);

  await question('\nPress Enter to continue...');
}

async function codeQuestion(questionText, filePath, startLine, endLine, explanation) {
  print('\n' + questionText, 'bright');

  const fullPath = path.join(__dirname, filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const lines = fileContent.split('\n');

  print(`\nCode from ${filePath}:${startLine}-${endLine}`, 'magenta');
  print('─'.repeat(70), 'magenta');

  for (let i = startLine - 1; i < endLine; i++) {
    const lineNum = (i + 1).toString().padStart(4, ' ');
    console.log(colors.blue + lineNum + colors.reset + '  ' + lines[i]);
  }

  print('─'.repeat(70), 'magenta');
  print('\n' + explanation, 'cyan');

  await question('\nPress Enter to continue...');
}

async function runInteractiveTest() {
  console.clear();

  header('Research Study Collector Plugin - Interactive Code Tutorial');

  print('Welcome! This interactive tutorial will teach you how this Obsidian plugin', 'bright');
  print('works at the code level. You\'ll learn about the architecture, data flow,', 'bright');
  print('and key components.\n', 'bright');

  await question('Press Enter to start...');

  // ============================================================================
  // SECTION 1: Overview
  // ============================================================================

  header('Section 1: Plugin Architecture Overview');

  print('This plugin has 6 main TypeScript files:');
  print('  1. main.ts - Entry point and orchestration');
  print('  2. types.ts - Type definitions and interfaces');
  print('  3. settings.ts - Settings UI');
  print('  4. claudeIntegration.ts - Claude AI integration');
  print('  5. researchAPIs.ts - Research database APIs');
  print('  6. researchModal.ts - Results display UI\n');

  await multipleChoice(
    'What is the main entry point of the plugin?',
    [
      'settings.ts',
      'main.ts',
      'claudeIntegration.ts',
      'index.ts'
    ],
    1,
    'main.ts contains the ResearchStudyCollector class that extends Obsidian\'s Plugin class. ' +
    'It\'s loaded by Obsidian when the plugin starts, and handles initialization, command registration, ' +
    'and orchestrating the entire workflow.'
  );

  // ============================================================================
  // SECTION 2: Plugin Lifecycle
  // ============================================================================

  header('Section 2: Plugin Lifecycle');

  await codeQuestion(
    'Let\'s look at how the plugin initializes when Obsidian loads it:',
    'main.ts',
    11,
    37,
    'The onload() method is called by Obsidian when the plugin loads. It:\n' +
    '  1. Loads saved settings from disk\n' +
    '  2. Adds a ribbon icon (microscope) to the sidebar\n' +
    '  3. Registers a command for the command palette\n' +
    '  4. Adds the settings tab\n\n' +
    'Both the ribbon icon and command trigger the collectResearchStudies() method.'
  );

  await multipleChoice(
    'What happens when you click the microscope ribbon icon?',
    [
      'It opens the settings dialog',
      'It creates a new note',
      'It calls collectResearchStudies()',
      'It opens the plugin documentation'
    ],
    2,
    'Looking at line 19, the ribbon icon\'s click handler calls this.collectResearchStudies(). ' +
    'This is the main workflow that analyzes the current note and searches for research papers.'
  );

  // ============================================================================
  // SECTION 3: Data Flow
  // ============================================================================

  header('Section 3: Understanding the Data Flow');

  print('The plugin follows a 3-step workflow:');
  print('  Step 1: Analyze note with Claude AI');
  print('  Step 2: Search research databases with extracted queries');
  print('  Step 3: Display results in a modal\n');

  await codeQuestion(
    'Here\'s the main orchestration logic:',
    'main.ts',
    51,
    102,
    'The collectResearchStudies() method orchestrates everything:\n\n' +
    '  Lines 52-65: Validate that there\'s an active note with content\n' +
    '  Lines 71-75: Call Claude to analyze the note and extract search queries\n' +
    '  Lines 80-88: Search research databases using the extracted queries\n' +
    '  Lines 91-96: Display results in a modal\n' +
    '  Lines 98-101: Handle any errors that occur'
  );

  await multipleChoice(
    'What data does Claude extract from the note?',
    [
      'Just the title and authors',
      'Topics, queries, and trends',
      'Only search queries',
      'The entire note content'
    ],
    1,
    'According to the ClaudeAnalysisResult interface in types.ts, Claude returns:\n' +
    '  - topics: An array of main research topics (3-5 topics)\n' +
    '  - queries: Search queries for each topic\n' +
    '  - trends: A brief analysis of connections and trends\n\n' +
    'This structured data is used to search research databases intelligently.'
  );

  // ============================================================================
  // SECTION 4: Claude Integration
  // ============================================================================

  header('Section 4: Claude AI Integration');

  await codeQuestion(
    'Let\'s see how the plugin communicates with Claude:',
    'claudeIntegration.ts',
    13,
    32,
    'The analyzeNoteWithClaude() function:\n\n' +
    '  1. Takes the note content and prompt template\n' +
    '  2. Replaces {NOTE_CONTENT} placeholder with actual content\n' +
    '  3. Writes the prompt to a temporary file\n' +
    '  4. Executes the Claude Code CLI with:\n' +
    '     --print: non-interactive mode\n' +
    '     --max-turns 3: limits agentic processing\n' +
    '  5. Parses the JSON response from stdout'
  );

  await multipleChoice(
    'Why does the plugin write to a temporary file instead of passing the prompt directly?',
    [
      'To save memory',
      'To avoid command-line length limits and special character issues',
      'To create a backup',
      'Claude Code requires file input'
    ],
    1,
    'Command-line arguments have length limits (especially on Windows) and can have issues ' +
    'with special characters, quotes, and newlines. Using a temporary file via stdin redirection ' +
    '(< tempFile) is more reliable for long, complex prompts with markdown and special characters.'
  );

  await codeQuestion(
    'Here\'s the JSON parsing logic:',
    'claudeIntegration.ts',
    50,
    72,
    'The response parsing has two strategies:\n\n' +
    '  1. Primary: Extract JSON using regex and parse it\n' +
    '  2. Fallback: If JSON parsing fails, use extractInfoManually()\n' +
    '     which looks for section headers like "Topics:", "Queries:", etc.\n\n' +
    'This makes the plugin resilient to different Claude response formats.'
  );

  // ============================================================================
  // SECTION 5: Research APIs
  // ============================================================================

  header('Section 5: Research Database Integration');

  print('The plugin can search three research databases:');
  print('  1. arXiv - Physics, math, CS preprints (http://export.arxiv.org/api/)');
  print('  2. PubMed - Biomedical literature (https://eutils.ncbi.nlm.nih.gov/)');
  print('  3. Semantic Scholar - Multi-disciplinary (https://api.semanticscholar.org/)\n');

  await codeQuestion(
    'Here\'s how the search orchestration works:',
    'researchAPIs.ts',
    9,
    48,
    'The searchAllSources() function:\n\n' +
    '  1. Loops through each search query from Claude\n' +
    '  2. If source is "all", searches all three databases in parallel\n' +
    '  3. Otherwise, searches only the selected database\n' +
    '  4. Combines all results and removes duplicates by title\n\n' +
    'Using Promise.allSettled() means if one API fails, the others still work!'
  );

  await multipleChoice(
    'What does the searchArxiv() function parse to extract study data?',
    [
      'JSON from REST API',
      'HTML web pages',
      'XML from Atom feed',
      'CSV files'
    ],
    2,
    'Looking at lines 55-61 of researchAPIs.ts, arXiv returns XML in Atom format. ' +
    'The plugin uses DOMParser to parse the XML and querySelector to extract:\n' +
    '  - title\n' +
    '  - summary (abstract)\n' +
    '  - published date\n' +
    '  - author names\n' +
    '  - arXiv ID\n\n' +
    'PubMed also uses XML, while Semantic Scholar uses JSON.'
  );

  await codeQuestion(
    'Here\'s the arXiv parsing logic:',
    'researchAPIs.ts',
    65,
    89,
    'For each <entry> in the XML feed:\n\n' +
    '  1. Extract title, summary, published date, and ID using querySelector\n' +
    '  2. Loop through all <author><name> elements to get authors\n' +
    '  3. Extract arXiv ID from the URL (last part after /)\n' +
    '  4. Create a ResearchStudy object with:\n' +
    '     - Cleaned title/abstract (remove extra whitespace)\n' +
    '     - Authors array\n' +
    '     - URL, date, source indicator\n' +
    '     - arXiv-specific fields like arxivId'
  );

  // ============================================================================
  // SECTION 6: Type System
  // ============================================================================

  header('Section 6: TypeScript Type System');

  await codeQuestion(
    'Let\'s examine the core data structures:',
    'types.ts',
    1,
    20,
    'Two main interfaces define the plugin\'s data model:\n\n' +
    'ResearchStudy: Represents a single paper with:\n' +
    '  - Common fields: title, authors, abstract, url, publishDate, source\n' +
    '  - Optional identifiers: doi, arxivId, pmid\n' +
    '  - Source is a union type: \'arxiv\' | \'pubmed\' | \'semantic-scholar\'\n\n' +
    'ResearchCollectorSettings: User configuration including:\n' +
    '  - Claude Code CLI path\n' +
    '  - Default research source\n' +
    '  - API keys for rate limit increases\n' +
    '  - Custom prompt template'
  );

  await multipleChoice(
    'Why does ResearchStudy have optional fields (doi?, arxivId?, pmid?)?',
    [
      'To save memory',
      'They\'re not important fields',
      'Different sources provide different identifiers',
      'TypeScript requires it'
    ],
    2,
    'Different research databases use different identifier systems:\n' +
    '  - arXiv papers have arxivId (e.g., "2301.12345")\n' +
    '  - PubMed papers have pmid (PubMed ID)\n' +
    '  - Some have DOI (Digital Object Identifier)\n\n' +
    'Making these optional (with ?) means each paper can have whichever IDs ' +
    'are relevant without requiring all of them.'
  );

  // ============================================================================
  // SECTION 7: Results Modal
  // ============================================================================

  header('Section 7: Results Display');

  await codeQuestion(
    'The ResearchResultsModal displays the final results:',
    'researchModal.ts',
    16,
    48,
    'The onOpen() method builds the modal UI:\n\n' +
    '  1. Creates a header with the note title and result count\n' +
    '  2. Shows Claude\'s trend analysis in a highlighted section\n' +
    '  3. Creates a scrollable list of research papers\n' +
    '  4. Each paper shows:\n' +
    '     - Source badge (arXiv, PubMed, or Semantic Scholar)\n' +
    '     - Clickable title linking to the paper\n' +
    '     - Authors (max 3, then "et al.")\n' +
    '     - Publication date\n' +
    '     - Collapsible abstract\n' +
    '     - Identifiers (DOI, arXiv ID, PMID)'
  );

  await codeQuestion(
    'Here\'s how the abstract toggle works:',
    'researchModal.ts',
    90,
    111,
    'Each abstract is collapsible using a toggle button:\n\n' +
    '  1. Abstract content starts with "hidden" CSS class\n' +
    '  2. Click listener checks if it has the "hidden" class\n' +
    '  3. Toggles the class and changes button text:\n' +
    '     - "Show abstract ▼" when hidden\n' +
    '     - "Hide abstract ▲" when visible\n\n' +
    'This keeps the modal compact when displaying many papers.'
  );

  // ============================================================================
  // SECTION 8: Settings
  // ============================================================================

  header('Section 8: Settings Management');

  await codeQuestion(
    'The settings tab provides user configuration:',
    'settings.ts',
    19,
    44,
    'Each setting creates a UI element using Obsidian\'s Setting class:\n\n' +
    '  1. Claude Code Path: Text input for CLI executable location\n' +
    '  2. Default Research Source: Dropdown menu (arXiv/PubMed/Semantic Scholar/All)\n' +
    '  3. Max Results: Number input for result limit per query\n\n' +
    'The onChange handlers:\n' +
    '  - Update this.plugin.settings object\n' +
    '  - Call saveSettings() to persist to disk\n' +
    '  - Validate inputs (e.g., ensuring maxResults is a positive number)'
  );

  await multipleChoice(
    'Where are the plugin settings stored?',
    [
      'In a cloud database',
      'In the note files themselves',
      'In .obsidian/plugins/research-study-collector/data.json',
      'In browser localStorage'
    ],
    2,
    'Obsidian plugins store settings in their plugin folder as data.json. ' +
    'The Plugin.loadData() and Plugin.saveData() methods in main.ts handle this:\n\n' +
    '  - loadSettings() reads from data.json and merges with DEFAULT_SETTINGS\n' +
    '  - saveSettings() writes the current settings object to data.json\n\n' +
    'This file persists across Obsidian sessions.'
  );

  // ============================================================================
  // SECTION 9: Error Handling
  // ============================================================================

  header('Section 9: Error Handling Strategy');

  print('The plugin uses multiple layers of error handling:');
  print('  1. Validation: Check for active note and content before processing');
  print('  2. Try-catch: Wrap API calls and Claude execution');
  print('  3. Promise.allSettled: Allow partial success when searching multiple sources');
  print('  4. Fallback parsing: Manual extraction if JSON parsing fails');
  print('  5. User feedback: Show Notice with error messages\n');

  await multipleChoice(
    'What happens if Claude Code fails to execute?',
    [
      'The plugin crashes Obsidian',
      'It silently fails with no feedback',
      'An error Notice is shown to the user',
      'It automatically retries'
    ],
    2,
    'Looking at main.ts lines 98-101, any error in collectResearchStudies() is caught and:\n' +
    '  1. Logged to console for debugging\n' +
    '  2. Shown to user via new Notice(`Error: ${error.message}`)\n\n' +
    'Similarly, in claudeIntegration.ts:\n' +
    '  - Temp files are cleaned up even on error\n' +
    '  - Errors are caught and re-thrown with clear messages\n\n' +
    'This prevents the entire plugin from crashing and gives users actionable feedback.'
  );

  // ============================================================================
  // SECTION 10: Advanced Features
  // ============================================================================

  header('Section 10: Advanced Features');

  await codeQuestion(
    'The plugin includes an alternative API-based Claude integration:',
    'claudeIntegration.ts',
    163,
    208,
    'Besides using Claude Code CLI, there\'s also analyzeNoteWithClaudeAPI():\n\n' +
    '  - Makes direct HTTP requests to Anthropic\'s API\n' +
    '  - Requires an API key in headers\n' +
    '  - Uses claude-3-5-sonnet-20241022 model\n' +
    '  - Same prompt and parsing logic as CLI version\n\n' +
    'This provides an alternative for users who prefer API access over CLI, ' +
    'though currently only the CLI integration is wired up in main.ts.'
  );

  await multipleChoice(
    'How does the PubMed search work differently from arXiv?',
    [
      'It uses JSON instead of XML',
      'It requires two API calls: search for IDs, then fetch details',
      'It doesn\'t support abstracts',
      'It only searches titles'
    ],
    1,
    'Looking at searchPubMed() in researchAPIs.ts (lines 98-162):\n\n' +
    'Step 1 (esearch): Search for matching paper IDs\n' +
    '  - Returns list of PubMed IDs (PMIDs)\n' +
    '  - Uses search query terms\n\n' +
    'Step 2 (efetch): Fetch full details for those IDs\n' +
    '  - Takes comma-separated PMIDs\n' +
    '  - Returns XML with full article metadata\n\n' +
    'arXiv and Semantic Scholar only need one call. This is just how ' +
    'NCBI\'s E-utilities API is designed.'
  );

  // ============================================================================
  // FINAL SECTION: Summary
  // ============================================================================

  header('Final Summary: Complete Data Flow');

  print('Let\'s trace a complete execution from start to finish:\n');
  print('1. USER ACTION: Click microscope icon or run command');
  print('   → main.ts:collectResearchStudies() called\n');

  print('2. VALIDATION: Check for active note with content');
  print('   → main.ts:52-65\n');

  print('3. CLAUDE ANALYSIS: Extract research topics and queries');
  print('   → main.ts:71-75 calls claudeIntegration.ts:analyzeNoteWithClaude()');
  print('   → Writes prompt to temp file');
  print('   → Executes: claude --print --max-turns 3 < tempfile');
  print('   → Parses JSON response for topics, queries, trends\n');

  print('4. DATABASE SEARCH: Query research APIs');
  print('   → main.ts:80-88 calls researchAPIs.ts:searchAllSources()');
  print('   → For each query, searches selected databases');
  print('   → Parses XML (arXiv, PubMed) or JSON (Semantic Scholar)');
  print('   → Combines and deduplicates results\n');

  print('5. DISPLAY RESULTS: Show in modal UI');
  print('   → main.ts:91-96 creates ResearchResultsModal');
  print('   → Builds HTML with papers, abstracts, links');
  print('   → Applies CSS styling');
  print('   → User can click titles or expand abstracts\n');

  print('6. ERROR HANDLING: At each step');
  print('   → Show Notice to user if anything fails');
  print('   → Clean up temp files');
  print('   → Log to console for debugging\n');

  await question('Press Enter to finish...');

  // ============================================================================
  // END
  // ============================================================================

  console.clear();
  header('Congratulations!');

  print('You\'ve completed the Research Study Collector interactive code tutorial!\n', 'green');

  print('Key takeaways:', 'bright');
  print('  ✓ Plugin architecture: main.ts orchestrates 5 specialized modules');
  print('  ✓ Data flow: Note → Claude → Queries → APIs → Results → Modal');
  print('  ✓ Claude integration: Uses CLI with temp files and JSON parsing');
  print('  ✓ Multi-source search: arXiv (XML), PubMed (2-step XML), Semantic Scholar (JSON)');
  print('  ✓ Type safety: TypeScript interfaces define data structures');
  print('  ✓ Error handling: Multiple layers with user feedback');
  print('  ✓ UI: Modal with collapsible abstracts and source badges\n');

  print('Next steps:', 'yellow');
  print('  - Read the source files directly for more details');
  print('  - Modify the prompt template in settings to customize Claude\'s analysis');
  print('  - Try searching different research databases');
  print('  - Extend the plugin with new features!\n');

  rl.close();
}

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
  print('\n\nTutorial interrupted. Goodbye!', 'yellow');
  rl.close();
  process.exit(0);
});

// Run the tutorial
runInteractiveTest().catch((error) => {
  console.error('Error running tutorial:', error);
  rl.close();
  process.exit(1);
});
