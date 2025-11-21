import { ResearchStudy } from './types';
import { requestUrl } from 'obsidian';

interface SearchOptions {
	semanticScholarApiKey?: string;
	pubmedEmail?: string;
}

export async function searchAllSources(
	queries: string[],
	source: 'arxiv' | 'pubmed' | 'semantic-scholar' | 'all',
	maxResults: number,
	options: SearchOptions
): Promise<ResearchStudy[]> {
	const allStudies: ResearchStudy[] = [];

	for (const query of queries) {
		let studies: ResearchStudy[] = [];

		if (source === 'all') {
			// Search all sources in parallel
			const [arxivResults, pubmedResults, semanticResults] = await Promise.allSettled([
				searchArxiv(query, maxResults),
				searchPubMed(query, maxResults, options.pubmedEmail),
				searchSemanticScholar(query, maxResults, options.semanticScholarApiKey)
			]);

			if (arxivResults.status === 'fulfilled') studies.push(...arxivResults.value);
			if (pubmedResults.status === 'fulfilled') studies.push(...pubmedResults.value);
			if (semanticResults.status === 'fulfilled') studies.push(...semanticResults.value);
		} else if (source === 'arxiv') {
			studies = await searchArxiv(query, maxResults);
		} else if (source === 'pubmed') {
			studies = await searchPubMed(query, maxResults, options.pubmedEmail);
		} else if (source === 'semantic-scholar') {
			studies = await searchSemanticScholar(query, maxResults, options.semanticScholarApiKey);
		}

		allStudies.push(...studies);
	}

	// Remove duplicates based on title
	const uniqueStudies = allStudies.filter((study, index, self) =>
		index === self.findIndex((s) => s.title.toLowerCase() === study.title.toLowerCase())
	);

	return uniqueStudies;
}

async function searchArxiv(query: string, maxResults: number): Promise<ResearchStudy[]> {
	const encodedQuery = encodeURIComponent(query);
	const url = `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=${maxResults}`;

	try {
		const response = await requestUrl({ url });
		const xmlText = response.text;

		// Parse XML response
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
		const entries = xmlDoc.querySelectorAll('entry');

		const studies: ResearchStudy[] = [];

		entries.forEach((entry) => {
			const title = entry.querySelector('title')?.textContent?.trim() || 'No title';
			const summary = entry.querySelector('summary')?.textContent?.trim() || 'No abstract available';
			const published = entry.querySelector('published')?.textContent?.trim() || '';
			const id = entry.querySelector('id')?.textContent?.trim() || '';

			const authors: string[] = [];
			entry.querySelectorAll('author name').forEach(author => {
				const name = author.textContent?.trim();
				if (name) authors.push(name);
			});

			// Extract arXiv ID from URL
			const arxivId = id.split('/').pop() || '';

			studies.push({
				title: title.replace(/\s+/g, ' '),
				authors,
				abstract: summary.replace(/\s+/g, ' '),
				url: id,
				publishDate: published.split('T')[0],
				source: 'arxiv',
				arxivId
			});
		});

		return studies;
	} catch (error) {
		console.error('Error searching arXiv:', error);
		return [];
	}
}

async function searchPubMed(query: string, maxResults: number, email?: string): Promise<ResearchStudy[]> {
	const encodedQuery = encodeURIComponent(query);
	const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';

	try {
		// Step 1: Search for IDs
		const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmax=${maxResults}&retmode=json${emailParam}`;
		const searchResponse = await requestUrl({ url: searchUrl });
		const searchData = JSON.parse(searchResponse.text);

		const ids = searchData.esearchresult?.idlist || [];
		if (ids.length === 0) return [];

		// Step 2: Fetch details for IDs
		const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml${emailParam}`;
		const fetchResponse = await requestUrl({ url: fetchUrl });
		const xmlText = fetchResponse.text;

		// Parse XML response
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
		const articles = xmlDoc.querySelectorAll('PubmedArticle');

		const studies: ResearchStudy[] = [];

		articles.forEach((article) => {
			const titleEl = article.querySelector('ArticleTitle');
			const title = titleEl?.textContent?.trim() || 'No title';

			const abstractEl = article.querySelector('AbstractText');
			const abstract = abstractEl?.textContent?.trim() || 'No abstract available';

			const pmid = article.querySelector('PMID')?.textContent?.trim() || '';

			const authors: string[] = [];
			article.querySelectorAll('Author').forEach(author => {
				const lastName = author.querySelector('LastName')?.textContent?.trim();
				const foreName = author.querySelector('ForeName')?.textContent?.trim();
				if (lastName && foreName) {
					authors.push(`${foreName} ${lastName}`);
				}
			});

			const pubDate = article.querySelector('PubDate Year')?.textContent?.trim() || '';

			const doiEl = article.querySelector('ArticleId[IdType="doi"]');
			const doi = doiEl?.textContent?.trim() || '';

			studies.push({
				title,
				authors,
				abstract,
				url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
				publishDate: pubDate,
				source: 'pubmed',
				pmid,
				doi
			});
		});

		return studies;
	} catch (error) {
		console.error('Error searching PubMed:', error);
		return [];
	}
}

async function searchSemanticScholar(query: string, maxResults: number, apiKey?: string): Promise<ResearchStudy[]> {
	const encodedQuery = encodeURIComponent(query);
	const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=${maxResults}&fields=title,authors,abstract,url,year,externalIds`;

	const headers: Record<string, string> = {};
	if (apiKey) {
		headers['x-api-key'] = apiKey;
	}

	try {
		const response = await requestUrl({
			url,
			headers
		});
		const data = JSON.parse(response.text);

		const studies: ResearchStudy[] = [];

		if (data.data) {
			data.data.forEach((paper: any) => {
				const authors = paper.authors?.map((a: any) => a.name) || [];

				studies.push({
					title: paper.title || 'No title',
					authors,
					abstract: paper.abstract || 'No abstract available',
					url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
					publishDate: paper.year ? String(paper.year) : 'Unknown',
					source: 'semantic-scholar',
					doi: paper.externalIds?.DOI,
					arxivId: paper.externalIds?.ArXiv
				});
			});
		}

		return studies;
	} catch (error) {
		console.error('Error searching Semantic Scholar:', error);
		return [];
	}
}
