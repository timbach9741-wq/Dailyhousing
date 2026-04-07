import React from 'react';

// 시트 스탠다드 1.8(뉴청맥) 전용 상세 이미지
const SHEET_18_IMAGES = [
    "https://octapi.lxzin.com/imageResource/file/202403/20/fe9448cb-88c7-449a-991c-3caa75cef84e.png", // 메인 히어로
    "https://octapi.lxzin.com/imageResource/file/202403/18/1db54701-3e24-4375-8ba5-cb679efa5250.png", // 아이콘: 친환경 바닥재
    "https://octapi.lxzin.com/imageResource/file/202403/20/3994df3e-cd11-408e-97c4-30eb3f89b519.png", // 아이콘: 우수한 기본 품질
    "https://octapi.lxzin.com/imageResource/file/202403/18/d4fb4596-d1e5-4155-a850-f744302d85ee.png", // 아이콘: 다양한 디자인
    "https://octapi.lxzin.com/imageResource/file/202403/20/3ba51bc7-dd4f-45ee-8e41-9209cce45729.png", // 제품 구조도
    "https://octapi.lxzin.com/imageResource/file/202403/20/a6391248-d2b5-4bf3-b4c1-f4d66f70e6e6.png", // 우수한 기본 품질 이미지
    "https://octapi.lxzin.com/imageResource/file/202403/19/abea5c3d-b15a-4a4a-bd3e-2d65e063df72.png", // 다양한 디자인 이미지
    "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", // 인증: K-BPI
    "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", // 인증: 환경표지인증
    "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", // 인증: 실내표지
];

