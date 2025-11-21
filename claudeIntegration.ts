import { ClaudeAnalysisResult } from './types';
import { Notice } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execPromise = promisify(exec);
const writeFilePromise = promisify(fs.writeFile);
const unlinkPromise = promisify(fs.unlink);

export async function analyzeNoteWithClaude(
	noteContent: string,
	claudeCodePath: string,
	promptTemplate: string
): Promise<ClaudeAnalysisResult> {
	// Replace placeholder with actual content
	const prompt = promptTemplate.replace('{NOTE_CONTENT}', noteContent);

	// Create a temporary file for the prompt
	const tempDir = os.tmpdir();
	const tempFile = path.join(tempDir, `obsidian-claude-prompt-${Date.now()}.txt`);

	try {
		// Write prompt to temporary file
		await writeFilePromise(tempFile, prompt, 'utf8');

		// Execute Claude Code CLI with input from file
		// --print: non-interactive mode, outputs response to stdout
		// --max-turns: limit agentic turns to prevent runaway processing
		const command = `${claudeCodePath} --print --max-turns 3 < "${tempFile}"`;

		const { stdout, stderr } = await execPromise(command, {
			maxBuffer: 1024 * 1024 * 10, // 10MB buffer
			timeout: 120000 // 2 minute timeout
		});

		// Clean up temp file
		try {
			await unlinkPromise(tempFile);
		} catch (cleanupError) {
			console.warn('Failed to delete temp file:', cleanupError);
		}

		if (stderr && !stderr.includes('Warning')) {
			console.warn('Claude Code stderr:', stderr);
		}

		// Parse the response
		const response = stdout.trim();

		// Try to extract JSON from the response
		const jsonMatch = response.match(/\{[\s\S]*\}/);

		if (jsonMatch) {
			try {
				const parsed = JSON.parse(jsonMatch[0]);
				return {
					topics: parsed.topics || [],
					queries: parsed.queries || [],
					trends: parsed.trends || 'No trend analysis available'
				};
			} catch (parseError) {
				console.error('Failed to parse Claude response as JSON:', parseError);
				// Fallback: extract information manually
				return extractInfoManually(response, noteContent);
			}
		} else {
			// No JSON found, extract information manually
			return extractInfoManually(response, noteContent);
		}
	} catch (error) {
		// Clean up temp file on error
		try {
			await unlinkPromise(tempFile);
		} catch (cleanupError) {
			// Ignore cleanup errors
		}
		console.error('Error executing Claude Code:', error);
		throw new Error(`Failed to analyze with Claude: ${error.message}`);
	}
}

function extractInfoManually(response: string, noteContent: string): ClaudeAnalysisResult {
	// Fallback method: try to extract topics and queries from free-form text
	const lines = response.split('\n').filter(line => line.trim());

	const topics: string[] = [];
	const queries: string[] = [];
	let trends = '';

	let inTopicsSection = false;
	let inQueriesSection = false;
	let inTrendsSection = false;

	for (const line of lines) {
		const lowerLine = line.toLowerCase();

		// Detect sections
		if (lowerLine.includes('topic') && lowerLine.includes(':')) {
			inTopicsSection = true;
			inQueriesSection = false;
			inTrendsSection = false;
			continue;
		}
		if (lowerLine.includes('quer') && lowerLine.includes(':')) {
			inTopicsSection = false;
			inQueriesSection = true;
			inTrendsSection = false;
			continue;
		}
		if (lowerLine.includes('trend') && lowerLine.includes(':')) {
			inTopicsSection = false;
			inQueriesSection = false;
			inTrendsSection = true;
			continue;
		}

		// Extract items
		if (inTopicsSection) {
			const cleaned = line.replace(/^[-*•\d.)\]]+\s*/, '').trim();
			if (cleaned && cleaned.length > 2) {
				topics.push(cleaned);
			}
		}
		if (inQueriesSection) {
			const cleaned = line.replace(/^[-*•\d.)\]]+\s*/, '').trim();
			if (cleaned && cleaned.length > 2) {
				queries.push(cleaned);
			}
		}
		if (inTrendsSection) {
			trends += line + ' ';
		}
	}

	// If we didn't extract anything useful, create basic queries from note content
	if (queries.length === 0) {
		// Extract potential keywords from note content
		const words = noteContent.split(/\s+/)
			.filter(word => word.length > 4)
			.slice(0, 50);

		// Create a simple query from the first few words
		if (words.length > 0) {
			queries.push(words.slice(0, 10).join(' '));
		}
	}

	if (topics.length === 0 && queries.length > 0) {
		topics.push(...queries.slice(0, 3));
	}

	return {
		topics: topics.slice(0, 5),
		queries: queries.slice(0, 5),
		trends: trends.trim() || response.substring(0, 500)
	};
}

// Alternative: Use Claude API directly (requires API key)
export async function analyzeNoteWithClaudeAPI(
	noteContent: string,
	apiKey: string,
	promptTemplate: string
): Promise<ClaudeAnalysisResult> {
	const prompt = promptTemplate.replace('{NOTE_CONTENT}', noteContent);

	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: 'claude-3-5-sonnet-20241022',
			max_tokens: 1024,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			]
		})
	});

	if (!response.ok) {
		throw new Error(`Claude API error: ${response.statusText}`);
	}

	const data = await response.json();
	const content = data.content[0].text;

	// Try to parse JSON from response
	const jsonMatch = content.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		const parsed = JSON.parse(jsonMatch[0]);
		return {
			topics: parsed.topics || [],
			queries: parsed.queries || [],
			trends: parsed.trends || 'No trend analysis available'
		};
	}

	return extractInfoManually(content, noteContent);
}
