---
layout: post
title: "File Renamer 출시 기록.1"
date: 2025-08-25
last_modified_at: 2025-08-27
author: MIL
thumbnail: /assets/img/posts/cover.jpg
categories: [it]
summary: "브라우저 100% 로컬에서 동작하는 파일명 일괄 변경 도구의 시작과 배경, 핵심 기능, 로드맵을 공유합니다."
description: "File Renamer 출시 기록 1편. 브라우저에서 100% 로컬로 실행되는 파일명 일괄 변경 도구의 배경, 핵심 기능, ZIP/개별 다운로드, 메타데이터, EXIF 계획을 정리합니다."
tags:
  [
    "파일명 일괄 변경",
    "파일 이름 일괄 변경",
    "File Renamer",
    "ZIP 다운로드",
    "로컬 실행",
    "EXIF",
  ]
keywords: "파일명 일괄 변경, 파일 이름 일괄 변경, File Renamer, ZIP 다운로드, 로컬 실행, EXIF"
comments: true
toc: true
---

<!-- 본문(이 포스트에만) 리스트/노트 스타일: 1편과 동일하게 통일 -->
<style>
  .post .post-content ul,.post .post-content ol{margin:.5rem 0 1rem;padding-left:1.25rem}
  .post .post-content ul{list-style:none;padding-left:0}
  .post .post-content ul li{position:relative;padding-left:1.25rem;margin:.35rem 0;line-height:1.75}
  .post .post-content ul li::before{content:"";position:absolute;left:0;top:.7em;width:.5rem;height:.5rem;border-radius:50%;background:#f6ab7a;box-shadow:0 0 0 2px rgba(246,171,122,.15)}
  .post .post-content li>ul{margin-top:.3rem}
  .post .post-content li>ul li::before{width:.45rem;height:.45rem;top:.75em;opacity:.9}
  .post .post-content ol{list-style:decimal;padding-left:1.25rem}
  .post .post-content ol li{margin:.35rem 0;line-height:1.75}
  .post .note{border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:12px 14px;margin:12px 0}
</style>

> 블로그/쇼핑몰 운영을 하다 보면 **이미지 파일명 일괄 변경**이 꼭 필요할 때가 있습니다.  
> 데스크톱 설치 없이, **100% 로컬 실행**으로 개인정보 걱정 없이 빠르게 정리하는 **File Renamer**의 첫 번째 기록입니다.  
> 👉 [파일명 일괄 변경기 바로 사용하기](/file-renamer.html)

## 왜 만들었나

### 프라이버시 중심의 파일명 일괄 변경

- **서버 업로드 없음**: 브라우저 내부에서만 처리 → 민감 파일도 안심.
- 네트워크 지연/전송 실패 제거, 사용 흐름 단순화.

### 설치 없이 즉시 사용

- 별도 설치/권한 불필요 → 링크만 열면 바로 **파일명 일괄 변경** 진행.
- 다양한 OS/브라우저에서 동일한 UX.

<div class="note">📝 <strong>팁</strong> — 이미지 업로드 전, 파일명을 <code>키워드_001.jpg</code>처럼 규칙화하면 관리/노출 전략에 유리합니다.</div>

## 핵심 기능

### 접두어+번호 패턴으로 파일명 일괄 변경

- `문서_001` 형식처럼 **파일 이름 일괄 변경**을 원클릭으로 적용.
- 자주 쓰는 프리셋(`문서_`, `사진_`, `backup_`) 버튼 제공.

### 메타데이터 옵션

- 생성일/수정일 메타데이터 수정(로드맵 단계 베타).
- 진행률 표시와 예시 프리뷰로 실수 방지.

### 작업 편의: 드래그&드롭 · ZIP/개별 다운로드

- 여러 파일을 드래그&드롭으로 추가.
- 결과물을 ZIP 한 번에 받거나, **개별 파일**로 저장 가능.

## 앞으로의 로드맵

### 규칙 커스터마이징

- 날짜/UUID/정규식 등 세부 규칙으로 **파일명 일괄 변경** 고도화.
- 중복 방지, 0-padding, 대소문자/공백 규칙 등 옵션화.

### EXIF 기반 자동 이름 붙이기

- 사진의 촬영일/기종 등 EXIF를 읽어 **파일 이름 일괄 변경** 자동화.

### 클라우드 스토리지 연동

- 로컬 우선 원칙 유지하되, 선택적으로 NCP/Drive/S3 등과 연동 옵션 검토.

---

### 참고 & 링크

- 사용 가이드: [File Renamer 소개](/file-renamer-intro.html)
- 바로 실행: [파일명 일괄 변경기](/file-renamer.html)

{% comment %}
키워드 메모(비노출): 본문/헤딩에 “파일명 일괄 변경 / 파일 이름 일괄 변경 / File Renamer”를 5회 이상 자연 분산.
{% endcomment %}
