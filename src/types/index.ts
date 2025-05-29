export interface TermDefinition {
  id?: string;
  term: string;
  purpose: string;
  why: string[];
  example: string;
  code: string;
  summary: string;
  createdAt?: string;
  moderated?: boolean;
  suggested?: boolean;
}

export interface SearchResult {
  item: TermDefinition;
  refIndex: number;
  score?: number;
}

export interface BookmarkItem {
  id: string;
  term: string;
  addedAt: string;
}