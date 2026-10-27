// 화면 동작: model.json 을 불러와 입력한 문자를 판독한다.
let model = null;

const $ = (id) => document.getElementById(id);
const input = $('input');
const resultBox = $('result');

async function loadModel() {
  try {
    const res = await fetch('model.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    model = await res.json();
    $('model-info').textContent =
      `모델 v${model.version} · 학습 데이터 ${model.trainedOn}개 · 단어 ${model.vocabSize}종`;
  } catch (err) {
    $('model-info').textContent = '모델을 불러오지 못했습니다. (' + err.message + ')';
  }
}

function render(result) {
  const isSpam = result.label === 'spam';
  const verdict = $('verdict');
  verdict.textContent = isSpam ? '🚨 스팸으로 판단됩니다' : '✅ 정상 문자로 판단됩니다';
  verdict.className = 'verdict ' + result.label;

  const pct = result.spamProbability * 100;
  $('bar-fill').style.width = pct.toFixed(1) + '%';
  $('prob').textContent = `스팸 확률 ${pct.toFixed(1)}%`;

  // 판단에 크게 기여한 단어 상위 6개
  const top = result.contributions.slice(0, 6);
  const reasons = $('reasons');
  reasons.innerHTML = '';
  if (top.length) {
    const title = document.createElement('h2');
    title.textContent = '판단에 영향을 준 단어';
    reasons.appendChild(title);
    for (const c of top) {
      const tag = document.createElement('span');
      tag.className = 'tag ' + (c.weight > 0 ? 'spam' : 'ham');
      tag.textContent = c.word;
      reasons.appendChild(tag);
    }
  }
  resultBox.classList.remove('hidden');
}

$('check').addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  if (!model) { alert('모델이 아직 로드되지 않았습니다.'); return; }
  render(Classifier.predict(model, text));
});

$('clear').addEventListener('click', () => {
  input.value = '';
  resultBox.classList.add('hidden');
  input.focus();
});

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.text;
    $('check').click();
  });
});

loadModel();
