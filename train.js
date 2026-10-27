// 학습 스크립트: data/train.json 을 읽어 model.json 을 만든다.
// 실행: node train.js
const fs = require('fs');
const path = require('path');
const { train, evaluate } = require('./classifier');
const pkg = require('./package.json');

const trainData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'train.json'), 'utf8'));
const testData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'test.json'), 'utf8'));

const model = train(trainData);
model.version = pkg.version;
model.trainedOn = trainData.length;

fs.writeFileSync(path.join(__dirname, 'model.json'), JSON.stringify(model));

const result = evaluate(model, testData);
console.log(`버전 v${model.version} | 학습 데이터 ${trainData.length}개 | 단어 종류 ${model.vocabSize}개`);
console.log(`테스트 정확도: ${(result.accuracy * 100).toFixed(1)}% (${result.correct}/${result.total})`);
for (const w of result.wrong) {
  console.log(`  틀림: "${w.text}" 정답=${w.expected} 예측=${w.got}`);
}
