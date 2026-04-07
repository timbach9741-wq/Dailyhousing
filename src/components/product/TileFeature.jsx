import React from 'react';

/* ═══════════════════════════════════════════════════════════
   하우스 타일 베이직 제품 상세 (LX Z:IN 원본 사이트 100% 재현)
   https://www.lxzin.com/zin/product/102034
   ═══════════════════════════════════════════════════════════ */

function TileFeature() {
    return (
        <div className="w-full flex flex-col items-center bg-[#f8f9fa] py-10">
            <div className="max-w-[960px] w-full bg-white shadow-sm flex flex-wrap justify-center items-center py-6">

                {/* ═══ LX Z:IN 바닥재 하우스 타일 베이직 인트로 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">LX Z:IN 바닥재 하우스 타일 베이직</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">세련된 디자인과 자연 그대로의 질감을 살린 주거용 바닥재입니다.</p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/7bfa9dbd-81cb-4893-bb84-366de43df030.jpg"
                                alt="LX Z:IN 바닥재 하우스 타일 베이직"
                                className="block m-0 w-full"
                            />
                            <ul className="flex justify-start items-start list-none p-0" style={{ margin: '20px -5px' }}>
                                {[
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/e6df7db0-c918-4640-8219-879ac742e05b.png",
                                        alt: "표면무광처리 TrueMatte 기술로 자연스러운 텍스처",
                                        sub: "표면무광처리 TrueMatte 기술로\u00A0",
                                        strong: "자연스러운 텍스처"
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/fb0e15b8-3c00-4681-b56d-997bb7678aa5.png",
                                        alt: "안심하고 사용가능한 친환경 바닥재",
                                        sub: "안심하고 사용가능한\u00A0",
                                        strong: "친환경 바닥재"
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/4e49abfd-34f4-4155-96ab-1c8bfc2e63e1.png",
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
                        <p className="m-0 text-[#999999] text-[14px]">※ 기존의 '하우스' 제품명이 '하우스 타일 베이직'으로 변경되었습니다.</p>
                    </div>
                </div>

                {/* ═══ 제품 구조도 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">제품 구조도</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                LX Z:IN 바닥재 하우스 타일 베이직은 표면무광처리층, 보호 필름층, 디자인층, Base층, Balance층으로 구성되어 있습니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202504/29/b3cf50bf-b657-442d-b5d5-9cabd96743d3.jpg"
                                alt="제품 구조도, LX Z:IN 바닥재 하우스 타일 베이직은 표면무광처리층, 보호 필름층, 디자인층, Base층, Balance층으로 구성되어 있습니다."
                                className="block m-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ 트렌디한 디자인 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">트렌디한 디자인</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">어느 곳에나 잘 어울리는 세련되고 트렌디한 디자인으로 감각적인 공간을 제안합니다.</p>
                        </div>
                        <div className="mb-[20px]">
                            <ul className="flex justify-start items-start list-none p-0" style={{ margin: '50px -5px' }}>
                                {[
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/687f517c-32da-4cf8-a190-7d4b85c4e21c.jpg",
                                        name: "Lime Stone",
                                        desc: "편안한 컬러감에 부드러운\n라임 스톤의 질감을 살려 미니멀하고\n감각적인 공간을 완성합니다."
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/1d36c088-0574-4916-9274-54abd24dca04.jpg",
                                        name: "Oak",
                                        desc: "깨끗하게 정돈된 오크 패턴에\n다양한 컬러감을 더해 어느 곳에나\n잘 어울리는 분위기를 만들어 냅니다."
                                    },
                                    {
                                        img: "https://octapi.lxzin.com/imageResource/file/202409/23/8a6b691c-977e-4343-8ad8-4ae3021b83f5.jpg",
                                        name: "Ash",
                                        desc: "중저 채도의 차분한 컬러감과\n애쉬의 패턴감을 살려 포근하고 아늑한\n공간을 완성합니다."
                                    }
                                ].map((item, i) => (
                                    <li key={i} className="mx-[5px]" style={{ width: 'calc(33.33% - 10px)' }}>
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

                {/* ═══ 표면무광효과로 더욱 자연스러운 텍스처 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">표면무광효과로 더욱 자연스러운 텍스처</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">TrueMatte, 표면무광처리 기술로 빛에 의한 번들거림이 적고,실제 자연의 소재와 유사한 텍스처의 감촉을 전달합니다.</p>
                        </div>
                        <div className="mb-[20px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202409/23/aa472a13-7d1a-4c6d-9f52-c1db1751902b.jpg"
                                alt="표면무광효과로 더욱 자연스러운 텍스처"
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
                            <p className="m-0 pt-[20px] text-[14px] text-center">특수처방 전용 접착제 개발로 온도에 따른 수축/팽창을 최소화하였습니다.</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                ※ 반드시 전용 접착제로 시공하시기 바랍니다.<br />
                                ※ 미사용 및 도포량 미준수에 따른 시공상의 하자는 책임을 지지 않습니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <ul className="flex justify-start list-none p-0" style={{ margin: '0 -5px' }}>
                                <li className="mx-[5px] bg-[#f5f5f5]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[10px] text-[14px] font-bold text-center bg-white">풀 (전용 접착제)</p>
                                    <div className="bg-[#f5f5f5]">
                                        <img src="https://octapi.lxzin.com/imageResource/file/202409/23/c64d02f4-1f50-42be-a395-d8ffd165e034.jpg" alt="풀 (전용 접착제)" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>※ 특수처방 개발로 제품과의 접착력이 증대되었습니다.</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="mx-[5px] bg-[#f5f5f5]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[10px] text-[14px] font-bold text-center bg-white">틈 벌어짐 테스트</p>
                                    <div className="bg-[#f5f5f5]">
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/2bf37a95-597c-4373-a758-78c16c982ff5.jpg" alt="틈 벌어짐 테스트" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>· 테스트 결과 : 일반 데코타일 대비 틈 벌어짐 약 85% 개선</p>
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>
                                                · 테스트 방법 : CRC 보드 위 접착제 도포 및 제품을 부착,<br />
                                                24시간 방치 후 가혹조건 테스트를 4 Cycle 진행<br />
                                                (1 Cycle 조건 : 고온 6시간 – 상온 6시간 – 저온 6시간 – 상온 6시간)
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="mb-[50px]">
                            <p className="m-0 text-[14px]">※ LX하우시스 자체 테스트 결과로 비교시료 사양 및 실험 방법, 환경에 따라 차이가 날 수 있습니다.</p>
                            <p className="m-0 text-[14px]">※ 상기 테스트는 모두 자사 제품으로 비교 실험하였습니다</p>
                        </div>
                    </div>
                </div>

                {/* ═══ 건강을 먼저 생각하는 친환경 바닥재 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">건강을 먼저 생각하는 친환경 바닥재</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">
                                건강친화형 주택건설 기준(TVOC, HCHO 방출량 기준)보다<br />
                                유해물질을 최소화 하였으며, 프탈레이트계 가소제와 중금속 수치가 불검출 수준으로 안전합니다.
                            </p>
                        </div>
                        <div className="mb-[20px]">
                            <ul className="flex justify-start list-none p-0" style={{ margin: '0 -5px' }}>
                                <li className="mx-[5px] bg-[#f5f5f5]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[10px] text-[14px] font-bold text-center bg-white">LX Z:IN 바닥재 하우스 타일 베이직, 풀</p>
                                    <div className="bg-[#f5f5f5]">
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/094640cb-0bff-4ab0-b676-88c00ce18afd.jpg" alt="LX Z:IN 바닥재 하우스 타일 베이직, 풀" className="block m-0 w-full" />
                                    </div>
                                </li>
                                <li className="mx-[5px] bg-[#f5f5f5]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[10px] text-[14px] font-bold text-center bg-white">프탈레이트, 중금속</p>
                                    <div className="bg-[#f5f5f5]">
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/e8b64c44-f5de-4e38-ae5e-6baff43f2aef.jpg" alt="프탈레이트, 중금속 불검출" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>
                                                · 프탈레이트계 가소제 함량 (weight %)<br />
                                                프탈레이트계 가소제 : DEHP, DBP, BBP, DIDP, DNOP, DINP, DIBP
                                            </p>
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>
                                                · 중금속 함량 (ppm : mg/kg)<br />
                                                중금속 : 카드뮴 (cd), 납 (Pb), 수은 (Hg), 크로뮴 (Cr6+)
                                            </p>
                                            <p className="m-0 pl-[8px] pt-[20px] text-[14px]" style={{ textIndent: '-10px' }}>※ 불검출 = 검출 한계수치 미만</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="mb-[50px]">
                            <p className="m-0 text-[14px]">※ LX하우시스 자체 테스트 결과 및 외부 공인기관 테스트 결과로 비교시료 사양 및 실험방법, 환경에 따라 차이가 날 수 있습니다.</p>
                            <p className="m-0 text-[14px]">※ 상기 테스트는 모두 자사 제품으로 비교 실험하였습니다.</p>
                        </div>
                    </div>
                </div>

                {/* ═══ 스트레스 걱정 줄여주는 바닥재 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">스트레스 걱정 줄여주는 바닥재</p>
                            <p className="m-0 pt-[20px] text-[14px] text-center">내수성, 내스크래치성, 내마모성, 열전도성, 미끄럼 저항성이 마루 대비 우수합니다.</p>
                        </div>
                        <div className="mb-[20px]">
                            {/* 1행: 내수성 + 내마모성/내스크래치성 */}
                            <ul className="flex flex-wrap justify-start list-none p-0" style={{ margin: '90px -5px 0' }}>
                                <li className="mx-[5px]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[5px] text-[14px] font-bold text-center">강한 내수성으로 수분에 의한 변색 및 부풀림 방지</p>
                                    <p className="m-0 pb-[10px] text-[14px] text-center">
                                        수분에 의한 변색 및 부풀림이 거의 없는<br />Water Proof 바닥재입니다.
                                    </p>
                                    <div className="bg-[#f5f5f5]">
                                        <p className="m-0 font-bold text-[14px]" style={{ padding: '20px 16px 12px' }}>내수성 테스트</p>
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/ea261a11-2bdc-4975-8656-a515066d6311.jpg" alt="내수성 테스트" className="block m-0 w-full" />
                                    </div>
                                </li>
                                <li className="mx-[5px]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[5px] text-[14px] font-bold text-center">우수한 내마모성/내스크래치성</p>
                                    <p className="m-0 pb-[10px] text-[14px] text-center">
                                        내마모성과 내스크래치성이 뛰어나<br />유지관리가 편한 바닥재입니다.
                                    </p>
                                    <div className="bg-[#f5f5f5]">
                                        <p className="m-0 font-bold text-[14px]" style={{ padding: '20px 16px 12px' }}>내마모성 테스트</p>
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/481133fb-a9d3-49b4-84a2-1e7892d22eb3.jpg" alt="내마모성 테스트" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>* 원형 내스크래치 시험기(SCRATCH HARDNESS TESTER 413), Tip 0.5mm 기준</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#f5f5f5]">
                                        <p className="m-0 font-bold text-[14px]" style={{ padding: '20px 28px 20px' }}>내스크래치성 테스트</p>
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/343166f6-f1ad-4284-873f-98e806f3b0b4.jpg" alt="내스크래치성 테스트" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>
                                                · 테스트 방법: Erickson Test (EN438-2) 1N~10N까지 무게를<br />
                                                늘려가면서 10번씩 회전하여 표면에 일정 이상의 스크래치가<br />
                                                발생하기 시작하는 무게 체크(생활 속 패임 스크래치 검증)<br />
                                                원형 내스크래치 시험기 (Scratch Hardness Tester 413),<br />
                                                Tip 0.5mm 기준
                                            </p>
                                        </div>
                                    </div>
                                </li>
                                <li className="my-[20px] mx-[5px]" style={{ width: 'calc(100% - 10px)' }}>
                                    <p className="m-0 text-[14px]">※ LX하우시스 자체 테스트 결과로 비교시료 사양 및 실험방법, 환경에 따라 차이가 날 수 있습니다.</p>
                                    <p className="m-0 text-[14px]">※ 상기 테스트는 모두 자사 제품으로 비교 실험하였습니다.</p>
                                </li>
                            </ul>

                            {/* 2행: 열전도성 + 미끄럼 */}
                            <ul className="flex justify-start list-none p-0" style={{ margin: '90px -5px 0' }}>
                                <li className="mx-[5px]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[5px] text-[14px] font-bold text-center">바닥 열전도성이 우수한 경제적인 바닥재</p>
                                    <p className="m-0 pb-[10px] text-[14px] text-center">
                                        마루 대비 열전도성이 높아 바닥 난방에<br />더욱 효과적입니다.
                                    </p>
                                    <div className="bg-[#f5f5f5]">
                                        <p className="m-0 font-bold text-[14px]" style={{ padding: '20px 16px 0' }}>
                                            열전도율 측정 테스트[KS L 9106 준용]<br />&nbsp;
                                        </p>
                                        <img src="https://octapi.lxzin.com/imageResource/file/202409/23/a1aca4c3-b37a-4956-af64-b337f7898ac0.jpg" alt="열전도율 측정 테스트" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>· 테스트 방법: 보온체의 열전도율 측정 방법인 평판 열류계법으로 시험체의 열전도율을 측정 (제품별 동일 조건 측정을 위해 약 45mm 높이로 적층하여 테스트 진행)</p>
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>· 평균온도 23℃, 시험체 두께: 하우스 47.3mm, 강화마루 46.4mm, 합판마루 44.9mm</p>
                                        </div>
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/6acd7bdd-be18-41a2-b91c-c1ec39abd877.jpg" alt="열전도율 비교" className="block m-0 w-full" />
                                    </div>
                                    <div className="mt-[20px]">
                                        <p className="m-0 pl-[20px] text-[14px]" style={{ textIndent: '-20px' }}>※ FITI시험연구원 실험실 샘플 테스트 결과로 비교 시료 사양 및 실험방법,<br />환경에 따라 차이가 날 수 있습니다.</p>
                                        <p className="m-0 pl-[20px] text-[14px]" style={{ textIndent: '-20px' }}>※ 상기 테스트는 모두 자사 제품으로 비교 실험하였습니다.</p>
                                    </div>
                                </li>
                                <li className="mx-[5px]" style={{ width: 'calc(50% - 10px)' }}>
                                    <p className="m-0 pb-[5px] text-[14px] font-bold text-center">바닥 열전도성이 우수한 경제적인 바닥재</p>
                                    <p className="m-0 pb-[10px] text-[14px] text-center">
                                        마루 대비 열전도성이 높아 바닥 난방에<br />더욱 효과적입니다.
                                    </p>
                                    <div className="bg-[#f5f5f5]">
                                        <p className="m-0 font-bold text-[14px]" style={{ padding: '20px 16px 0' }}>
                                            미끄럼 테스트<br />[KS M 3802 : 2022, Slider 55] BPN
                                        </p>
                                        <img src="https://octapi.lxzin.com/imageResource/file/202504/29/78715660-02c2-4ac2-ac1b-e615cf14804f.jpg" alt="미끄럼 테스트" className="block m-0 w-full" />
                                        <div className="py-[20px] px-[28px]">
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>· BPN : British Pendulum Number</p>
                                            <p className="m-0 pl-[8px] text-[14px]" style={{ textIndent: '-10px' }}>· DP : 건식, WP : 습식</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ═══ 인증 & 수상 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                    <div className="w-full max-w-[970px]">
                        <div className="mb-[50px]">
                            <p className="m-0 text-[43px] font-bold text-center">인증 &amp; 수상</p>
                        </div>
                        <div className="mb-[20px]">
                            <table className="mt-[20px] w-full border-collapse box-border">
                                <colgroup>
                                    <col width="50%" />
                                    <col width="50%" />
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <td className="py-[25px] px-[20px] bg-white border border-[#f1f1f1]">
                                            <img src="https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg" alt="2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위" className="block mx-auto" style={{ width: '152px' }} />
                                        </td>
                                        <td className="py-[25px] px-[20px] bg-white border border-[#f1f1f1]">
                                            <img src="https://octapi.lxzin.com/imageResource/file/202409/23/a796864d-c4e4-4616-a160-1af3b775e349.png" alt="Floorscore 인증" className="block mx-auto" style={{ width: '120px' }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-[25px] px-[20px] text-[#ababab] text-[14px] text-center bg-[#fbfbfb] border border-[#f1f1f1]">
                                            2025 한국산업의 브랜드파워(K-BPI) 조사<br />가정용 바닥재 부문 1위
                                        </td>
                                        <td className="py-[25px] px-[20px] text-[#ababab] text-[14px] text-center bg-[#fbfbfb] border border-[#f1f1f1]">
                                            국제 실내 공기질 인증제도인 Floorscore 인증을 획득
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-[25px] px-[20px] bg-white border border-[#f1f1f1]">
                                            <img src="https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png" alt="환경표지인증" className="block mx-auto" style={{ width: '224px' }} />
                                        </td>
                                        <td className="py-[25px] px-[20px] bg-white border border-[#f1f1f1]">
                                            <img src="https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png" alt="실내표지" className="block mx-auto" style={{ width: '92px' }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-[25px] px-[20px] text-[#ababab] text-[14px] text-center bg-[#fbfbfb] border border-[#f1f1f1]">
                                            환경표지인증
                                        </td>
                                        <td className="py-[25px] px-[20px] text-[#ababab] text-[14px] text-center bg-[#fbfbfb] border border-[#f1f1f1]">
                                            실내표지
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mb-[50px]">
                            <p className="m-0 text-[14px]">※ Floorscore는 엄격한 환경 유해 물질 함량 및 방출량 기준을 만족한 제품에 한하여 인증을 부여함</p>
                        </div>
                    </div>
                </div>

                {/* ═══ 주의사항 ═══ */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center mb-[100px]">
                    <div className="w-full max-w-[960px]">
                        <div className="mb-[60px]">
                            <p className="m-0 text-[48px] font-black text-center text-[#222]">주의사항</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:p-8">
                            <div className="bg-[#f9f9f9] p-6 md:p-8 rounded-2xl border border-[#eee]">
                                <p className="m-0 pb-[30px] text-[30px] font-black text-[#222] flex items-center">
                                    <span className="mr-4 text-[14px] text-[#826a5d]">!</span> 사용 시 주의사항
                                </p>
                                {[
                                    "물, 기름 등은 미끄러울 수 있으니 즉시 제거하십시오. 특히 노약자나 임산부는 주의하십시오.",
                                    "시공 후 초기에는 제품 특유의 냄새가 있을 수 있으니 충분히 환기시키십시오.",
                                    "실제 제품 색상은 샘플 색상과 차이가 날 수 있으며 조명의 종류 및 각도에 따라 달라 보일 수 있습니다.",
                                    "샘플북에 수록된 인덱스 및 이미지는 실제 제품과 다소 색상 및 무늬가 차이가 날 수 있습니다.",
                                    "자연스러움을 구현하기 위하여 디자인적으로 제품 내 색상 차이가 있습니다. (제품 내 그라데이션 적용)",
                                    "손 소독제, 알코올 등이 떨어졌을 때는 즉시 제거하고, 제거되지 않는 오염은 중성세제를 묻힌 천이나 스폰지를 사용하여 제거하십시오.",
                                    "출입구에 매트를 깔아 모래, 흙, 먼지 등의 유입을 막아 주십시오.",
                                    "놀이방 매트, 쿠션 매트 등을 장기간 방치 시 바닥재 표면의 변색을 유발할 수 있으니 유의바랍니다.",
                                    "가구, 의자 등 중량물 이동 시 밀거나 끌어서는 절대 안 됩니다.",
                                    "스팀 청소기 사용 시 한 곳을 집중적으로 스팀에 노출시키면 표면이 손상될 수 있습니다.",
                                    "직사광선에 지나치게 노출 시, 제품 표면이 변색될 수 있으므로 주의 바랍니다."
                                ].map((item, i) => (
                                    <span key={i} className="block pl-[12px] text-[14px] leading-[1.8] text-[#444] mb-3" style={{ textIndent: '-12px' }}>• {item}</span>
                                ))}
                            </div>
                            <div className="bg-[#f9f9f9] p-6 md:p-8 rounded-2xl border border-[#eee]">
                                <p className="m-0 pb-[30px] text-[30px] font-black text-[#222] flex items-center">
                                    <span className="mr-4 text-[14px] text-[#826a5d]">!</span> 시공 시 주의사항
                                </p>
                                {[
                                    "시공 전 LX하우시스 시공가이드를 반드시 숙지하여 주십시오.",
                                    "생산 LOT별로 구분하여 시공하여 주십시오.",
                                    "① 무거운 제품입니다. 취급할 때 조심하십시오.",
                                    "② 제품이 세워져 있는 공간에서 작업을 금합니다. 제품이 쓰러져 다칠 수 있습니다.",
                                    "③ 시공 전 반드시 바닥 수평 상태를 확인하고 시공하십시오.",
                                    "④ 바닥에 먼지, 모래, 기름기가 없도록 청소를 철저히 하십시오.",
                                    "⑤ 표면이 더러워졌을 경우 헝겊이나 휴지로 바로 닦아 주십시오.",
                                    "장시간 방치 시 오염이 될 수 있습니다.",
                                    "접착제 및 용착제 사용 시 환기를 한 후 보호장갑과 마스크를 착용하십시오.",
                                    "* 접착제 사용 시: 인체에 유해할 수 있으니 냄새를 맡지 마시고 환기를 잘 시켜 주십시오. 인화성이 있으므로 화재에 유의하십시오."
                                ].map((item, i) => (
                                    <span key={i} className="block pl-[12px] text-[14px] leading-[1.8] text-[#444] mb-3" style={{ textIndent: '-12px' }}>• {item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TileFeature;
