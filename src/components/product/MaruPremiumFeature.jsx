import React from 'react';

// 강마루 프리미엄 합판(강그린와이드) 전용 상세 이미지
const MARU_PREMIUM_IMAGES = [
    "https://octapi.lxzin.com/imageResource/file/202602/11/3be343bf-4a49-4f18-88c2-9800b9ec4180.jpg", // 메인 히어로
    "https://octapi.lxzin.com/imageResource/file/202602/11/476d7008-9741-4546-9682-7e510e171ddb.png", // 아이콘1: 리얼 텍스처
    "https://octapi.lxzin.com/imageResource/file/202602/11/2f44c4be-9847-4431-b46d-c6ead8cfe43d.png", // 아이콘2: 천연 외관
    "https://octapi.lxzin.com/imageResource/file/202602/11/a2774bdc-b7fa-46fe-9bb1-5334732b8714.png", // 아이콘3: Mix&Match
    "https://octapi.lxzin.com/imageResource/file/202602/11/ae6f1d72-29dd-4b7f-8579-20aa84f75d05.jpg", // 구조도 우드165
    "https://octapi.lxzin.com/imageResource/file/202602/11/262ccfd2-28d5-4d30-b9f2-012d11c1200c.jpg", // 구조도 사각600/400
    "https://octapi.lxzin.com/imageResource/file/202602/11/ed77bdde-3058-4f89-bb9e-ed8485d2117c.png", // Super E0 등급
    "https://octapi.lxzin.com/imageResource/file/202602/11/5bfbbed8-cdb2-41c0-a691-a5a29bc49857.jpg", // 천연 외관 구현
    "https://octapi.lxzin.com/imageResource/file/202602/11/1f12a136-fce2-465a-a385-fa3a39ca5174.png", // 인증: 실내표지
    "https://octapi.lxzin.com/imageResource/file/202602/11/433a7594-46b5-4f3e-8894-5533c0899884.png", // 인증: K-BPI
];