function SheetStandard18Feature() {
    return (
        <div style={{ width: '100%', maxWidth: '970px', margin: '0 auto', padding: '0 20px 150px', fontFamily: "'Noto Sans KR', sans-serif", boxSizing: 'border-box' }}>

            {/* 안내 문구 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, color: '#999999', fontSize: '16px' }}>
                    ※ 기존의 '뉴청맥' 제품명이 '시트 스탠다드 1.8'으로 변경되었습니다.
                </p>
            </div>

            {/* LX Z:IN 바닥재 시트 스탠다드 1.8 */}
            <div style={{ marginBottom: '200px' }}>
                <p style={{ margin: 0, paddingBottom: '12px', fontSize: '16px', fontWeight: 'bold', lineHeight: '28px', textAlign: 'center', wordSpacing: '-1px' }}>
                    LX Z:IN 바닥재 시트 스탠다드 1.8
                </p>
                <span style={{ display: 'block', margin: 0, paddingTop: '30px', fontSize: '14px', textAlign: 'center', wordSpacing: '-1px' }}>
                    &nbsp;실용적이고 합리적인 가격의 시트바닥재, LX Z:IN 바닥재 시트 스탠다드 1.8입니다.&nbsp;
                </span>
                <img src={SHEET_18_IMAGES[0]} alt="실용적이고 합리적인 가격의 시트바닥재, 뉴청맥입니다." style={{ display: 'block', margin: 0, paddingTop: '24px', width: '100%' }} />

                {/* 3개 특장점 카드 - 한 줄 배치 */}
                <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'stretch', marginTop: '10px', gap: '10px' }}>
                    <div style={{ display: 'flex', flex: '1', height: '120px', justifyContent: 'center', alignItems: 'center', border: '1px solid #e9e9e9' }}>
                        <div style={{ paddingRight: '16px' }}>
                            <img src={SHEET_18_IMAGES[1]} alt="친환경 바닥재" style={{ display: 'block', margin: 0 }} />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '16px' }}>안심하고 사용할 수 있는</span>
                            <strong style={{ display: 'block', fontSize: '16px' }}>친환경 바닥재</strong>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flex: '1', height: '120px', justifyContent: 'center', alignItems: 'center', border: '1px solid #e9e9e9' }}>
                        <div style={{ paddingRight: '16px' }}>
                            <img src={SHEET_18_IMAGES[2]} alt="우수한 기본 품질" style={{ display: 'block', margin: 0 }} />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '16px' }}>경제적인 가격대</span>
                            <strong style={{ display: 'block', fontSize: '16px' }}>우수한 기본 품질</strong>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flex: '1', height: '120px', justifyContent: 'center', alignItems: 'center', border: '1px solid #e9e9e9' }}>
                        <div style={{ paddingRight: '16px' }}>
                            <img src={SHEET_18_IMAGES[3]} alt="다양한 디자인" style={{ display: 'block', margin: 0 }} />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '16px' }}>소재 본연의 디자인을 표현한</span>
                            <strong style={{ display: 'block', fontSize: '16px' }}>다양한 디자인</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* 제품 구조도 */}
            <div style={{ display: 'flex', flexFlow: 'column', alignItems: 'center', marginBottom: '200px' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', lineHeight: '28px', textAlign: 'center', wordSpacing: '-1px' }}>
                        제품 구조도
                    </p>
                    <span style={{ display: 'block', paddingTop: '29px', fontSize: '14px', textAlign: 'center', wordSpacing: '-1px' }}>
                        &nbsp;LX Z:IN 바닥재 시트 스탠다드 1.8는 UV코팅/투명필름층, 디자인 인쇄층, 치수안정층, 쿠션층<br />
                        &nbsp;총 4단계로 구성되어 있습니다.
                    </span>
                </div>
                <div style={{ marginTop: '50px' }}>
                    <img src={SHEET_18_IMAGES[4]} alt="뉴청맥 제품 구조도" style={{ display: 'block', margin: '0 auto' }} />
                </div>
            </div>

            {/* 우수한 기본 품질 + 다양한 디자인 */}
            <div style={{ marginBottom: '200px' }}>
                <ul style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', margin: '45px -5px', padding: 0, listStyle: 'none' }}>
                    <li style={{ margin: '45px 5px', width: 'calc(50% - 10px)' }}>
                        <img src={SHEET_18_IMAGES[5]} alt="우수한 기본 품질" style={{ display: 'block', margin: '0 auto' }} />
                        <div style={{ paddingTop: '24px' }}>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>우수한 기본 품질</p>
                            <p style={{ margin: 0, paddingTop: '20px', fontSize: '14px', textAlign: 'center' }}>
                                기본에 충실한 품질과 튼튼하고 경제적인 가격대로<br />부담없이 사용할 수 있습니다.
                            </p>
                        </div>
                    </li>
                    <li style={{ margin: '45px 5px', width: 'calc(50% - 10px)' }}>
                        <img src={SHEET_18_IMAGES[6]} alt="다양한 디자인" style={{ display: 'block', margin: '0 auto' }} />
                        <div style={{ paddingTop: '24px' }}>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>다양한 디자인</p>
                            <p style={{ margin: 0, paddingTop: '20px', fontSize: '14px', textAlign: 'center' }}>
                                넓어진 나무쪽 사이즈의 우드 디자인과<br />천연 석재를 모티브로 한 스톤 디자인으로<br />다양한 공간을 만들어 드립니다.
                            </p>
                            <p style={{ margin: '30px auto', width: '20px', height: '1px', backgroundColor: '#000000' }}>&nbsp;</p>
                            <p style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>※ Wide 디자인은 일부 패턴에만 적용되어 있음</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* 스펙 */}
            <div style={{ marginBottom: '200px' }}>
                <div style={{ marginBottom: '50px' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>스펙</p>
                </div>
                <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse', boxSizing: 'border-box' }}>
                    <colgroup>
                        <col width="20%" />
                        <col width="30%" />
                        <col width="20%" />
                        <col width="30%" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th style={{ padding: '25px 20px', color: '#ababab', fontWeight: 'normal', textAlign: 'left', backgroundColor: '#fbfbfb', border: '1px solid #f1f1f1' }}>사이즈</th>
                            <td style={{ padding: '25px 20px', color: '#000000', fontSize: '16px', border: '1px solid #f1f1f1' }}>1.8mm(T) X 1,830mm(W)</td>
                            <th style={{ padding: '25px 20px', color: '#ababab', fontWeight: 'normal', textAlign: 'left', backgroundColor: '#fbfbfb', border: '1px solid #f1f1f1' }}>포장 단위</th>
                            <td style={{ padding: '25px 20px', color: '#000000', fontSize: '16px', border: '1px solid #f1f1f1' }}>35M</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 인증 & 수상 */}
            <div style={{ marginBottom: '200px' }}>
                <div style={{ marginBottom: '50px' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>인증 &amp; 수상</p>
                </div>
                <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse', boxSizing: 'border-box' }}>
                    <colgroup>
                        <col width="33.33%" />
                        <col width="33.33%" />
                        <col width="33.33%" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <td style={{ padding: '25px 20px', backgroundColor: '#ffffff', border: '1px solid #f1f1f1' }}>
                                <img src={SHEET_18_IMAGES[7]} alt="K-BPI" style={{ display: 'block', margin: '0 auto', width: '152px' }} />
                            </td>
                            <td style={{ padding: '25px 20px', backgroundColor: '#ffffff', border: '1px solid #f1f1f1' }}>
                                <img src={SHEET_18_IMAGES[8]} alt="환경표지인증" style={{ display: 'block', margin: '0 auto', width: '224px' }} />
                            </td>
                            <td style={{ padding: '25px 20px', backgroundColor: '#ffffff', border: '1px solid #f1f1f1' }}>
                                <img src={SHEET_18_IMAGES[9]} alt="실내표지" style={{ display: 'block', margin: '0 auto', width: '92px' }} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '25px 20px', color: '#ababab', fontSize: '16px', textAlign: 'center', backgroundColor: '#fbfbfb', border: '1px solid #f1f1f1' }}>
                                2025 한국산업의 브랜드파워(K-BPI) 조사<br />가정용 바닥재 부문 1위
                            </td>
                            <td style={{ padding: '25px 20px', color: '#ababab', fontSize: '16px', textAlign: 'center', backgroundColor: '#fbfbfb', border: '1px solid #f1f1f1' }}>
                                환경표지인증 한국환경산업기술원
                            </td>
                            <td style={{ padding: '25px 20px', color: '#ababab', fontSize: '16px', textAlign: 'center', backgroundColor: '#fbfbfb', border: '1px solid #f1f1f1' }}>
                                실내표지
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 주의사항 */}
            <div style={{ marginBottom: '100px' }}>
                <div style={{ marginBottom: '50px' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>주의사항</p>
                </div>

                <div style={{ marginTop: '50px' }}>
                    <p style={{ margin: 0, paddingBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>사용 시 주의사항</p>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 시공 직후 과도한 고열 난방시 제품의 변형이나 들뜸이 발생할 수 있으니, 주의하시기 바랍니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 물로 제거되지 않는 오염은 빠른 시간 내 오염정도에 따라 중성 세제 또는 알코올 등으로 제거해 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 색소를 함유하고 있거나, 침투성이 강한 물질에 장시간 접촉시 제품 표면이 오염될 수 있으니, 즉시 제거해 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '16px', fontSize: '16px', color: '#e74c3c', marginTop: '4px', marginBottom: '4px' }}>Ex) 카레, 커피, 김치국물, 칼라 클레이, 색소 첨가된 과자류, 락스, 신나 등</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 가구, 의자 등 중량물(무거운 물품) 이동시 밀거나 끌어서는 절대 안됩니다. (표면손상, 제품 밀림)</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 무거운 집기 등에 장시간 눌렸을 때 표면 눌림 자국이 발생할 수 있으니, 주의하시기 바랍니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 스팀 청소기 사용시 한곳을 집중적으로 스팀에 노출 시키면 제품표면이 손상 될 수 있습니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 의자, 식탁 등 가구의 다릿발 하부에 사용하는 보호 패드는 반드시 무색 계열(투명 또는 백색)을 사용하십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 유색 패드(부직포, 고무, 천 등) 사용시 염료 등의 오염물이 시트 표면에 이염 될 수 있습니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 전기장판, 매트 류 등을 한 자리에 장시간 고정하여 사용시 제품 표면에 변색이 발생할 수 있습니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 환기나 채광이 되지 않는 사용환경은 제품의 변색의 원인이 될 수 있습니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 직사광선에 지나치게 노출 시, 제품표면이 변색 될 수 있으므로 주의 바랍니다.</span>
                </div>

                <div style={{ marginTop: '50px' }}>
                    <p style={{ margin: 0, paddingBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>안전관리 시 주의사항</p>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 물을 흘렸을 경우 미끄러질 수 있으니, 즉시 제거하여 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 양말을 신은 상태나 젖은 발의 경우에도 미끄러질 수 있으므로 주의하시기 바랍니다.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 제품 표면에 피부나 섬유(의류) 등 이 과도하게 마찰될 경우 손상될 수 있으니 주의하십시오.</span>
                </div>

                <div style={{ marginTop: '50px' }}>
                    <p style={{ margin: 0, paddingBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>시공 시 주의사항</p>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 시공 전 반드시 『LX하우시스 바닥재 시공가이드』를 숙지해 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '16px', fontSize: '16px', color: '#e74c3c', marginTop: '4px', marginBottom: '4px' }}>(시공가이드에 명시된 시공법을 따르지 않고 임의로 시공한 경우, 이에 따른 하자에 대해서는 당사가 책임지지 않습니다.)</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 생산 LOT별로 구분하여 시공해 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 시공 초기에 제품 특유의 냄새가 있을 수 있으니 충분히 환기해 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 접착제 및 용착제를 사용할 때는 먼저 환기를 한 후 보호장갑과 마스크를 반드시 착용 작업하십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 본 제품은 롤(Roll)당 100kg 내외의 중량물(무거운)이므로, 취급 시 주의해 주십시오.</span>
                    <span style={{ display: 'block', paddingLeft: '8px', fontSize: '16px', textIndent: '-8px' }}>- 제품이 세워져 있는 공간에서 작업을 금합니다. 제품이 쓰러져 다칠 수가 있습니다.</span>
                </div>
            </div>
        </div>
    );
}

export default SheetStandard18Feature;
