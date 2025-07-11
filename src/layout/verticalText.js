// src/app2/layout/verticalText.js

const punctuation = ['、', '。'];
const smallKana = ['ぁ','ぃ','ぅ','ぇ','ぉ','っ','ゃ','ゅ','ょ','ァ','ィ','ゥ','ェ','ォ','ッ','ャ','ュ','ョ'];

/**
 * 縦書き中の文字の表示位置（X, Y）を計算する
 * @param {Object} args
 * @param {string} args.char - 対象文字
 * @param {number} args.i - 行番号（node index）
 * @param {number} args.j - 文字番号（char index）
 * @param {number} args.charGap - 縦方向の1文字分の間隔
 * @returns {{x: number, y: number}}
 */
export function computeVerticalCharPosition({ char, index, charGap }) {
  const isPunctuation = punctuation.includes(char);
  const isSmallKana = smallKana.includes(char);

  const xBase = 0;
  const xOffset = isPunctuation
    ? charGap * 0.5
    : isSmallKana
    ? charGap * 0
    : 0;
    
  const yBase = -index * charGap;
  const yOffset = isPunctuation
    ? charGap * -0.5
    : isSmallKana
    ? charGap * -0.15
    : 0;
    

  const x = xBase + xOffset;
  const y = yBase - yOffset;

  return { x, y };
}