function MaruPremiumFeature() {
    return (
        <div style={{ width: '100%', maxWidth: '970px', margin: '0 auto', padding: '0 20px 150px', fontFamily: "'Noto Sans KR', sans-serif", boxSizing: 'border-box' }}>
            
            {/* 안내 문구 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, color: '#999999', fontSize: '16px' }}>
                    ※ 기존의 '강그린 와이드&사각' 제품명이 '강마루 프리미엄 합판'으로 변경되었습니다.
                </p>
            </div>

            {/* LX Z:IN 바닥재 강마루 프리미엄 합판 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, paddingBottom: '12px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                    LX Z:IN 바닥재 강마루 프리미엄 합판
                </p>
                <p style={{ margin: 0, paddingBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                    더 넓어진 사이즈로 공간을 시원하게, LX Z:IN 바닥재 강마루 프리미엄 합판 입니다.
                </p>
                <img src={MARU_PREMIUM_IMAGES[0]} alt="강마루 프리미엄 합판 메인" style={{ display: 'block', margin: 0, width: '100%' }} />

                {/* 3개 특장점 카드 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: '50px', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '120px', backgroundColor: '#ffffff', border: '1px solid #e9e9e9' }}>
                        <img src={MARU_PREMIUM_IMAGES[1]} alt="리얼 텍스처" style={{ display: 'block', margin: 0 }} />
                        <p style={{ margin: 0, paddingLeft: '15px', fontSize: '16px' }}>
                            원목과 대리석 질감을 더욱 살린&nbsp;
                            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>리얼 텍스처 적용</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '120px', backgroundColor: '#ffffff', border: '1px solid #e9e9e9' }}>
                        <img src={MARU_PREMIUM_IMAGES[2]} alt="천연 외관" style={{ display: 'block', margin: 0 }} />
                        <p style={{ margin: 0, paddingLeft: '15px', fontSize: '16px' }}>
                            4배 더 섬세한 디자인으로&nbsp;
                            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>생생한 천연 외관 구현</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '120px', backgroundColor: '#ffffff', border: '1px solid #e9e9e9' }}>
                        <img src={MARU_PREMIUM_IMAGES[3]} alt="감각적 공간" style={{ display: 'block', margin: 0 }} />
                        <p style={{ margin: 0, paddingLeft: '15px', fontSize: '16px' }}>
                            Mix & Match로 완성하는&nbsp;
                            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>감각적 공간 제안</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* 제품 구조도 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, paddingBottom: '12px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                    제품 구조도
                </p>
                <p style={{ margin: 0, padding: '20px 0 50px 0', fontSize: '14px', textAlign: 'center', color: '#14161d' }}>
                    우드 165
                </p>
                <div style={{ marginTop: 0 }}>
                    <img src={MARU_PREMIUM_IMAGES[4]} alt="구조도 우드165" style={{ display: 'block', margin: '0 auto', width: '68%' }} />
                </div>
                <p style={{ margin: 0, padding: '32px 0 24px 0', fontSize: '14px', textAlign: 'center', color: '#14161d' }}>
                    사각 600/400
                </p>
                <div>
                    <img src={MARU_PREMIUM_IMAGES[5]} alt="구조도 사각600/400" style={{ display: 'block', margin: '0 auto', width: '68%' }} />
                </div>
            </div>

            {/* Super E0 등급의 내수합판 사용 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                    Super E0 등급의 내수합판 사용
                </p>
                <p style={{ margin: 0, padding: '20px 0', fontSize: '14px', textAlign: 'center', color: '#14161d' }}>
                    포름알데히드 방출량이 0.3mg/L이하인 최우수등급의 자재를 사용하였습니다.
                </p>
                <p style={{ margin: 0, fontSize: '16px', textAlign: 'center', color: '#14161d' }}>
                    ※ 목재자재 포름알데히드 방출량 기준(데시케이터법, 평균값 기준)
                </p>
                <div style={{ paddingTop: '24px' }}>
                    <img src={MARU_PREMIUM_IMAGES[6]} alt="Super E0 등급" style={{ display: 'block', margin: '0 auto' }} />
                </div>
            </div>

            {/* 생생한 천연 외관 구현 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                    생생한 천연 외관 구현
                </p>
                <p style={{ margin: 0, padding: '20px 0', fontSize: '14px', textAlign: 'center', color: '#14161d' }}>
                    디지털 프린팅 공법으로 인쇄 대비 <strong>약 4배 높은 해상도(일반 인쇄 300dpi / 본 제품 1,200dpi)</strong>로<br />
                    무늬와 색상을 보다 정교하게 구현합니다.
                </p>
                <div style={{ paddingTop: '24px' }}>
                    <img src={MARU_PREMIUM_IMAGES[7]} alt="생생한 천연 외관 구현" style={{ display: 'block', margin: '0 auto', width: '100%' }} />
                </div>
            </div>

            {/* Mix & Match로 완성하는 보다 감각적 공간 제안 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                    Mix & Match로 완성하는 보다 감각적 공간 제안
                </p>
                <div style={{ paddingTop: '24px', display: 'flex', gap: '20px' }}>
                    {/* 왼쪽 테이블: 강마루 + 에디톤 월맥스 */}
                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #eee', textAlign: 'center', borderCollapse: 'collapse', fontSize: '15px' }}>
                            <thead>
                                <tr>
                                    <td style={{ padding: '30px 0', color: '#999999', backgroundColor: '#fbfbfb', position: 'relative', width: '50%' }}>
                                        강마루&nbsp;<span style={{ position: 'absolute', right: '-1.5%' }}>+</span>
                                    </td>
                                    <td style={{ padding: '30px 0', color: '#999999', backgroundColor: '#fbfbfb', width: '50%' }}>에디톤 월맥스</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #eee', padding: '30px 0' }}>FMKGA201</td>
                                    <td style={{ border: '1px solid #eee' }}>EML2124</td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #eee', padding: '30px 0' }}>FMKGA203</td>
                                    <td style={{ border: '1px solid #eee' }}>EML2140</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* 오른쪽 테이블: 강마루 + 인테리어필름 + 가구용보드 */}
                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #eee', textAlign: 'center', borderCollapse: 'collapse', fontSize: '15px' }}>
                            <thead>
                                <tr>
                                    <td style={{ padding: '30px 0', color: '#999999', backgroundColor: '#fbfbfb', width: '33%' }}>강마루</td>
                                    <td style={{ padding: '30px 0', color: '#999999', backgroundColor: '#fbfbfb', position: 'relative', width: '33%' }}>
                                        <span style={{ position: 'absolute', left: '-5px' }}>+</span> 인테리어필름&nbsp;<span style={{ position: 'absolute', right: '-5px' }}>+</span>
                                    </td>
                                    <td style={{ padding: '30px 0', color: '#999999', backgroundColor: '#fbfbfb', width: '33%' }}>가구용보드</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #eee', padding: '30px 0' }}>FMKGA304</td>
                                    <td style={{ border: '1px solid #eee' }}>DW661</td>
                                    <td style={{ border: '1px solid #eee' }}>STN27</td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #eee', padding: '30px 0' }}>FMKGA305</td>
                                    <td style={{ border: '1px solid #eee' }}>DW660</td>
                                    <td style={{ border: '1px solid #eee' }}>STN26</td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #eee', padding: '30px 0' }}>FMKGA306</td>
                                    <td style={{ border: '1px solid #eee' }}>DW659</td>
                                    <td style={{ border: '1px solid #eee' }}>STN25</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 인증 & 수상 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                    인증 & 수상
                </p>
                <div style={{ paddingTop: '24px' }}>
                    <table style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #eee', textAlign: 'center', borderCollapse: 'collapse', fontSize: '15px' }}>
                        <thead>
                            <tr>
                                <td style={{ padding: '24px 0', borderRight: '1px solid #eee', width: '50%' }}>
                                    <img src={MARU_PREMIUM_IMAGES[8]} alt="실내표지" style={{ display: 'block', margin: '0 auto' }} />
                                </td>
                                <td style={{ padding: '24px 0', width: '50%' }}>
                                    <img src={MARU_PREMIUM_IMAGES[9]} alt="K-BPI" style={{ display: 'block', margin: '0 auto' }} />
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #eee', padding: '20px 0', backgroundColor: '#fbfbfb', color: '#999999' }}>
                                    실내표지
                                </td>
                                <td style={{ border: '1px solid #eee', padding: '20px 0', backgroundColor: '#fbfbfb', color: '#999999' }}>
                                    2025 한국산업의 브랜드파워 (K-BPI)조사<br />
                                    가정용 바닥재 부문 1위
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MaruPremiumFeature;
