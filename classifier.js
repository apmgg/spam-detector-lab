// 나이브 베이즈 스팸 분류기 (외부 라이브러리 없음)
// 브라우저(app.js)와 Node(train.js, 테스트)에서 같은 코드를 사용한다.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Classifier = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const LABELS = ['spam', 'ham'];

  // 공백/특수문자 기준으로 단어를 나누고,
  // 한국어 조사 때문에 단어가 달라지는 문제를 줄이기 위해 글자 2개 단위(#)도 함께 쓴다.
  function tokenize(text) {
    const words = String(text)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}%]+/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const tokens = [];
    for (const word of words) {
      tokens.push(word);
      const chars = Array.from(word);
      for (let i = 0; i < chars.length - 1; i++) {
        tokens.push('#' + chars[i] + chars[i + 1]);
      }
    }
    return tokens;
  }

  // data: [{ text, label }] -> 모델(JSON으로 저장 가능한 객체)
  function train(data) {
    const model = {
      docCount: { spam: 0, ham: 0 },
      wordCount: { spam: {}, ham: {} },
      totalWords: { spam: 0, ham: 0 },
      vocabSize: 0,
    };
    const vocab = new Set();

    for (const { text, label } of data) {
      if (!LABELS.includes(label)) {
        throw new Error('알 수 없는 label: ' + label);
      }
      model.docCount[label] += 1;
      for (const token of tokenize(text)) {
        model.wordCount[label][token] = (model.wordCount[label][token] || 0) + 1;
        model.totalWords[label] += 1;
        vocab.add(token);
      }
    }
    model.vocabSize = vocab.size;
    return model;
  }

  // 클래스별 로그 확률 (라플라스 스무딩 적용)
  function logScore(model, label, tokens) {
    const totalDocs = model.docCount.spam + model.docCount.ham;
    let score = Math.log(model.docCount[label] / totalDocs);
    const denom = model.totalWords[label] + model.vocabSize;
    for (const token of tokens) {
      const count = model.wordCount[label][token] || 0;
      score += Math.log((count + 1) / denom);
    }
    return score;
  }

  function predict(model, text) {
    const tokens = tokenize(text);
    const spamScore = logScore(model, 'spam', tokens);
    const hamScore = logScore(model, 'ham', tokens);

    // 두 로그 점수의 차이를 0~1 확률로 변환
    const diff = hamScore - spamScore;
    const spamProbability = 1 / (1 + Math.exp(diff));

    // 단어(# 제외)별로 스팸/정상 쪽으로 얼마나 기여했는지 계산
    const denomSpam = model.totalWords.spam + model.vocabSize;
    const denomHam = model.totalWords.ham + model.vocabSize;
    const seen = new Set();
    const contributions = [];
    for (const token of tokens) {
      if (token.startsWith('#') || seen.has(token)) continue;
      seen.add(token);
      const pSpam = ((model.wordCount.spam[token] || 0) + 1) / denomSpam;
      const pHam = ((model.wordCount.ham[token] || 0) + 1) / denomHam;
      contributions.push({ word: token, weight: Math.log(pSpam / pHam) });
    }
    contributions.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

    return {
      label: spamProbability >= 0.5 ? 'spam' : 'ham',
      spamProbability,
      contributions,
    };
  }

  function evaluate(model, data) {
    let correct = 0;
    const wrong = [];
    for (const item of data) {
      const result = predict(model, item.text);
      if (result.label === item.label) {
        correct += 1;
      } else {
        wrong.push({ text: item.text, expected: item.label, got: result.label });
      }
    }
    return { accuracy: correct / data.length, correct, total: data.length, wrong };
  }

  return { tokenize, train, predict, evaluate };
});
