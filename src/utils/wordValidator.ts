import type { ChainWord, ValidationResult } from '@/types';
import { getLastChar, getFirstChar, charMatch, containsLastChar } from './wordDatabase';

export interface ValidationOptions {
  minLength?: number;
  allowHomophone?: boolean;
  containsMode?: 'startWith' | 'contains';
}

export function validateWord(
  input: string,
  lastWord: string,
  chain: ChainWord[],
  options: ValidationOptions = {}
): ValidationResult {
  const {
    minLength = 2,
    allowHomophone = true,
    containsMode = 'startWith'
  } = options;

  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, reason: 'empty', message: '请输入一个词' };
  }

  if (trimmed.length < minLength) {
    return {
      valid: false,
      reason: 'too_short',
      message: `至少输入 ${minLength} 个字哦～`
    };
  }

  const lastChar = getLastChar(lastWord);
  const firstChar = getFirstChar(trimmed);

  if (containsMode === 'startWith') {
    if (!charMatch(lastChar, firstChar, allowHomophone)) {
      const homophoneTip = allowHomophone
        ? `（需要以「${lastChar}」或同音字开头`
        : `（需要以「${lastChar}」开头）`;
      return {
        valid: false,
        reason: 'start_mismatch',
        message: `开头不对${homophoneTip}`
      };
    }
  } else {
    if (!containsLastChar(trimmed, lastChar, allowHomophone)) {
      return {
        valid: false,
        reason: 'not_found_last_char',
        message: `需要包含「${lastChar}」或同音字`
      };
    }
  }

  const exists = chain.some(cw => cw.word === trimmed);
  if (exists) {
    return {
      valid: false,
      reason: 'duplicate',
      message: '这个词已经出现过啦，换一个吧！'
    };
  }

  return { valid: true, message: '太棒了！' };
}

export function validateWordOnly(
  input: string,
  chainWords: string[]
): { valid: boolean; message: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, message: '空' };
  if (trimmed.length < 2) return { valid: false, message: '太短' };
  if (chainWords.includes(trimmed)) return { valid: false, message: '重复' };
  return { valid: true, message: 'OK' };
}
