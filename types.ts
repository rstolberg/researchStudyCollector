export interface ResearchStudy {
	title: string;
	authors: string[];
	abstract: string;
	url: string;
	publishDate: string;
	source: 'arxiv' | 'pubmed' | 'semantic-scholar';
	doi?: string;
	arxivId?: string;
	pmid?: string;
}

export interface ResearchCollectorSettings {
	claudeCodePath: string;
	defaultResearchSource: 'arxiv' | 'pubmed' | 'semantic-scholar' | 'all';
	maxResults: number;
	semanticScholarApiKey: string;
	pubmedEmail: string;
	promptTemplate: string;
}

export const DEFAULT_SETTINGS: ResearchCollectorSettings = {
	claudeCodePath: 'claude',
	defaultResearchSource: 'arxiv',
	maxResults: 10,
	semanticScholarApiKey: '',
	pubmedEmail: '',
	promptTemplate: `Based on the following note content, identify key research topics and suggest relevant search queries for finding related academic research:

{NOTE_CONTENT}

Please provide:
1. Main research topics (3-5 topics)
2. Suggested search queries for each topic
3. Any trends or connections you notice

Format your response as JSON with the structure:
{
  "topics": ["topic1", "topic2", ...],
  "queries": ["query1", "query2", ...],
  "trends": "brief analysis"
}`
};

export interface ClaudeAnalysisResult {
	topics: string[];
	queries: string[];
	trends: string;
}
