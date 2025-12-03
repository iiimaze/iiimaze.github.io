# 🧪 K Creator Toolbox

> **브라우저만으로 고급 이미징 워크플로우를 완성**하는 실험실.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com)

**Live**

- [**file Renamer**](https://iiimaze.github.io/file-renamer/)
- [**ZIF**](https://videotogif.github.io/)

## 개요

**K Creator Toolbox**는 서버 업로드 없는(Zero‑Upload) 브라우저 기반 미디어 도구를 만듭니다. 모든 처리는 클라이언트에서 수행되며, 개인 정보와 저작권이 브라우저 밖으로 나가지 않습니다. 현재 2가지 서비스를 제공합니다.

- **1) File Renamer** — 이미지 파일명을 대량으로 일관성 있게 바꾸고, ZIP/개별로 내려받는 도구
- **2) ZIF (Zero‑Infra GIF Creator)** — 동영상을 웹에서 실사용 가능한 트루컬러에 가까운 고품질 GIF로 변환하는 도구

두 서비스 모두 **HTML5 File API**, **Blob/Object URL**, **Web Worker**, 그리고 필요 시 WebAssembly(FFmpeg.wasm / gifski‑wasm 등)를 활용합니다.

---

## 🔧 서비스 1: File Renamer

> 프라이버시 보장! 업로드 없이 **브라우저에서 즉시** 처리되는 이미지 파일명 일괄 변경 도구.

### 주요 기능

- **다중 파일 선택**: Drag\&Drop 또는 파일 선택창으로 수백 장도 한 번에
- **실시간 미리보기**: 변경될 파일명과 썸네일 확인
- **자동 번호 & 패딩**: `PREFIX_001`, `PREFIX_002` … (고정 폭 패딩)
- **다운로드 2모드**

  - **ZIP 다운로드**: 브라우저 메모리 상에서 압축 후 단일 파일로 저장
  - **개별 다운로드**: `download` 속성이 있는 가짜 `<a>`를 생성 → `click()`으로 순차 저장 (기본 500ms 인터벌로 안정성 확보)

- **지원 포맷**: JPG/JPEG, PNG, GIF, WebP, HEIC _(브라우저/OS 코덱 지원에 따라 미리보기 제한 가능)_

### 동작 원리 (개발 관점)

- **파일 접근**: HTML5 File API로 `FileList`를 수집 → `File` → `Blob`으로 그대로 유지 (픽셀/EXIF **불변**, _이 도구는 “이름만” 바꿈_)
- **리네이밍 규칙 엔진**: 접두어 + 0‑패딩 인덱스 + 원본 확장자 → 유니코드 **NFC 정규화**로 iOS/Safari에서의 한글 파일명 문제 완화
- **메모리 관리**: 미리보기는 `URL.createObjectURL()` 사용, 사용 후 \*\*`URL.revokeObjectURL()`\*\*로 해제
- **ZIP 생성**: 클라이언트 사이드 ZIP 라이브러리(예: JSZip) 또는 Web Streams API를 이용해 메모리 내에서 압축
- **개별 저장 시 간격 제어**: `await new Promise(r => setTimeout(r, 500))` 패턴으로 브라우저 디스크 I/O 버스트를 방지

### 보안/프라이버시

- **Zero‑Upload**: 파일은 네트워크로 전송되지 않음, 타사 API 호출 없음
- **CSP 권장**: `default-src 'self'`를 기본으로, 필요 최소 출처만 허용
- **입력 검증**: 확장자 화이트리스트 & 파일 크기 상한 권장
- **XSS 예방**: 텍스트/속성 기반 DOM 조작, innerHTML 지양

### 성능 팁

- **대용량(100MB+)** 다중 처리 시 브라우저 메모리 압력이 큽니다 → 여러 묶음으로 나눠 처리 or ZIP 모드 권장
- 모바일은 저장 제약이 있을 수 있으므로 **개별 다운로드**가 더 안정적일 때가 있음

### 한계/이슈

- HEIC 미리보기는 플랫폼 코덱 의존
- iOS Safari에서 일부 한글 파일명 인코딩 이슈

---

## 🎨 서비스 2: ZIF

> 브라우저에서 동영상 파일을 고품질(트루컬러에 근접) GIF를 만드는 도구.
> 현재 PC 버전 최적화 입니다. 아이폰 크롬에서는 이슈가 있습니다...

### 목표

