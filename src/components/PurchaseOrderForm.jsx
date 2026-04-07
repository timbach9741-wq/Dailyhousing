import React, { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { useProductStore } from '../store/useProductStore';

/* ── 기본 데이터 ── */
const defaultSupplier = {
    name: '데일리하우징 (Daily Housing)',
    bizNo: '',
    contact: '031-409-5556',
    address: ''
};

const emptyItem = { name: '', model: '', qty: '', unit: 'M', memo: '', detail: '' };

const emptyReceiver = {
    company: '', manager: '', contact: '',
    address: '', recipient: '', recipientPhone: '', siteManagerPhone: '',
    desiredDate: '', unloadCondition: ''
};

/* ── 헬퍼 ── */
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const today = () => {
    const d = new Date();
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`;
};
const todayShort = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

/* ══════════════════════════════════════════════════════════ */
/*                    PurchaseOrderForm                      */
/* ══════════════════════════════════════════════════════════ */
const PurchaseOrderForm = ({ order, onClose, onComplete }) => {
    const printRef = useRef(null);
    const allProducts = useProductStore((state) => state.products);

    /* ── 발주번호 자동 생성 ── */
    const [poNumber] = useState(() => {
        if (order?.id) return `DH-${todayShort()}-${order.id.substring(0, 4).toUpperCase()}`;
        return `DH-${todayShort()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    });

    /* ── 공급자 (데일리하우징) ── */
    const [supplier, setSupplier] = useState(() => ({
        ...defaultSupplier,
        bizNo: order?.orderId || '-'
    }));

    /* ── 수신처 (외주처/공급사) ── */
    const [receiver, setReceiver] = useState(() => {
        if (order) {
            // 기존 주문 데이터 호환: 이전 버전에서는 shippingAddress/receiverPhone/receiverName이 없을 수 있음
            const phone = order.receiverPhone || order.customerPhone || order.phone || '';
            return {
                company: '신일상제',
                manager: '',
                contact: phone,
                address: order.shippingAddress || order.address || order.deliveryAddress || '',
                recipient: order.receiverName || order.customer || order.displayName || '',
                recipientPhone: phone,
                siteManagerPhone: order.siteManagerPhone || '',
                desiredDate: order.deliveryDate || '',
                unloadCondition: order.unloadCondition || ''
            };
        }
        return { ...emptyReceiver, company: '신일상제' };
    });

    /* ── 품목 목록 ── */
    const [items, setItems] = useState(() => {
        if (order?.items?.length) {
            return order.items.map(it => {
                const sub = (it.subCategory || '').toLowerCase();
                const title = (it.title || it.productName || it.name || '').toLowerCase();
                // 기존 주문에 packaging 없으면 제품 스토어에서 조회
                let packaging = it.packaging || '';
                if (!packaging && it.productId) {
                    const found = allProducts.find(p => p.id === it.productId);
                    if (found) packaging = found.specifications?.packaging || found.packaging || '';
                }
                
                // 시트 제품 판별: 시트, 프리미엄, 스탠다드, 엑스컴포트
                const isSheet = sub.includes('시트') || sub.includes('프리미엄') || sub.includes('스탠다드') || sub.includes('엑스컴포트')
                    || title.includes('시트') || title.includes('엑스컴포트');
                
                let unit = it.unit || 'Box';
                let qty = it.qty || it.quantity || '';
                
                if (isSheet) {
                    // 시트 제품 → 롤(R) 단위
                    unit = 'R';
                    // 장바구니에서 M(미터)으로 저장된 경우 롤 수량으로 변환
                    const rollMatch = packaging.match(/(\d+)M/i);
                    const rollLength = rollMatch ? parseInt(rollMatch[1]) : 0;
                    if (rollLength > 0 && Number(qty) > rollLength) {
                        qty = Math.round(Number(qty) / rollLength);
                    }
                } else {
                    // 나머지 → 박스(Box)
                    unit = 'Box';
                }
                
                const categoryNames = [it.category || '', it.subCategory || '', packaging].filter(Boolean).join(' - ');
                const detailStr = [categoryNames, it.color_name || it.colorName].filter(Boolean).join(' / ');

                return {
                    name: title || '',
                    model: it.model_id || '',
                    qty,
                    unit,
                    memo: '',
                    detail: detailStr || ''
                };
            });
        }
        return [{ ...emptyItem }];
    });

    /* ── 특이사항 메모 ── */
    const [memo, setMemo] = useState(
        '- 본 문서는 시스템에서 자동 발행되었습니다.\n- 자재 파손 시 하차 즉시 사진 촬영 후 본사로 연락 바랍니다.'
    );

    /* ── (단가/합계 제거됨) ── */

    /* ── 품목 추가/삭제 ── */
    const addItem = () => setItems(prev => [...prev, { ...emptyItem }]);
    const removeItem = (idx) => setItems(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));
    const updateItem = (idx, key, value) => {
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: value } : it));
    };

    /* ── 인쇄 ── */
    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=900,height=1200');
        win.document.write(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>데일리하우징 발주서 - ${poNumber}</title>
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Pretendard', sans-serif; color: #333; line-height: 1.6; padding: 30px; }
        .po-container { width: 100%; max-width: 800px; margin: 0 auto; }
        .po-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 24px; }
        .po-title { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1a1a2e; }
        .po-logo-sub { font-size: 11px; color: #888; margin-top: 2px; }
        .po-info { text-align: right; font-size: 12px; color: #555; line-height: 1.8; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table th { background: #f4f6f8; width: 14%; border: 1px solid #d0d5dd; padding: 8px 10px; font-size: 12px; font-weight: 600; color: #444; text-align: center; }
        .info-table td { width: 36%; border: 1px solid #d0d5dd; padding: 8px 10px; font-size: 12px; }
        .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .item-table th { background: #1a1a2e; color: #fff; border: 1px solid #1a1a2e; padding: 10px; font-size: 12px; font-weight: 600; }
        .item-table td { border: 1px solid #d0d5dd; padding: 9px 10px; text-align: center; font-size: 12px; }
        .item-table .text-left { text-align: left; }
        .item-table .total-row { background: #f8f9fb; font-weight: 700; }
        .item-table .total-row td { border-top: 2px solid #1a1a2e; }
        .item-table tbody tr:nth-child(even) { background: #fafbfc; }
        .section-title { font-size: 14px; font-weight: 700; border-left: 4px solid #1a1a2e; padding-left: 10px; margin: 24px 0 10px; color: #1a1a2e; }
        .memo-box { border: 1px solid #d0d5dd; padding: 14px; background: #fafbfc; font-size: 12px; line-height: 1.8; white-space: pre-line; }
        .signature { text-align: center; margin-top: 50px; font-size: 16px; font-weight: 700; color: #1a1a2e; }
        .signature-line { display: inline-block; margin-top: 8px; padding: 4px 30px; border: 2px solid #c00; border-radius: 50%; color: #c00; font-weight: 800; font-size: 14px; }
        @media print {
            body { padding: 0; }
            @page { margin: 15mm; size: A4; }
        }
    </style>
</head>
<body>
${printContents}
</body>
</html>`);
        win.document.close();
        setTimeout(() => win.print(), 400);
    };

    /* ── 엑셀 다운로드 ── */
    const handleExcel = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('발주서');

        /* 열 너비 */
        ws.columns = [
            { width: 6 }, { width: 40 }, { width: 20 },
            { width: 10 }, { width: 10 }, { width: 25 }
        ];

        /* 헤더 */
        ws.mergeCells('A1:F1');
        const titleCell = ws.getCell('A1');
        titleCell.value = '발 주 서';
        titleCell.font = { bold: true, size: 20, color: { argb: 'FF1A1A2E' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 40;

        ws.mergeCells('A2:C2');
        ws.getCell('A2').value = `발주처: ${supplier.name}`;
        ws.getCell('A2').font = { size: 11 };
        ws.mergeCells('D2:F2');
        ws.getCell('D2').value = `발주번호: ${poNumber}  |  발행일: ${today()}`;
        ws.getCell('D2').font = { size: 10, color: { argb: 'FF666666' } };
        ws.getCell('D2').alignment = { horizontal: 'right' };

        /* 공급자/수신자 */
        ws.addRow([]);
        const infoHeader = ws.addRow(['', '발주처', '', '수신처', '', '']);
        infoHeader.font = { bold: true, size: 10 };
        infoHeader.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F8' } };
        infoHeader.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F8' } };

        ws.addRow(['', `업체명: ${supplier.name}`, '', `업체명: ${receiver.company}`, '', '']);
        ws.addRow(['', `연락처: ${supplier.contact}`, '', `담당자: ${receiver.manager}`, '', '']);
        ws.addRow(['', `등록번호: ${supplier.bizNo}`, '', `연락처: ${receiver.contact}`, '', '']);
        ws.addRow([]);

        /* 품목 테이블 헤더 */
        const itemHeaderRow = ws.addRow(['번호', '품명', '코드번호', '수량', '단위', '비고']);
        itemHeaderRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
        itemHeaderRow.height = 28;

        /* 품목 데이터 */
        items.forEach((it, i) => {
            const detailText = it.detail ? `\n[ ${it.detail} ]` : '';
            const row = ws.addRow([i + 1, `${it.name}${detailText}`, it.model, Number(it.qty) || 0, it.unit, it.memo]);
            row.height = 36;
            row.eachCell(cell => {
                cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                if (cell.address.indexOf('B') > -1) {
                    cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });
            if (i % 2 === 1) {
                row.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFBFC' } };
                });
            }
        });

        /* 배송 정보 */
        ws.addRow([]);
        const dlv = ws.addRow(['', '[ 배송 및 현장 정보 ]']);
        dlv.font = { bold: true, size: 11 };
        ws.addRow(['', `배송지: ${receiver.address}`]);
        ws.addRow(['', `수령인: ${receiver.recipient} (${receiver.recipientPhone})`]);
        ws.addRow(['', `납기희망일: ${receiver.desiredDate}`]);
        ws.addRow(['', `현장 관리인 연락처: ${receiver.siteManagerPhone || '없음'}`]);
        ws.addRow(['', `하차조건: ${receiver.unloadCondition}`]);
        ws.addRow([]);
        ws.addRow(['', `특이사항: ${memo.replace(/\n/g, ' | ')}`]);

        /* 다운로드 */
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `데일리하우징_발주서_${poNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /* ── 발주 완료 (상태변경 연동) ── */
    const handleComplete = () => {
        if (!order?.id) {
            alert("수동으로 작성 중인 발주서는 자동 상태 변경이 불가능합니다.");
            return;
        }
        if (window.confirm('발주를 완료하고 이 주문을 [배송중] 상태로 변경하시겠습니까? (운송장 번호가 자동 부여됩니다)')) {
            const dlvCompany = "데일리하우징 물류";
            const trackingNo = poNumber;
            if (onComplete) {
                onComplete(order.id, { deliveryCompany: dlvCompany, trackingNumber: trackingNo });
            }
        }
    };

    /* ══════════════════════════════════════════ */
    /*                    RENDER                  */
    /* ══════════════════════════════════════════ */
    return (
        <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/80 backdrop-blur-md overflow-y-auto py-8">
            {/* ── 최상단 액션 바 ── */}
            <div className="fixed top-0 left-0 right-0 z-[310] bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl">📝</span>
                    <div>
                        <h3 className="text-white font-bold text-sm">발주서 작성</h3>
                        <p className="text-slate-500 text-[11px]">{poNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/20">
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        인쇄 / PDF
                    </button>
                    <button onClick={handleExcel}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-600/20">
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        엑셀 다운로드
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button onClick={handleComplete}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-lg shadow-amber-600/20">
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                        발주 완료 (배송중 변환)
                    </button>
                    <button onClick={onClose}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/10 transition-all">
                        닫기
                    </button>
                </div>
            </div>

            {/* ── A4 용지 프리뷰 ── */}
            <div className="mt-16 w-full max-w-[860px] mx-4">
                {/* 인쇄 영역 */}
                <div ref={printRef}>
                    <div className="po-container" style={{
                        width: '100%', margin: '0 auto', padding: '40px', border: '1px solid #e0e0e0',
                        background: '#fff', borderRadius: '4px', fontFamily: "'Pretendard', sans-serif",
                        color: '#333', lineHeight: '1.6', fontSize: '13px'
                    }}>
                        {/* 헤더 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '24px' }}>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '8px', color: '#1a1a2e' }}>발 주 서</div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>PURCHASE ORDER</div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '12px', color: '#555', lineHeight: '1.8' }}>
                                주문번호: {poNumber}<br />
                                발행일자: {today()}
                            </div>
                        </div>

                        {/* 업체 정보 테이블 */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                            <tbody>
                                <tr>
                                    <th style={thStyle}>발주처</th>
                                    <td style={tdStyle}><strong>{supplier.name}</strong></td>
                                    <th style={thStyle}>수신처</th>
                                    <td style={tdStyle}><strong>{receiver.company || '(입력 필요)'}</strong></td>
                                </tr>
                                <tr>
                                    <th style={thStyle}>등록번호</th>
                                    <td style={tdStyle}>{supplier.bizNo || '-'}</td>
                                    <th style={thStyle}>담당자</th>
                                    <td style={tdStyle}>{receiver.manager || '-'}</td>
                                </tr>
                                <tr>
                                    <th style={thStyle}>연락처</th>
                                    <td style={tdStyle}>{supplier.contact}</td>
                                    <th style={thStyle}>연락처</th>
                                    <td style={tdStyle}>{receiver.contact || '-'}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 품목 테이블 */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                            <thead>
                                <tr>
                                    {['번호', '품명', '코드번호', '수량', '단위', '비고'].map(h => (
                                        <th key={h} style={itemThStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it, i) => {
                                    return (
                                        <tr key={i} style={i % 2 === 1 ? { background: '#fafbfc' } : {}}>
                                            <td style={{ ...itemTdStyle, textAlign: 'center', width: '40px' }}>{i + 1}</td>
                                            <td style={{ ...itemTdStyle, textAlign: 'left' }}>
                                                <div style={{ fontWeight: '600' }}>{it.name || '-'}</div>
                                                {it.detail && <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{it.detail}</div>}
                                            </td>
                                            <td style={{ ...itemTdStyle, textAlign: 'center', width: '20%' }}>{it.model || '-'}</td>
                                            <td style={{ ...itemTdStyle, textAlign: 'center', width: '10%' }}>{fmt(it.qty)}</td>
                                            <td style={{ ...itemTdStyle, textAlign: 'center', width: '10%' }}>{it.unit}</td>
                                            <td style={{ ...itemTdStyle, textAlign: 'left', width: '15%' }}>{it.memo || ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* 배송 및 현장 정보 */}
                        <div style={{ fontSize: '14px', fontWeight: '700', borderLeft: '4px solid #1a1a2e', paddingLeft: '10px', margin: '24px 0 10px', color: '#1a1a2e' }}>
                            배송 및 현장 정보
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                            <tbody>
                                <tr>
                                    <th style={thStyle}>배송지 주소</th>
                                    <td colSpan="3" style={tdStyle}>{receiver.address || '(입력 필요)'}</td>
                                </tr>
                                <tr>
                                    <th style={thStyle}>현장 수령인</th>
                                    <td style={tdStyle}>{receiver.recipient || '-'} {receiver.recipientPhone ? `(${receiver.recipientPhone})` : ''}</td>
                                    <th style={thStyle}>납기희망일</th>
                                    <td style={tdStyle}>{receiver.desiredDate || '-'}</td>
                                </tr>
                                <tr>
                                    <th style={thStyle}>현장 관리인 연락처</th>
                                    <td style={tdStyle}>{receiver.siteManagerPhone || '-'}</td>
                                    <th style={thStyle}>하차 조건</th>
                                    <td style={tdStyle}>{receiver.unloadCondition || '-'}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 특이사항 */}
                        <div style={{ fontSize: '14px', fontWeight: '700', borderLeft: '4px solid #1a1a2e', paddingLeft: '10px', margin: '24px 0 10px', color: '#1a1a2e' }}>
                            특이사항 및 안내
                        </div>
                        <div style={{ border: '1px solid #d0d5dd', padding: '14px', background: '#fafbfc', fontSize: '12px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                            {memo}
                        </div>

                        {/* 직인 */}
                        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>
                            데일리하우징 대표 (인)
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════ */}
                {/*         아래: 편집 가능 영역 (no-print)     */}
                {/* ══════════════════════════════════════════ */}
                <div className="mt-6 mb-12 space-y-6">
                    {/* 공급자 정보 편집 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-400 text-[18px]">business</span>
                            발주처 정보 (데일리하우징)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="업체명" value={supplier.name} onChange={v => setSupplier(p => ({ ...p, name: v }))} />
                            <InputField label="사업자등록번호" value={supplier.bizNo} onChange={v => setSupplier(p => ({ ...p, bizNo: v }))} placeholder="000-00-00000" />
                            <InputField label="연락처" value={supplier.contact} onChange={v => setSupplier(p => ({ ...p, contact: v }))} />
                            <InputField label="주소" value={supplier.address} onChange={v => setSupplier(p => ({ ...p, address: v }))} />
                        </div>
                    </div>

                    {/* 수신처 정보 편집 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-400 text-[18px]">local_shipping</span>
                            수신처 / 배송 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="수신 업체명" value={receiver.company} onChange={v => setReceiver(p => ({ ...p, company: v }))} placeholder="(주)공급파트너스" />
                            <InputField label="담당자" value={receiver.manager} onChange={v => setReceiver(p => ({ ...p, manager: v }))} />
                            <InputField label="담당자 연락처" value={receiver.contact} onChange={v => setReceiver(p => ({ ...p, contact: v }))} />
                            <InputField label="배송지 주소" value={receiver.address} onChange={v => setReceiver(p => ({ ...p, address: v }))} />
                            <InputField label="현장 수령인" value={receiver.recipient} onChange={v => setReceiver(p => ({ ...p, recipient: v }))} />
                            <InputField label="수령인 연락처" value={receiver.recipientPhone} onChange={v => setReceiver(p => ({ ...p, recipientPhone: v }))} />
                            <InputField label="현장 관리인 연락처" value={receiver.siteManagerPhone} onChange={v => setReceiver(p => ({ ...p, siteManagerPhone: v }))} placeholder="010-0000-0000" />
                            <InputField label="납기 희망일" value={receiver.desiredDate} onChange={v => setReceiver(p => ({ ...p, desiredDate: v }))} placeholder="2026-03-20 (오전 중)" />
                            <InputField label="하차 조건" value={receiver.unloadCondition} onChange={v => setReceiver(p => ({ ...p, unloadCondition: v }))} placeholder="지게차 필요 / 엘리베이터 유" />
                        </div>
                    </div>

                    {/* 품목 편집 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400 text-[18px]">inventory_2</span>
                                품목 목록
                            </h3>
                            <button onClick={addItem}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-all">
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                품목 추가
                            </button>
                        </div>
                        <div className="space-y-3">
                            {items.map((it, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-4">
                                        <label className="text-[10px] text-slate-500 block mb-1">품명</label>
                                        <input value={it.name} onChange={e => updateItem(i, 'name', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-slate-500 block mb-1">상세 (규격/색상 등)</label>
                                        <input value={it.detail} onChange={e => updateItem(i, 'detail', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-slate-500 block mb-1">코드번호</label>
                                        <input value={it.model} onChange={e => updateItem(i, 'model', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] text-slate-500 block mb-1">수량</label>
                                        <input type="number" value={it.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                                            className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] text-slate-500 block mb-1">단위</label>
                                        <select value={it.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                                            className="w-full px-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                                            <option value="M">M</option>
                                            <option value="Box">Box</option>
                                            <option value="R">R(롤)</option>
                                            <option value="개">개</option>
                                            <option value="EA">EA</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] text-slate-500 block mb-1">비고</label>
                                        <input value={it.memo} onChange={e => updateItem(i, 'memo', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => removeItem(i)}
                                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                                            title="삭제">
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 특이사항 편집 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-400 text-[18px]">edit_note</span>
                            특이사항 / 메모
                        </h3>
                        <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── 스타일 상수 ── */
const thStyle = { background: '#f4f6f8', width: '14%', border: '1px solid #d0d5dd', padding: '8px 10px', fontSize: '12px', fontWeight: '600', color: '#444', textAlign: 'center' };
const tdStyle = { width: '36%', border: '1px solid #d0d5dd', padding: '8px 10px', fontSize: '12px' };
const itemThStyle = { background: '#1a1a2e', color: '#fff', border: '1px solid #1a1a2e', padding: '10px', fontSize: '12px', fontWeight: '600', textAlign: 'center' };
const itemTdStyle = { border: '1px solid #d0d5dd', padding: '9px 10px', fontSize: '12px' };

/* ── 공통 인풋 필드 ── */
const InputField = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="text-[11px] text-slate-500 font-medium block mb-1.5">{label}</label>
        <input
            type="text" value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder || ''}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
    </div>
);

export default PurchaseOrderForm;
