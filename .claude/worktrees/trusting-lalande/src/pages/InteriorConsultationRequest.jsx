import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsultationStore } from '../store/useConsultationStore';
import { useToastStore } from '../store/useToastStore';
import DaumPostcode from 'react-daum-postcode';

export default function InteriorConsultationRequest() {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Append main address to form data before checking
        formData.append('addressMain', addressObj.address ? `[${addressObj.zonecode}] ${addressObj.address}` : '');

        const data = Object.fromEntries(formData.entries());

        if (!data.privacy) {
            addToast('개인정보 수집 및 이용에 동의해주세요.', 'error');
            return;
        }

        await addConsultation(data);
        addToast('상담 신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.');
        navigate('/');
    };

    return (
        <>
            {/* 우편번호 검색 모달 */}
            {isPostcodeOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsPostcodeOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                주소 검색
                            </h3>
                            <button type="button" onClick={() => setIsPostcodeOpen(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">close</button>
                        </div>
                        <DaumPostcode onComplete={handleComplete} style={{ height: '450px' }} />
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col items-center py-12 px-6">
                <div className="max-w-3xl w-full">
                    {/* 상단 네비게이션 / 뒤로가기 */}
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span className="text-sm font-bold">뒤로가기</span>
                        </button>
                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
                            <span className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" onClick={() => navigate('/')}>홈</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-slate-900 dark:text-slate-100">시공 상담 신청</span>
                        </div>
                    </div>

                    <div className="mb-12">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-10 -translate-y-1/2"></div>
                            <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-background-dark px-4">
                                <div className="size-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 border-primary text-primary font-bold">1</div>
                                <span className="text-xs font-bold text-primary">정보 입력</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-background-dark px-4">
                                <div className="size-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400">2</div>
                                <span className="text-xs font-medium text-slate-400">상담 예약</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-background-dark px-4">
                                <div className="size-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400">3</div>
                                <span className="text-xs font-medium text-slate-400">신청 완료</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="mb-10">
                                <h1 className="text-3xl font-black tracking-tight mb-3">전문가 무료 상담 신청</h1>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">바닥재 선택부터 시공까지, 전문가가 직접 도와드립니다.<br />신청 내용을 남겨주시면 24시간 이내에 담당자가 연락드립니다.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <span className="size-2 bg-primary rounded-full"></span>
                                        신청자 정보
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">성함</label>
                                            <input name="name" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="성함을 입력해주세요" type="text" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">연락처</label>
                                            <input name="phone" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="010-0000-0000" type="tel" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">주소</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                                                placeholder="우편번호 및 주소 검색"
                                                readOnly
                                                type="text"
                                                value={addressObj.address ? `[${addressObj.zonecode}] ${addressObj.address}` : ''}
                                                onClick={() => setIsPostcodeOpen(true)}
                                                required={!addressObj.address}
                                            />
                                            <button
                                                className="px-6 py-3.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl whitespace-nowrap hover:bg-slate-700 transition-colors"
                                                type="button"
                                                onClick={() => setIsPostcodeOpen(true)}
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input name="addressDetail" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all mt-2" placeholder="상세 주소를 입력해주세요" type="text" />
                                    </div>
                                </div>
                                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <span className="size-2 bg-primary rounded-full"></span>
                                        시공 세부 사항
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">관심 제품</label>
                                            <div className="relative">
                                                <select name="productType" required defaultValue="" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all bg-none">
                                                    <option disabled value="">제품군 선택</option>
                                                    <option value="sheet">시트 (장판)</option>
                                                    <option value="tile">타일</option>
                                                    <option value="editon">에디톤 (고급 석재 보드)</option>
                                                    <option value="lvt">LVT (럭셔리 비닐 타일)</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">예상 평수</label>
                                            <div className="flex gap-2">
                                                <input name="areaSize" required className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="숫자만 입력" type="number" />
                                                <div className="flex items-center px-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400">평</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">상담 희망 내용</label>
                                        <textarea name="details" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none" placeholder="시공 일정, 현장 특이사항, 선호하는 스타일 등 궁금하신 내용을 상세히 적어주세요." rows={4}></textarea>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input name="privacy" className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary focus:ring-offset-0" id="privacy" type="checkbox" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100" htmlFor="privacy">
                                                개인정보 수집 및 이용 동의 (필수)
                                            </label>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">상담 신청 및 안내를 위해 성함, 연락처, 주소 정보를 수집하며, 상담 완료 시까지 보유합니다.</p>
                                        </div>
                                        <button className="text-xs text-slate-400 underline underline-offset-2 hover:text-primary" type="button">전문보기</button>
                                    </div>
                                </div>
                                <button className="w-full py-5 bg-primary text-slate-900 font-black text-xl rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0" type="submit">
                                    상담 신청 완료하기
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">verified_user</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">신뢰할 수 있는 전문가</h4>
                                <p className="text-xs text-slate-500 mt-0.5">10년 이상의 베테랑 시공팀</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">speed</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">빠른 방문 및 상담</h4>
                                <p className="text-xs text-slate-500 mt-0.5">신청 후 24시간 내 매칭</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">security</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">철저한 사후 관리</h4>
                                <p className="text-xs text-slate-500 mt-0.5">최대 3년 무상 A/S 보장</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