- 웹에서 **실사용 가능한 품질**의 GIF를, **서버 없이** 만들기
- 고품질을 위해 **팔레트 생성/양자화/디더링/타임라인 최적화**를 통합

### 파이프라인 (개발 관점)

1. **입력 디코딩**

   - 정지 이미지 시퀀스 또는 동영상 → **FFmpeg.wasm**으로 디코딩
   - FPS/구간 컷/리사이즈 옵션 반영 (zscale 사용 시 정확한 컬러 공간/감마 처리 가능)

2. **색역/스케일 변환**

   - `yuv420p` → `rgb24` 변환, 필요 시 **zscale**로 리사이즈/색공간 정합

3. **팔레트 전략** (두 가지 백엔드)

   - **FFmpeg 팔레트경로**: `palettegen` → `paletteuse` (_전통적, 빠름_)
   - **gifski‑wasm 경로**: 프레임 단위 **고급 양자화 + 시간적 디더링**으로 **수천 색상에 근접한 시각적 품질** 구현

4. **프레임 합성 & 최적화**

   - 델타 인코딩/최소 변경 영역 추출로 용량 절감
   - **disposal method**/loop count 등을 메타에 반영

5. **출력**

   - 완성된 GIF를 Blob으로 생성 → 다운로드 (또는 즉시 `<img>`/`<video>` 미리보기)

> GIF 포맷은 **프레임 단위 최대 256색 팔레트**를 갖습니다. ZIF는 프레임 경계와 디더링을 활용해 체감 색 수를 높입니다(특히 **시간적 디더링**). 결과적으로 “트루컬러에 가까운” 시각적 인상을 제공합니다.

### 핵심 옵션

- **해상도/스케일러**: Lanczos/Bicubic 등 선택 (zscale 사용 시)
- **FPS/타임 트리밍**: 구간 선택, target FPS 재샘플링
- **양자화/디더링**: palettegen vs. gifski 백엔드 선택, 디더 강도
- **용량 최적화**: 최소 변경 영역, 반복 루프, 색상 수 제한

### 성능/리소스 고려

- 대규모 프레임 버퍼는 **Web Worker + transferable objects**로 메인 스레드 정체를 최소화
- iOS/Safari는 **PThreads/SharedArrayBuffer** 제약이 있으므로 워커 병렬화/타일 크기를 다르게 튜닝
- 메모리 상한을 고려해 **스트리밍 처리**(프레임 배치 단위) 권장

### 보안/프라이버시

- **Zero‑Upload**: 디코딩/양자화/인코딩 전 과정이 브라우저 내부에서 수행
- 외부 네트워크 호출 없음, 분석 스크립트 없음

---

## 🛡️ 공통 보안 모델 (Threat Model 요약)

- 공격면 최소화: 정적 호스팅 + 강한 **CSP** + SRI(Subresource Integrity) 권장
- 입력 데이터는 사용자 로컬에서만 머무름 (업로드/저장소 사용 없음)
- 워커/모듈 로딩 출처를 고정, `eval`/동적 스크립트 주입 금지

---

## 🧑‍💻 개발 가이드

```bash
# 1) 저장소 클론
# (각 서비스 저장소/브랜치 구조에 맞게 조정)

# 2) 로컬 미리보기 (예: Vite 또는 간단한 정적 서버)
# Vite 예시
npm i
npm run dev

# 정적 서버 예시 (Python)
python3 -m http.server 8080

# 3) 브라우저 접속: http://localhost:8080
```

**권장 설정**

- TypeScript + ESM 모듈
- Web Worker로 CPU 집약 처리 오프로딩
- 대용량 Blob 처리를 위한 **스트리밍/청크 설계**
- i18n(Navigator language 감지) 및 폴백 폰트 전략

---

## 🗺️ 로드맵

- File Renamer: 사용자 정의 패턴(`{prefix}_{date:YYYYMMDD}_{index:000}`), 시작 번호/증가 간격, EXIF 기반 리네이밍
- ZIF: 타임라인 에디터(구간/프레임 조절), 품질 사전(Q1\~Q5), H.264→GIF 직관 파이프라인, PWA 오프라인 모드

---

## 🐛 이슈 제보

- Issues 등록: [iiimaze.github.io/issues](https://github.com/iiimaze/iiimaze.github.io/issues)
- 버그 재현 정보(브라우저/OS/스크린샷/콘솔 로그), 기대/실제 동작을 상세히 적어주세요.
- PR은 작은 단위로, 테스트/샘플 입력과 함께 올려주세요.

---

## 📄 라이선스

- MIT License
