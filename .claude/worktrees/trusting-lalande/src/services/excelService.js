import ExcelJS from 'exceljs';
import { formatOrderUnit } from './adminService';

/**
 * 외주처용 엑셀 발주서 생성 및 다운로드
 * @param {Object} order - 주문 데이터 객체
 */
export async function downloadPurchaseOrder(order) {
    if (!order || !order.items) {
        console.error("Invalid order data for excel generation");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('발주서');

    // 스타일 설정 (선택 사항 - 더 프리미엄한 느낌을 위해)
    sheet.getRow(1).font = { bold: true, size: 12 };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE9ECEF' }
    };

    // 헤더 설정
    sheet.columns = [
        { header: '품목명', key: 'name', width: 35 },
        { header: '모델번호', key: 'model_id', width: 15 },
        { header: '수량', key: 'qty', width: 12 },
        { header: '단위', key: 'unit', width: 10 },
        { header: '현장담당자', key: 'customer', width: 15 },
        { header: '연락처', key: 'phone', width: 20 },
        { header: '배송지', key: 'address', width: 50 },
        { header: '특이사항', key: 'memo', width: 35 }
    ];

    // 데이터 행 추가
    order.items.forEach(item => {
        const unitInfo = formatOrderUnit(item);
        sheet.addRow({
            name: item.title || item.name,
            model_id: item.model_id || '-',
            qty: item.quantity,
            unit: unitInfo.unit,
            customer: order.receiverName || order.customerName || '미지정',
            phone: order.receiverPhone || order.customerPhone || '-',
            address: order.shippingAddress || '현장 수령',
            memo: order.deliveryMemo || '-'
        });
    });

    // 테두리 추가 루프
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            if (rowNumber > 1) {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
        });
    });

    // 파일 저장 및 다운로드 트리거
    try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // 파일명 포맷: 데일리하우징_발주_20240307_주문ID.xlsx
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Keeping original date format for consistency
        const shortId = order.id ? order.id.substring(0, 8) : Math.random().toString(36).substring(2, 10); // Keeping original shortId logic for consistency
        link.download = `데일리하우징_발주_${dateStr}_${shortId}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Excel download failed:", error);
        alert("엑셀 파일 생성 중 오류가 발생했습니다.");
    }
}
