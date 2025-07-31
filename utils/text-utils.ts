export function addMeaningfulBreaks(text: string): string {
  // 구두점 뒤에 줄바꿈 추가
  return text
    .replace(/,\s+/g, ',<br/>') // 쉼표 뒤
    .replace(/\.\s+/g, '.<br/>') // 마침표 뒤  
    .replace(/!\s+/g, '!<br/>') // 느낌표 뒤
    .replace(/\?\s+/g, '?<br/>') // 물음표 뒤
    .replace(/:\s+/g, ':<br/>') // 콜론 뒤
    .replace(/;\s+/g, ';<br/>') // 세미콜론 뒤
}