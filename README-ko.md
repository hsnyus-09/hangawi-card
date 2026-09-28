# Hangawi Card

한가위 인사말을 SVG 카드로 만드는 TypeScript 패키지입니다. 웹 스튜디오와 Node.js CLI에서는 SVG·PNG로 저장할 수 있습니다.

## 빠른 시작

Node.js 22 LTS(22.12 이상)를 사용합니다.

```bash
npm ci
npm run dev
```

웹 스튜디오는 기본적으로 `http://127.0.0.1:5178`에서 열립니다.

## CLI

```bash
npm run build
node dist/cli/index.js --to "부모님" --from "우리" --message "풍요로운 한가위 보내세요" --theme coral --format svg --output card.svg
node dist/cli/index.js --to "부모님" --from "우리" --message "풍요로운 한가위 보내세요" --theme pine --format png --output card.png
```

지원 옵션은 `--to`, `--from`, `--message`, `--theme`, `--template`, `--format svg|png`, `--output`, `--font-file`, `--help`입니다.

PNG 출력은 `@resvg/resvg-js`로 렌더링합니다. 한국어 출력에는 한글을 지원하는 시스템 폰트가 필요합니다.

시스템에 한글 폰트가 없으면 PNG 렌더링에 사용할 폰트를 직접 전달합니다.

```bash
node dist/cli/index.js --to "가족" --from "나" --message "밝은 한가위" --format png --font-file /path/to/NotoSansCJKkr-Regular.otf --output card.png
```

## API

```ts
import { createHangawiCard, listHangawiTemplates, listHangawiThemes } from "hangawi-card";

const card = createHangawiCard({
  to: "소중한 사람",
  from: "우리 가족",
  message: "밝은 보름달처럼 넉넉하고 따뜻한 한가위 보내세요.",
  template: "lunar",
  theme: "coral"
});

console.log(card.svg);
console.log(listHangawiTemplates());
console.log(Object.keys(listHangawiThemes()));
```

`createHangawiCard()`는 SVG 문자열, 카드 크기, 제목, 템플릿, 테마를 반환합니다.

| 옵션 | 값 |
| --- | --- |
| `to` | 받는 분. 필수이며 최대 28자입니다. |
| `from` | 보내는 분. 필수이며 최대 28자입니다. |
| `message` | 인사말. 필수이며 최대 180자, 렌더링 기준 최대 5줄입니다. |
| `template` | `lunar`, `paper`, `botanical`, `modern`. 기본값은 `lunar`입니다. |
| `theme` | `coral`, `persimmon`, `pine`, `ink`, 또는 사용자 지정 테마 객체 |
| `title` | 카드 제목. 기본값은 `풍요로운 한가위`이며 최대 20자입니다. |

사용자 텍스트는 XML 이스케이프 처리합니다. XML에서 허용하지 않는 제어 문자는 제거하고 짝이 없는 서로게이트는 대체 문자로 바꿉니다. 사용자 지정 테마의 색상은 `#rrggbb` 형식만 허용합니다.

## 빌드와 배포

```bash
npm run build
npm run preview
```

정적 호스팅에는 `dist/site/`의 내용만 올립니다. 라이브러리와 CLI는 각각 `dist/lib/`, `dist/cli/`에 생성됩니다.

`npm pack`은 라이브러리를 빌드하고 `.tgz` 패키지를 만듭니다.

```bash
npm pack
```

## 테스트

처음 브라우저 테스트를 실행하기 전에 Chromium을 설치합니다.

```bash
npx playwright install chromium
npm run check
```

`npm run check`에 브라우저 테스트와 패키지 설치 검사가 포함됩니다. 패키지 검사는 API, CLI, SVG·PNG 출력, 타입 선언을 확인합니다.

## 문서

[기여 안내](CONTRIBUTING.md) · [보안 정책](SECURITY.md) · [변경 기록](CHANGELOG.md) · [라이선스](LICENSE)
