import React from 'react';

/**
 * 상업용 바닥재 LVT 스탠다드 3T(에코노플러스) 상세 정보 컴포넌트
 * 공식 사이트: https://www.lxzin.com/zin/product/101752
 * 공식 페이지와 동일한 순서, 이미지, 텍스트 크기로 구성
 * 최종 업데이트: 2026-03-15
 */
const CommercialEconoFeature = () => {
    return (
        <div className="w-full bg-white">
            {/* 1. 인트로 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">LX Z:IN 바닥재 LVT 스탠다드 3T</h2>
                        <p className="text-[14px] text-[#222] leading-[1.8]">
                            미니멀하고 모던한 디자인으로 편안하면서 자연스러운 분위기를 만들어 냅니다.<br />
                            다양한 상업 공간에서 더욱 다채로운 감성을 느낄 수 있습니다.
                        </p>
                    </div>
                    <div className="mb-[20px]">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/17/f1a1f5d5-5c2e-4189-bfba-148d62a9fe9b.png"
                            alt="LVT 스탠다드 3T 에코노플러스"
                            className="w-full h-auto"
                        />
                    </div>
                    <ul className="flex flex-wrap justify-between gap-[10px] mt-[20px]">
                        <li className="flex-1 min-w-[280px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/1ee2c910-0036-40c2-9ad1-24257eb4098d.png"
                                alt="스크래치에 강한 고강도 표면 코팅"
                                className="w-[60px] h-[60px] mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                스크래치에 강한 <span className="block text-[14px] font-bold">고강도 표면 코팅</span>
                            </p>
                        </li>
                        <li className="flex-1 min-w-[280px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/7b66d6af-24c9-4b86-85cb-ed3d97d14b4a.png"
                                alt="표면 무광 효과로 더욱 고급스러운 텍스처"
                                className="w-[60px] h-[60px] mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                표면 무광 효과로 <span className="block text-[14px] font-bold">더욱 고급스러운 텍스처</span>
                            </p>
                        </li>
                        <li className="flex-1 min-w-[280px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/55a49424-36e1-4589-a844-5685a007528b.png"
                                alt="디지털 인쇄 적용으로 더욱 자연스러운 패턴"
                                className="w-[60px] h-[60px] mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                디지털 인쇄 적용으로 <span className="block text-[14px] font-bold">더욱 자연스러운 패턴</span>
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
                        <p className="text-[14px] text-[#222]">고강도 표면 처리층, 보호 필름층, 디자인층, Base층, Balance층으로 구성되어 있습니다.</p>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/17/47f4f590-7803-451b-b601-484111a8abd0.png"
                            alt="제품 구조도"
                            className="max-w-full h-auto"
                            loading="lazy"
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
                    <div className="flex flex-col md:flex-row items-start gap-[30px] mb-[40px]">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/17/4344a760-6b42-4e46-886f-52196a783fa6.png"
                            alt="MARTINDALE TEST 장비"
                            className="max-w-[300px] w-full h-auto"
                            loading="lazy"
                        />
                        <div>
                            <h3 className="text-[16px] font-bold mb-[10px]">[MARTINDALE TEST] EN16094</h3>
                            <p className="text-[14px] text-[#222] mb-[15px]">
                                제품을 놓고 스크래치 패드(Scotch Brite Fleece SB7440)로<br />
                                4N의 힘을 가하여 160회 회전
                            </p>
                            <p className="text-[13px] text-[#999]">
                                B1 = 스크래치가 없음 / B2 = 스크래치가 거의 없음<br />
                                B3 = 스크래치가 많음 / B4 = 아주 많은 스크래치<br />
                                B5 = 상하좌우로 복합된 스크래치가 아주 많음
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-0">
                        <div className="flex-1 text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/7dde6c44-3430-4a35-a0cb-0333bd004e16.png"
                                alt="기존 자사 보타닉"
                                className="w-full h-auto"
                                loading="lazy"
                            />
                            <p className="text-[14px] text-[#222] mt-[15px]">기존 자사 보타닉</p>
                        </div>
                        <div className="px-[10px] text-[30px] text-[#ccc] flex-shrink-0">›</div>
                        <div className="flex-1 text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/491be14b-6a70-4c67-a727-c16a3a750846.png"
                                alt="에코노 플러스 : B1"
                                className="w-full h-auto"
                                loading="lazy"
                            />
                            <p className="text-[14px] text-[#222] mt-[15px]">에코노 플러스 : B1</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 표면 무광 효과로 더욱 고급스러운 텍스처 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">표면 무광 효과로 더욱 고급스러운 텍스처</h2>
                        <p className="text-[14px] text-[#222]">TrueMatte, 표면 무광 기술로 포세린과 같은 고급타일에서 느낄 수 있는 질감을 전달합니다.</p>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/17/10ab41dd-b5cc-4673-ad7d-62cd0a7fa84b.png"
                            alt="TrueMatte 표면 무광 비교"
                            className="max-w-full h-auto"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>

            {/* 5. 디지털 인쇄 적용으로 더욱 자연스러운 패턴 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">디지털 인쇄 적용으로 더욱 자연스러운 패턴</h2>
                        <p className="text-[14px] text-[#222]">TrueView, 디지털 인쇄 기술로 디자인을 더욱 다채롭고 사실적으로 표현합니다.</p>
                    </div>
                    <div className="flex items-center justify-center gap-0">
                        <div className="flex-1 text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/0c302ebe-5e8a-4e3d-a137-cd1f571f4cbd.png"
                                alt="기존 인쇄 효과"
                                className="w-full h-auto"
                                loading="lazy"
                            />
                            <p className="text-[14px] text-[#222] mt-[15px]">기존 인쇄 효과</p>
                        </div>
                        <div className="px-[10px] text-[30px] text-[#ccc] flex-shrink-0">›</div>
                        <div className="flex-1 text-center">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/35d637c4-35c3-4ba7-909d-3b2dbde91bcb.png"
                                alt="디지털 인쇄 효과"
                                className="w-full h-auto"
                                loading="lazy"
                            />
                            <p className="text-[14px] text-[#222] mt-[15px]">디지털 인쇄 효과</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. 인증 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold">인증</h2>
                    </div>
                    <div className="mb-[20px]">
                        {/* 상단 인증 로고 3개 */}
                        <div className="grid grid-cols-3 border-collapse">
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png"
                                    alt="환경표지인증"
                                    className="w-[224px] h-auto mb-[15px]"
                                    loading="lazy"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">환경표지인증<br />한국환경산업기술원</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png"
                                    alt="실내표지"
                                    className="w-[92px] h-auto mb-[15px]"
                                    loading="lazy"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">실내표지</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/f5ed7fcc-c3b5-466a-9479-05a12c066455.png"
                                    alt="환경성적표지(저탄소인증)"
                                    className="w-[180px] h-auto mb-[15px]"
                                    loading="lazy"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">환경성적표지(저탄소인증)<br />한국환경산업기술원</p>
                            </div>
                        </div>
                        {/* 하단 인증서 문서 이미지 3개 */}
                        <div className="grid grid-cols-3 border-collapse mt-[-1px]">
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/871ba81a-a274-40c9-be9e-5acfa657d8bc.png"
                                    alt="Floor score"
                                    className="w-[224px] h-auto mb-[15px]"
                                    loading="lazy"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(Floor score)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/1d821d16-5aaa-4926-bc37-69bd59f9aece.png"
                                    alt="Green Guard"
                                    className="w-[224px] h-auto mb-[15px]"
                                    loading="lazy"
                                />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(Green Guard)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img
                                    src="https://octapi.lxzin.com/imageResource/file/202511/21/5bd4a9a8-bacb-4ad6-8dbd-57a2011ca24b.png"
                                    alt="EPD"
                                    className="w-[152px] h-auto mb-[15px]"
                                    loading="lazy"
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

export default CommercialEconoFeature;
