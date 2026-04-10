const fs = require('fs');
let t = fs.readFileSync('src/pages/MobileBusinessCard.jsx', 'utf8');
const start = t.indexOf('  const handleShare = () => {');
const end = t.indexOf('    <div className=\"min-h-screen bg-slate-50');

if (start !== -1 && end !== -1) {
  const newCode = `  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: \`\${profile.company} \${profile.name}\`,
        text: '데일리하우징 모바일 명함',
        url: profile.cardUrl,
      }).catch(console.error);
    } else {
      alert('공유하기를 지원하지 않는 브라우저입니다. URL을 복사해주세요.');
    }
  };

  return (
`;
  t = t.substring(0, start) + newCode + t.substring(end);
  fs.writeFileSync('src/pages/MobileBusinessCard.jsx', t);
  console.log('Replaced successfully');
} else {
  console.log('Target not found', {start, end});
}
