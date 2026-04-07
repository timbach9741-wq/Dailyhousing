import React from 'react';

/**
 * 상업용 바닥재 LVT 프리미엄 5T(프레스티지) 상세 정보 컴포넌트
 * 원본 사이트: https://www.lxzin.com/zin/product/101748
 * 마지막 동기화: 2026-03-15
 */
const CommercialPrestigeFeature = () => {
    return (
        <div className="w-full bg-white">
            {/* 1. 인트로 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[5px]">LX Z:IN 바닥재</h2>
                        <h2 className="text-[43px] font-bold mb-[20px]">LVT 프리미엄 5T 프레스티지</h2>
                        <p className="text-[14px] text-[#222]">깊이감 있는 디자인을 통해 아름다우면서 자연스러운 분위기를 만들어 냅니다.</p>
                    </div>
                    <div className="mb-[20px]">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/05/3587a821-f7cd-407b-b932-5605acd6b856.png"
                            alt="LVT 프리미엄 5T 프레스티지"
                            className="w-full h-auto"
                        />
                    </div>
                    <ul className="flex flex-wrap justify-between gap-[10px] mt-[20px]">
                        <li className="flex-1 min-w-[280px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/590fedf6-8098-47ac-823b-1f5c982d8d43.png"
                                alt="스크래치에 강한 고강도 표면 코팅"
                                className="w-[60px] h-[60px] flex-shrink-0 mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                스크래치에 강한 <span className="block text-[14px] font-bold">고강도 표면 코팅</span>
                            </p>
                        </li>
                        <li className="flex-1 min-w-[280px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/95bc0fbe-ddb9-40a7-a171-780458bd7d68.png"
                                alt="바닥 굴곡을 최소화하는 전사방지 기술"
                                className="w-[60px] h-[60px] flex-shrink-0 mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                바닥 굴곡을 최소화하는 <span className="block text-[14px] font-bold">전사방지 기술</span>
                            </p>
                        </li>
                        <li className="flex-1 min-w-[280px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/3a865ba1-a196-4cc7-8ac8-ca1d8d0eaef8.png"
                                alt="와이드한 디자인으로 더 풍부한 무늬 표현"
                                className="w-[60px] h-[60px] flex-shrink-0 mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                와이드한 디자인으로 <span className="block text-[14px] font-bold">더 풍부한 무늬 표현</span>
                            </p>
                        </li>
                    </ul>
                </div>
            </div>

            {/* 2. 제품 구조도 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">제품 구조도</h2>
                        <p className="text-[14px] text-[#222]">고강도 표면처리, 고내구성 EIR 표면층, 고해상도 디자인층, 전사방지층, Base층, 전사방지/Balance층으로 구성되어 있습니다.</p>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/05/25b8df1e-12e5-41d6-8ad5-b27308c9a6ec.png"
                            alt="제품 구조도"
                            className="max-w-full h-auto"
                        />
                    </div>
                </div>
            </div>

            {/* 3. 스크래치에 강한 고강도 표면코팅 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">스크래치에 강한 고강도 표면코팅</h2>
                        <p className="text-[14px] text-[#222]">고강도 표면코팅 기술로 일반 표면코팅 대비 내구성이 우수하고 스크래치에 강합니다.</p>
                        <p className="text-[12px] text-[#999] mt-[10px]">※ LX하우시스 연구소 자체 Test 기준이며, 실제 환경에 따라 다를 수 있음</p>
                    </div>
                    <div className="bg-[#f5f5f5] p-[40px] mb-[30px] flex items-start gap-[30px]">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/05/77cffd03-ef4a-4216-9b33-596d0bf7a945.png"
                            alt="MARTINDALE TEST 장비"
                            className="w-[200px] h-auto flex-shrink-0"
                        />
                        <div>
                            <h3 className="text-[18px] font-bold mb-[10px]">[MARTINDALE TEST] EN16094</h3>
                            <p className="text-[14px] text-[#222] mb-[10px]">제품을 놓고 스크래치 패드(Scotch Brite Fleece SB7440)로 4N의 힘을 가하여 160회 회전</p>
                            <p className="text-[13px] text-[#999]">B1 = 스크래치가 없음 / B2 = 스크래치가 거의 없음<br/>B3 = 스크래치가 많음 / B4 = 아주 많은 스크래치<br/>B5 = 상하좌우로 복합된 스크래치가 아주 많음</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-[10px]">
                        <div className="text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/64595754-2dd0-440d-9aff-aad7c722a446.png"
                                alt="기존 자사 보타닉 : B5"
                                className="w-full h-auto"
                            />
                            <p className="text-[14px] text-[#222] mt-[10px]">기존 자사 보타닉 : B5</p>
                        </div>
                        <div className="text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/feab3769-401c-45d2-8340-88651a2a13b8.png"
                                alt="PRESTG : B1"
                                className="w-full h-auto"
                            />
                            <p className="text-[14px] text-[#222] mt-[10px]">PRESTG : B1</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 바닥 굴곡을 최소화하는 전사방지 기술 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">바닥 굴곡을 최소화하는 전사방지 기술</h2>
                        <p className="text-[14px] text-[#222]">바닥전사 방지층을 적용하여 바닥 굴곡이 기존 데코타일 대비 잘 드러나지 않습니다.</p>
                    </div>
                    <div className="bg-[#f5f5f5] p-[40px]">
                        <div className="grid grid-cols-2 gap-[10px]">
                            <div>
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/07/32718a6f-abdc-4a69-a3f7-ae4dac9dad0f.png"
                                    alt="기존 자사 3T LVT"
                                    className="w-full h-auto"
                                />
                                <p className="text-[14px] text-[#222] mt-[10px]">기존 자사 3T LVT</p>
                            </div>
                            <div>
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/07/26ce2ed7-385b-4d39-8c7a-7ea36d8bf8cd.png"
                                    alt="PRESTG"
                                    className="w-full h-auto"
                                />
                                <p className="text-[14px] text-[#222] mt-[10px]">PRESTG</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. 와이드한 디자인으로 더 풍부한 무늬 표현 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">와이드한 디자인으로 더 풍부한 무늬 표현</h2>
                        <p className="text-[14px] text-[#222]">기존 일반 LVT 대비 폭과 길이가 더 커진 디자인으로 고급 원목의 수려한 무늬를 더 풍부하게 표현합니다.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-full mb-[5px]">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/37144b7e-84cb-41d9-8213-a703371973dc.png"
                                alt="기존 일반 LVT 규격"
                                className="max-w-full h-auto"
                            />
                            <p className="text-[14px] text-[#222] mt-[5px]">기존 일반 LVT : 3.0mm(T) x 180mm(W) x 920mm(L)</p>
                        </div>
                        <div className="w-full relative">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/1ccb552b-93ad-443f-a789-ed8aadc1c819.png"
                                alt="약 2배 UP"
                                className="absolute right-0 top-[-20px] w-[80px] h-auto z-10"
                            />
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/d5d5b32b-53f0-4d09-8e9e-c53a370c8e27.png"
                                alt="PRESTG 규격"
                                className="max-w-full h-auto"
                            />
                            <p className="text-[14px] text-[#222] mt-[5px]">PRESTG : 5.0mm(T) x 228.6mm(W) x 1523mm(L)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. 동조엠보 기술로 느껴지는 자연스러운 텍스처 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">동조엠보 기술로 느껴지는 자연스러운 텍스처</h2>
                        <p className="text-[14px] text-[#222]">디자인 무늬와 표면엠보를 일치시키는 동조엠보 기술 적용으로 보다 사실적인 텍스처를 구현합니다.</p>
                    </div>
                    <div className="bg-[#f5f5f5] p-[40px] mb-[30px] text-center">
                        <h3 className="text-[18px] font-bold mb-[10px]">동조엠보(*EIR) 기술</h3>
                        <p className="text-[14px] text-[#222] mb-[10px]">디자인 무늬와 표면엠보가 일치하여 질감을 사실적으로 구현하는 기술</p>
                        <p className="text-[12px] text-[#999]">* EIR : Embossed in Register</p>
                        <p className="text-[12px] text-[#999]">* 해당 이미지는 이미지컷으로 실제 제품과 달라 보일 수 있습니다. 필히 원장을 확인하시고 제품을 선택해 주시기 바랍니다.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-[10px]">
                        <div className="text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/acf1a584-1b65-4eeb-87af-d64a68da89cb.png"
                                alt="PTW7964 아메리칸 오크 클로즈업"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/d559886b-1be9-4bc7-8acd-4f09502bc33e.png"
                                alt="PTW7964 아메리칸 오크 시공사례"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                    <p className="text-[14px] text-[#222] mt-[10px]">PTW7964 아메리칸 오크</p>
                </div>
            </div>

            {/* 7. 섬세한 무늬 인쇄기술로 더욱 선명한 패턴 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">섬세한 무늬 인쇄기술로 더욱 선명한 패턴</h2>
                        <p className="text-[14px] text-[#222]">기존의 인쇄방식에서 벗어나 고해상도 인쇄 적용을 통해 소재의 Reality를 더욱 세밀하게 표현합니다.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-[10px]">
                        <div className="text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/8d544bc1-359e-4b5c-9621-76d262e10c1b.png"
                                alt="기존 일반제품"
                                className="w-full h-auto"
                            />
                            <p className="text-[14px] text-[#222] mt-[10px]">기존 일반제품</p>
                        </div>
                        <div className="text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/05/c5db6ffd-06cf-4c0b-9263-27eed865e49c.png"
                                alt="PRESTG (고해상도 디자인)"
                                className="w-full h-auto"
                            />
                            <p className="text-[14px] text-[#222] mt-[10px]">PRESTG (고해상도 디자인)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8. 인증 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold">인증</h2>
                    </div>
                    <div className="mb-[20px]">
                        <div className="grid grid-cols-2 border-collapse">
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png"
                                    alt="환경표지인증"
                                    className="w-[224px] h-auto mb-[15px]"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">환경표지인증<br />(한국환경산업기술원)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png"
                                    alt="실내표지"
                                    className="w-[224px] h-auto mb-[15px]"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">실내표지</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 border-collapse mt-[-1px]">
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/871ba81a-a274-40c9-be9e-5acfa657d8bc.png"
                                    alt="글로벌인증 Floor score"
                                    className="w-[224px] h-auto mb-[15px]"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(Floor score)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/1d821d16-5aaa-4926-bc37-69bd59f9aece.png"
                                    alt="글로벌인증 Green Guard"
                                    className="w-[224px] h-auto mb-[15px]"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(Green Guard)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/5bd4a9a8-bacb-4ad6-8dbd-57a2011ca24b.png"
                                    alt="글로벌인증 EPD"
                                    className="w-[224px] h-auto mb-[15px]"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(EPD)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommercialPrestigeFeature;
