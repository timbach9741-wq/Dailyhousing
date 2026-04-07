import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsultationStore } from '../store/useConsultationStore';
import { useToastStore } from '../store/useToastStore';
import DaumPostcode from 'react-daum-postcode';

export default function QuantityInquiry() {
    const { addConsultation } = useConsultationStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();

    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [addressObj, setAddressObj] = useState({ zonecode: '', address: '' });

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setAddressObj({
            zonecode: data.zonecode,
            address: fullAddress
        });
        setIsPostcodeOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Append main address to form data before checking
        formData.append('addressMain', addressObj.address ? `[${addressObj.zonecode}] ${addressObj.address}` : '');

        const data = Object.fromEntries(formData.entries());

        if (!data.privacy) {
            addToast('개인정보 수집 및 이용에 동의해주세요.', 'error');
            return;
        }

        // Tag this specifically as a quantity inquiry
        addConsultation({ ...data, type: 'quantity_inquiry' });
        addToast('현장 물량문의가 접수되었습니다. 담당자가 곧 연락드리겠습니다.');
        navigate('/');
    };

    return (
        <>
            {/* 우편번호 검색 모달 */}
            {isPostcodeOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsPostcodeOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#d4a853]">location_on</span>
                                주소 검색
                            </h3>
                            <button type="button" onClick={() => setIsPostcodeOpen(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-800 transition-colors">close</button>
                        </div>
                        <DaumPostcode onComplete={handleComplete} style={{ height: '450px' }} />
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col items-center py-12 px-6 bg-slate-50/50">
                <div className="max-w-3xl w-full">
                    {/* 상단 네비게이션 / 뒤로가기 */}
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span className="text-sm font-bold">뒤로가기</span>
                        </button>
                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
                            <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/')}>홈</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-slate-900">현장 물량문의</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-black tracking-tight mb-3 text-slate-900">현장 물량문의</h1>
                                <p className="text-slate-500 leading-relaxed">
                                    정확한 자제 산출부터 물류 배송까지,<br />
                                    데일리하우징 전문가가 신속하게 답변해 드립니다.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">

                                {/* 고객 정보 */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
                                        <span className="text-[#d4a853] material-symbols-outlined">person</span>
                                        고객님의 정보를 입력해주세요
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-slate-700">성함 <span className="text-red-500">*</span></label>
                                            <input name="name" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all" placeholder="성함을 입력해주세요" type="text" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-slate-700">연락처 <span className="text-red-500">*</span></label>
                                            <input name="phone" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all" placeholder="010-0000-0000" type="tel" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-slate-700">시공 현장 주소 <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all text-slate-700 cursor-pointer"
                                                placeholder="우편번호 및 주소 검색"
                                                readOnly
                                                type="text"
                                                value={addressObj.address ? `[${addressObj.zonecode}] ${addressObj.address}` : ''}
                                                onClick={() => setIsPostcodeOpen(true)}
                                                required={!addressObj.address}
                                            />
                                            <button
                                                className="px-6 py-3.5 bg-slate-800 text-white font-bold rounded-xl whitespace-nowrap hover:bg-[#d4a853] transition-colors"
                                                type="button"
                                                onClick={() => setIsPostcodeOpen(true)}
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input name="addressDetail" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all mt-2" placeholder="상세 주소를 입력해주세요" type="text" />
                                    </div>
                                </div>

                                {/* 일정 및 내용 */}
                                <div className="space-y-6 pt-2">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
                                        <span className="text-[#d4a853] material-symbols-outlined">calendar_month</span>
                                        시공일정 및 상담요청 내용을 남겨주세요
                                    </h3>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-slate-700">시공 희망일 <span className="text-slate-400 font-normal ml-2">(선택)</span></label>
                                        <input name="expectedDate" className="w-full md:w-1/2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all text-slate-700" type="date" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-slate-700">문의 제품 및 모델명 <span className="text-slate-400 font-normal ml-2">(선택)</span></label>
                                        <input name="productInfo" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all" placeholder="예: 에디톤 스톤, ZS83051 등 아시는 정보를 적어주세요." type="text" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-slate-700">상담 요청 내용 <span className="text-red-500">*</span></label>
                                        <textarea name="details" required className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all resize-none" placeholder="도면 유무, 엘리베이터 유무, 시공 현장 특이사항 등을 상세히 적어주시면 더 빠르고 정확한 물량 산출이 가능합니다." rows={6}></textarea>
                                    </div>
                                </div>

                                {/* 개인정보 동의 */}
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl md:flex md:items-center md:justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input name="privacy" className="w-5 h-5 rounded border-slate-300 text-[#d4a853] focus:ring-[#d4a853] focus:ring-offset-0 cursor-pointer" id="privacy" type="checkbox" />
                                        </div>
                                        <div className="flex-1 cursor-pointer">
                                            <label className="text-[15px] font-bold text-slate-900 cursor-pointer select-none" htmlFor="privacy">
                                                개인정보 수집 및 이용 동의 <span className="text-[#d4a853]">(필수)</span>
                                            </label>
                                            <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                                                현장 물량 산출 및 상담 안내를 위해 성함, 연락처, 주소 정보를 수집하며, 목적 달성 시 파기합니다.
                                            </p>
                                        </div>
                                    </div>
                                    <button className="mt-4 md:mt-0 px-4 py-2 text-[13px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0" type="button">
                                        전문보기
                                    </button>
                                </div>

                                <button className="w-full py-5 bg-slate-900 text-white font-bold text-[18px] rounded-2xl transition-all hover:bg-[#d4a853] hover:shadow-xl hover:shadow-[#d4a853]/20 hover:-translate-y-1 active:translate-y-0" type="submit">
                                    물량 및 견적 문의하기
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
