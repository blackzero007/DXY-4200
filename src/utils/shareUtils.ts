import html2canvas from 'html2canvas';
import { copyToClipboard } from './helpers';
import type { ShareCardData } from '@/components/game/ShareCard';

export async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
  });
}

export async function downloadCardAsImage(element: HTMLElement, filename?: string): Promise<boolean> {
  try {
    const canvas = await captureElement(element);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    link.download = filename || `脑洞大开战绩_${dateStr}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to download image:', error);
    return false;
  }
}

export async function copyCardImageToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await captureElement(element);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });
    
    if (navigator.clipboard && window.ClipboardItem) {
      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    const success = await copyToClipboard(dataUrl);
    return success;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return false;
  }
}

export function generateShareText(data: ShareCardData): string {
  const modeLabels = {
    solo: '单人模式',
    room: '对战模式',
    daily: '每日挑战',
  };
  
  const lines = [
    '🎮 脑洞大开 · 花式接词',
    `🏆 ${modeLabels[data.mode]} 战绩`,
    '',
    `👤 玩家: ${data.playerName}`,
    `🔗 词链长度: ${data.chainLength} 个词`,
    `⭐ 总得分: ${data.score} 分`,
  ];
  
  if (data.highlightWords.length > 0) {
    lines.push('', '💡 亮点词汇:');
    data.highlightWords.forEach(word => {
      lines.push(`  ✨ ${word}`);
    });
  }
  
  lines.push('', '🎯 来「脑洞大开花式接词」挑战我吧！');
  
  return lines.join('\n');
}

export async function copyShareTextToClipboard(data: ShareCardData): Promise<boolean> {
  const text = generateShareText(data);
  return copyToClipboard(text);
}
