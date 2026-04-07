import React from 'react';

/**
 * 상업용 바닥재 베이직 보타닉 상세 정보 컴포넌트
 * 원본 사이트: https://www.lxzin.com/zin/product/12877
 */
const CommercialBotanicFeature = () => {
    return (
        <div className="w-full bg-white">
            {/* 1. 인트로 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold mb-[20px]">LX Z:IN 바닥재 LVT 베이직 3T</h2>
                        <p className="text-[14px] text-[#222]">실용적이고 경제적인 타일 바닥재, LX Z:IN 바닥재 LVT 베이직 3T입니다.</p>
                    </div>
                    <div className="mb-[20px]">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/17/3c665038-7615-460e-9332-9decbd414e12.png"
                            alt="LX Z:IN 바닥재 LVT 베이직 3T"
                            className="w-full h-auto"
                        />
                    </div>
                    <ul className="flex flex-wrap justify-between gap-[10px] mt-[20px]">
                        <li className="flex-1 min-w-[300px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/c3082596-47ce-4284-a444-19c1a27c19cc.png"
                                alt="합리적인 가격 우수한 경제성"
                                className="w-auto h-auto mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                합리적인 가격 <span className="block text-[14px] font-bold">우수한 경제성</span>
                            </p>
                        </li>
                        <li className="flex-1 min-w-[300px] border border-[#f1f1f1] p-[25px_20px] flex items-center justify-center bg-white">
                            <img
                                src="https://octapi.lxzin.com/imageResource/file/202511/17/7018107c-4d91-40a3-b65c-bd67245cb76b.png"
                                alt="실용적인 공간을 완성하는 다양한 디자인"
                                className="w-auto h-auto mr-[15px]"
                            />
                            <p className="text-[14px] text-[#222]">
                                실용적인 공간을 완성하는 <span className="block text-[14px] font-bold">다양한 디자인</span>
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
                        <p className="text-[14px] text-[#222]">표면 처리층, 보호 필름층, 인쇄층, Base층, Balance층으로 구성되어 있습니다.</p>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src="https://octapi.lxzin.com/imageResource/file/202511/17/88ff953e-4783-4464-8205-b5702ab6e740.png"
                            alt="제품 구조도"
                            className="max-w-full h-auto"
                        />
                    </div>
                </div>
            </div>

            {/* 3. 인증 섹션 */}
            <div className="w-full flex flex-col items-center py-[100px] bg-white border-t border-[#f1f1f1]">
                <div className="max-w-[970px] w-full px-4">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-[43px] font-bold">인증</h2>
                    </div>
                    <div className="mb-[20px]">
                        <div className="grid grid-cols-2 border-collapse">
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img src="https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png" alt="환경표지인증" className="w-[224px] h-auto mb-[15px]" />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">환경표지인증<br />한국환경산업기술원</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img src="https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png" alt="실내표지" className="w-[92px] h-auto mb-[15px]" />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">실내표지</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 border-collapse mt-[-1px]">
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img src="https://octapi.lxzin.com/imageResource/file/202511/21/871ba81a-a274-40c9-be9e-5acfa657d8bc.png" alt="Floor score" className="w-[224px] h-auto mb-[15px]" />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(Floor score)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img src="https://octapi.lxzin.com/imageResource/file/202511/21/1d821d16-5aaa-4926-bc37-69bd59f9aece.png" alt="Green Guard" className="w-[224px] h-auto mb-[15px]" />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(Green Guard)</p>
                            </div>
                            <div className="border border-[#f1f1f1] p-[25px_20px] flex flex-col items-center justify-center bg-white">
                                <img src="https://octapi.lxzin.com/imageResource/file/202511/21/5bd4a9a8-bacb-4ad6-8dbd-57a2011ca24b.png" alt="EPD" className="w-[152px] h-auto mb-[15px]" />
                                <p className="text-[14px] text-[#ababab] text-center bg-[#fbfbfb] w-full py-[10px] border-t border-[#f1f1f1]">글로벌인증<br />(EPD)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommercialBotanicFeature;
