import { useMemo } from 'react';
import type { ChainWord } from '@/types';

export interface ChainStats {
  totalWords: number;
  avgLength: number;
  longestWord: string;
  shortestWord: string;
  playerContributions: { authorId: string; authorName: string; authorColor: string; count: number; ratio: number }[];
}

export function useChainStats(chain: ChainWord[]): ChainStats {
  return useMemo(() => {
    if (chain.length === 0) {
      return {
        totalWords: 0,
        avgLength: 0,
        longestWord: '—',
        shortestWord: '—',
        playerContributions: [],
      };
    }

    const totalWords = chain.length;
    const totalChars = chain.reduce((sum, cw) => sum + cw.word.length, 0);
    const avgLength = Math.round((totalChars / totalWords) * 10) / 10;

    let longestWord = chain[0].word;
    let shortestWord = chain[0].word;
    for (const cw of chain) {
      if (cw.word.length > longestWord.length) longestWord = cw.word;
      if (cw.word.length < shortestWord.length) shortestWord = cw.word;
    }

    const contributionMap = new Map<string, { authorName: string; authorColor: string; count: number }>();
    for (const cw of chain) {
      const existing = contributionMap.get(cw.authorId);
      if (existing) {
        existing.count += 1;
      } else {
        contributionMap.set(cw.authorId, { authorName: cw.authorName, authorColor: cw.authorColor, count: 1 });
      }
    }

    const playerContributions = Array.from(contributionMap.entries())
      .map(([authorId, data]) => ({
        authorId,
        authorName: data.authorName,
        authorColor: data.authorColor,
        count: data.count,
        ratio: Math.round((data.count / totalWords) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return { totalWords, avgLength, longestWord, shortestWord, playerContributions };
  }, [chain]);
}
