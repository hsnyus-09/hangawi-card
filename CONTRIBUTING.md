# Contributing

## 개발

```bash
npm ci
npm run dev
```

## 제출 전 확인

```bash
npx playwright install chromium
npm run check
```

## 변경 기준

- 사용자 입력은 기존 `normalizeText()`, `escapeXml()`, `wrapText()`를 거쳐야 합니다.
- 새 템플릿이나 테마를 추가하면 타입, 입력 검사, 스튜디오, README를 함께 갱신합니다.
- CLI를 바꾸면 `--help`, SVG·PNG 출력, 오류 종료 코드를 확인합니다.
- 한국어 줄바꿈과 긴 문구를 단위 테스트와 브라우저 테스트에서 확인합니다.

변경 범위와 실행한 테스트를 PR에 적어 주세요. 동작이 바뀌면 테스트와 문서도 함께 수정합니다.
