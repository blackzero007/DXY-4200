import { useMemo } from 'react';
import type { ChainWord } from '@/types';

export interface ChainStats {
  totalWords: number;
  avgLength: number;
  longestWord: string;
  shortestWord: string;
  playerContributions: { authorId: string; authorName: string; authorColor: string; count: number; ratio: number }[];
  longestStreak: number;
  longestStreakAuthorId: string | null;
  longestStreakAuthorName: string | null;
  avgResponseTimeMs: number;
  mostCommonFirstChars: { char: string; count: number }[];
  personalContributionRatio: number;
}

export function useChainStats(chain: ChainWord[], playerId?: string): ChainStats {
  return useMemo(() => {
    if (chain.length === 0) {
      return {
        totalWords: 0,
        avgLength: 0,
        longestWord: '—',
        shortestWord: '—',
        playerContributions: [],
        longestStreak: 0,
        longestStreakAuthorId: null,
        longestStreakAuthorName: null,
        avgResponseTimeMs: 0,
        mostCommonFirstChars: [],
        personalContributionRatio: 0,
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

    let longestStreak = 1;
    let longestStreakAuthorId = chain[0].authorId;
    let longestStreakAuthorName = chain[0].authorName;
    let currentStreak = 1;
    let currentAuthor = chain[0].authorId;
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].authorId === currentAuthor && chain[i].authorId !== 'system') {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakAuthorId = chain[i].authorId;
          longestStreakAuthorName = chain[i].authorName;
        }
      } else {
        currentStreak = 1;
        currentAuthor = chain[i].authorId;
      }
    }
    if (longestStreakAuthorId === 'system') {
      longestStreak = 0;
      longestStreakAuthorId = null;
      longestStreakAuthorName = null;
    }

    const responseTimes: number[] = [];
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].authorId !== 'system') {
        responseTimes.push(chain[i].timestamp - chain[i - 1].timestamp);
      }
    }
    const avgResponseTimeMs = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    const firstCharCount = new Map<string, number>();
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].authorId !== 'system' && chain[i].word.length > 0) {
        const firstChar = chain[i].word.charAt(0);
        firstCharCount.set(firstChar, (firstCharCount.get(firstChar) || 0) + 1);
      }
    }
    const mostCommonFirstChars = Array.from(firstCharCount.entries())
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    let personalContributionRatio = 0;
    if (playerId) {
      const playerEntry = playerContributions.find(p => p.authorId === playerId);
      personalContributionRatio = playerEntry ? playerEntry.ratio : 0;
    } else if (playerContributions.length > 0) {
      const nonSystem = playerContributions.find(p => p.authorId !== 'system');
      personalContributionRatio = nonSystem ? nonSystem.ratio : 0;
    }

    return {
      totalWords,
      avgLength,
      longestWord,
      shortestWord,
      playerContributions,
      longestStreak,
      longestStreakAuthorId,
      longestStreakAuthorName,
      avgResponseTimeMs,
      mostCommonFirstChars,
      personalContributionRatio,
    };
  }, [chain, playerId]);
}
