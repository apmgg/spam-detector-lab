// CI에서 실행되는 테스트: 정확도가 기준 미만이면 실패 -> 배포가 중단된다.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { tokenize, train, predict, evaluate } = require('../classifier');

const MIN_ACCURACY = 0.85; // 이 값 미만이면 배포 차단

const root = path.join(__dirname, '..');
const trainData = JSON.parse(fs.readFileSync(path.join(root, 'data', 'train.json'), 'utf8'));
const testData = JSON.parse(fs.readFileSync(path.join(root, 'data', 'test.json'), 'utf8'));

test('tokenize: 특수문자를 제거하고 단어를 나눈다', () => {
  const tokens = tokenize('[광고] 무료 쿠폰!');
  assert.ok(tokens.includes('광고'));
  assert.ok(tokens.includes('무료'));
  assert.ok(tokens.includes('쿠폰'));
});

test('train: 클래스별 문서 수를 센다', () => {
  const model = train([
    { text: '무료 쿠폰', label: 'spam' },
    { text: '내일 만나자', label: 'ham' },
  ]);
  assert.strictEqual(model.docCount.spam, 1);
  assert.strictEqual(model.docCount.ham, 1);
});

test('train: 잘못된 label 은 에러', () => {
  assert.throws(() => train([{ text: 'a', label: 'etc' }]));
});

test('predict: 확률은 0~1 사이', () => {
  const model = train(trainData);
  const { spamProbability } = predict(model, '무료 쿠폰 당첨');
  assert.ok(spamProbability >= 0 && spamProbability <= 1);
});

test('model.json 이 최신 학습 데이터와 일치한다', () => {
  const saved = JSON.parse(fs.readFileSync(path.join(root, 'model.json'), 'utf8'));
  const fresh = train(trainData);
  assert.strictEqual(saved.docCount.spam, fresh.docCount.spam);
  assert.strictEqual(saved.docCount.ham, fresh.docCount.ham);
  assert.strictEqual(saved.vocabSize, fresh.vocabSize);
});

test(`테스트 정확도가 ${MIN_ACCURACY * 100}% 이상이어야 한다`, () => {
  const model = JSON.parse(fs.readFileSync(path.join(root, 'model.json'), 'utf8'));
  const result = evaluate(model, testData);
  console.log(`정확도 ${(result.accuracy * 100).toFixed(1)}% (${result.correct}/${result.total})`);
  assert.ok(
    result.accuracy >= MIN_ACCURACY,
    `정확도 ${(result.accuracy * 100).toFixed(1)}% 가 기준 ${MIN_ACCURACY * 100}% 미만`
  );
});
