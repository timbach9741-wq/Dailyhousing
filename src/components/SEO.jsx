import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ title, description, url, imageUrl }) {
  return (
    <Helmet>
      {/* 기본 태그 */}
      <title>{title} | 데일리하우징</title>
      <meta name="description" content={description} />
      
      {/* 구글 검색 엔진용 */}
      <meta itemprop="name" content={`${title} | 데일리하우징`} />
      <meta itemprop="description" content={description} />
      {imageUrl && <meta itemprop="image" content={imageUrl} />}

      {/* 오픈 그래프 (카카오톡, 페이스북, 네이버 블로그 등) */}
      <meta property="og:title" content={`${title} | 데일리하우징`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* 표준 URL (중복 문서 방지) */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}

export default SEO;
