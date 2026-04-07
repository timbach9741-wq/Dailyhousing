import React from 'react';

/* ═══════════════════════════════════════════════════════════
   하우스 타일 스탠다드(하우스 Style) 제품 상세 (LX Z:IN 원본 사이트 100% 재현)
   https://www.lxzin.com/zin/product/102048
   ═══════════════════════════════════════════════════════════ */

function TileStandardFeature() {
    return (
        <div className="w-full flex flex-col items-center bg-[#f8f9fa] py-10">
            <div className="max-w-[960px] w-full bg-white shadow-sm flex flex-wrap justify-center items-center py-6">

                {/* ═══ LX Z:IN 바닥재 하우스 타일 스탠다드 인트로 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">LX Z:IN 바닥재 하우스 타일 스탠다드</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">풍부한 디자인 그리고 덧 시공의 편리함까지 겸비한 고품격 주거용 바닥재입니다.</p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/59498022-6b36-41eb-98cb-178c2b53c9a1.jpg"
                                alt="LX Z:IN 바닥재 하우스 타일 스탠다드"
                                className="block m-0 w-full"
                            />
                            <ul className="flex justify-start items-start list-none p-0" style={{ margin: '20px -5px' }}>
                                {[
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202504/17/6d5dcd4d-5531-43d7-bbc9-fb494c4401f4.png",
                                        alt: "기존 마루 철거 없이 덧 시공 가능 1-DAY 덧 시공",
                                        sub: "기존 마루 철거 없이 덧 시공 가능\u00A0",
                                        strong: "1-DAY 덧 시공"
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202504/17/b3ad7c28-0f9e-4c19-b041-1dc164bba9c4.png",
                                        alt: "안심하고 사용가능한 친환경 바닥재",
                                        sub: "안심하고 사용가능한\u00A0",
                                        strong: "친환경 바닥재"
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202504/17/245dbd96-5410-42be-8f47-5f8785f32f73.png",
                                        alt: "전용 접착제",
                                        sub: "\u00A0\u00A0",
                                        strong: "전용 접착제"
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/20aad4b3-2651-4169-b527-0e71c6f6c5c3.png",
                                        alt: "수분에 의한 변형과 변색에 강한 내수성 바닥재",
                                        sub: "수분에 의한 변형과 변색에 강한\u00A0",
                                        strong: "내수성 바닥재"
                                    }
                                ].map((item, i) => (
                                    <li key={i} className="mx-[5px] py-[25px] px-[10px] border border-[#f1f1f1] box-border" style={{ width: 'calc(25% - 10px)' }}>
                                        <img src={item.img} alt={item.alt} className="block m-0 w-full" />
                                        <p className="m-0 pt-[10px] text-[14px] text-center tracking-[-0.024em]">
                                            {item.sub}
                                            <span className="block text-[14px] font-bold">{item.strong}</span>
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="m-0 text-[#999999] text-[14px]">※ 기존의 '하우스 Style' 제품명이 '하우스 타일 스탠다드'로 변경되었습니다.</p>
                        <p className="m-0 text-[#999999] text-[14px]">※ 덧 시공은 LX하우시스 시방서(중첩시공) 기준에 따라 시공하여 주십시오.</p>
                    </div>
                </div>

                {/* ═══ 제품 구조도 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">제품 구조도</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                LX Z:IN 바닥재 하우스 타일 스탠다드는 표면처리층, 보호 필름층, 디자인층 + 연속동조엠보, 전사방지 Base층, Balance층, 하우스풀(하우스 전용 접착제)로 구성되어 있습니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202504/29/b3f4884f-d9ba-41fe-945e-69cc729e2b36.jpg"
                                alt="제품 구조도"
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 고급스러운 디자인 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">고급스러운 디자인</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                LX Z:IN 바닥재 하우스 타일 스탠다드는 자연스럽고 깊이있는 질감과 섬세하고 고급스러운 디자인으로 보다 더 품격있는 공간을 제안합니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <ul className="flex flex-wrap justify-start items-start list-none p-0" style={{ margin: '0 -5px' }}>
                                {[
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/7a3f93d6-5b3d-412a-9036-aec181692970.jpg",
                                        name: "Marble",
                                        desc: "최고급 천연 대리석의 질감을\n그대로 살려 품격이 느껴지는\n우아한 공간을 제안합니다."
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/1baa8385-aec7-4ea4-bed0-70dba8f428a7.jpg",
                                        name: "Cloud",
                                        desc: "차분한 베이스에\n은은한 베인을 더해 부드럽고\n편안한 분위기를 완성합니다."
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/05761977-3e98-42d8-bc26-8fc085ea15ea.jpg",
                                        name: "Ash & Oak",
                                        desc: "공간에 부드럽게 녹아드는 패턴과\n자연스러운 터치감으로 수수하고\n밝은 공간을 연출할 수 있습니다."
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/b1a2cbfa-81b6-4950-b32e-360e66f1a1ab.jpg",
                                        name: "Walnut",
                                        desc: "풍부한 월넛의 나뭇결과 손끝으로\n느껴지는 섬세한 터치감은 더욱\n고급스러운 공간을 완성합니다."
                                    }
                                ].map((item, i) => (
                                    <li key={i} className="mx-[5px] mb-[20px]" style={{ width: 'calc(50% - 10px)' }}>
                                        <img src={item.img} alt={item.name} className="block m-0 w-full" />
                                        <p className="m-0 py-[10px] text-[#808d98] text-[14px] font-bold text-center" style={{ borderBottom: '1px solid #808d98' }}>
                                            {item.name}
                                        </p>
                                        <p className="m-0 pt-[10px] text-[14px] text-center">
                                            {item.desc.split('\n').map((line, j) => (
                                                <React.Fragment key={j}>{j > 0 && <br />}{line}</React.Fragment>
                                            ))}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ═══ 디자인 바닥재 (와이드 디자인 + 연속동조엠보) ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">디자인 바닥재</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                LX하우시스만의 연속동조엠보 기술 적용으로 원목 질감과 Reality를 구현하였습니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202504/29/733c823b-9de0-49bf-ba61-500f55dd99bf.jpg"
                                alt="와이드 디자인으로 더욱 고급스러운 패턴"
                                className="block m-0 w-full mb-[40px]"
                            />
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/3ff81a61-64e9-4ab8-b004-ea7048fb873f.jpg"
                                alt="원목의 무늬결과 질감을 살린 연속동조엠보"
                                className="block m-0 w-full mb-[40px]"
                            />
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/520a7f62-a8b3-431d-b0af-a67a9810d2bd.jpg"
                                alt="연속동조엠보 비교"
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 편리한 바닥재 (덧 시공) ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">편리한 바닥재</p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202504/29/586c07ae-bc6e-4e50-91e5-69334e4c4a97.jpg"
                                alt="기존 마루 철거 없이 덧 시공 가능"
                                className="block m-0 w-full mb-[40px]"
                            />
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202504/29/62270f54-1dfe-4f95-ba35-3b716417b29d.jpg"
                                alt="바닥 전사 방지 최소화 / 손상된 부분에 따른 교체 시공 가능"
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 전용 접착제 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">전용 접착제</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                특수처방 전용 접착제 개발로 온도에 따른 수축/팽창을 최소화하였습니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/e67c10b9-043d-4ea5-93e6-7ba48a2795d9.jpg"
                                alt="풀 (전용 접착제) 및 틈 벌어짐 테스트"
                                className="block m-0 w-full"
                            />
                        </div>
                        <p className="m-0 text-[#999999] text-[12px]">* 반드시 전용 접착제(하우스풀)로 시공하시기 바랍니다. 풀 미사용 및 도포량 미준수에 따른 시공상의 하자는 책임을 지지 않습니다.</p>
                        <p className="m-0 text-[#999999] text-[12px]">※ LX하우시스 자체 테스트 결과로 비교시료 사양 및 실험 방법, 환경에 따라 차이가 날 수 있습니다.</p>
                        <p className="m-0 text-[#999999] text-[12px]">※ 상기 테스트는 모두 자사 제품으로 비교 실험하였습니다</p>
                    </div>
                </div>

                {/* ═══ 스트레스 걱정 줄여주는 바닥재 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">스트레스 걱정 줄여주는 바닥재</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                내수성, 내스크래치성, 내마모성, 열전도성, 미끄럼 저항성이 마루 대비 우수합니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202504/29/2b212025-de19-4f0b-b741-7ca4f4c873a0.jpg"
                                alt="강한 내수성으로 수분에 의한 변색 및 부풀림 방지"
                                className="block m-0 w-full mb-[40px]"
                            />
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/56086776-dba9-4166-84c5-81eb9063d2ae.jpg"
                                alt="우수한 내마모성/내스크래치성"
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 건강을 먼저 생각하는 안심 바닥재 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">건강을 먼저 생각하는 안심 바닥재</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                유해물질을 줄인 친환경 제품이며, 마루 대비 미끄럼 안전성 또한 우수한 바닥재 입니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/49a7f3da-4af4-46e3-9c0a-495ef3d48f98.jpg"
                                alt="프탈레이트, 중금속 불검출 / 미끄럼 테스트"
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 바닥 열전도성이 우수한 경제적인 바닥재 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">바닥 열전도성이 우수한 경제적인 바닥재</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                마루 대비 열전도성이 높아 바닥 난방에 더욱 효과적입니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/456096c4-18f6-48a0-8b0c-bca4d2c99102.jpg"
                                alt="열전도율 측정 테스트"
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 인증 & 수상 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">인증 & 수상</p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/78c29f04-d2fe-4a6a-8b79-f3d32b62392f.jpg"
                                alt="인증 & 수상"
                                className="block m-0 w-full"
                            />
                        </div>
                        <p className="m-0 text-[#999999] text-[12px]">※ Floorscore는 엄격한 환경 유해 물질 함량 및 방출량 기준을 만족한 제품에 한하여 인증을 부여함</p>
                    </div>
                </div>

                {/* ═══ 주의사항 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[100px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">주의사항</p>
                        </div>
                        <div className="mb-[40px]">
                            <p className="m-0 text-[16px] font-bold mb-[20px]">사용 시 주의사항</p>
                            <ul className="m-0 pl-[20px] text-[14px] leading-[2]">
                                <li>바닥에 물이 흘렸을 때에는 즉시 닦아 주십시오.</li>
                                <li>무거운 가구 등에는 보호 패드를 바닥에 부착하여 주십시오.</li>
                                <li>의자 등 바퀴 달린 가구 사용 시 바닥 보호재를 사용하여 주십시오.</li>
                                <li>바닥에 직접 열기구(전기장판 등)를 사용하지 마십시오.</li>
                                <li>청소 시 중성세제를 사용하시고, 아세톤 등 유기용제 사용은 삼가 주십시오.</li>
                            </ul>
                        </div>
                        <div className="mb-[40px]">
                            <p className="m-0 text-[16px] font-bold mb-[20px]">안전관리 시 주의사항</p>
                            <ul className="m-0 pl-[20px] text-[14px] leading-[2]">
                                <li>화기 가까이에 두지 마십시오.</li>
                                <li>절단 작업 시 환기가 잘 되는 곳에서 작업하십시오.</li>
                                <li>어린이의 손이 닿지 않는 곳에 보관하십시오.</li>
                            </ul>
                        </div>
                        <div className="mb-[40px]">
                            <p className="m-0 text-[16px] font-bold mb-[20px]">시공 시 주의사항</p>
                            <ul className="m-0 pl-[20px] text-[14px] leading-[2]">
                                <li>시공은 반드시 LX하우시스 시방서에 따라 시공하십시오.</li>
                                <li>반드시 전용 접착제(하우스풀)를 사용하여 주십시오.</li>
                                <li>시방서에 따르지 않고 임의 시공한 제품의 하자는 책임지지 않습니다.</li>
                                <li>썩거나 부풀림이 심한 바닥재 위에는 시공이 불가능합니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TileStandardFeature;
