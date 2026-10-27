# 스팸 문자 판독기 (Homework 2)

순수 HTML/CSS/JS와 직접 구현한 나이브 베이즈로 만든 스팸 문자 판독기입니다.
외부 API와 라이브러리를 쓰지 않습니다.

## 구조

| 파일 | 역할 |
| --- | --- |
| `index.html`, `style.css`, `app.js` | 웹 화면 |
| `classifier.js` | 나이브 베이즈 분류기 (브라우저·Node 공용) |
| `train.js` | `data/train.json` 으로 학습해 `model.json` 생성 |
| `data/train.json`, `data/test.json` | 학습/테스트 데이터 |
| `test/classifier.test.js` | 단위 테스트 + 정확도 기준 검사 |
| `.github/workflows/deploy.yml` | CI/CD (재학습 → 테스트 → GitHub Pages 배포) |

## 실행

```bash
node train.js                  # 재학습 (model.json 갱신)
node --test                    # 테스트
python -m http.server 8000     # 로컬 서버 실행 (Windows: py -m http.server 8000)
```

서버를 켠 뒤 브라우저에서 <http://localhost:8000/index.html> 로 접속합니다. (종료: Ctrl+C)

`index.html` 을 더블클릭해서 열면 `model.json` 을 불러오지 못하므로 반드시 서버로 여세요.
브라우저를 자동으로 열고 싶으면 `python serve.py` 를 써도 됩니다.

## DevOps 흐름

1. 새 스팸 수법 데이터를 `data/train.json` 에 추가
2. `package.json` 의 `version` 올리고 `node train.js` 로 재학습
3. `git push` → GitHub Actions 가 재학습·테스트 실행
4. 테스트 정확도가 85% 미만이면 **배포 중단**, 통과하면 GitHub Pages 자동 배포
5. `git tag v1.0.0` 처럼 버전 태그

## 버전

- v1.0.0: 학습 데이터 40개, 스팸/정상 판정 + 확률 표시
- v1.1.0: 정상 서비스 알림("구매 안내" 등)이 스팸으로 오분류되는 문제 발견 → 학습 데이터 62개로 확장, 회귀 테스트 추가