import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LXZIN_PRODUCTS } from '../../data/lxzin-products';
import { useProductStore } from '../../store/useProductStore';
import * as XLSX from 'xlsx-js-style';
import PartnerUserManageModal from '../../components/partner/PartnerUserManageModal';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const CATEGORY_COLORS = [
  { hex: 'FFFFF1F2', hexHeader: 'FFFFE4E6', bg: 'bg-red-50', headerBg: 'bg-red-100', border: 'border-red-200', text: 'text-red-800' },
  { hex: 'FFEFF6FF', hexHeader: 'FFDBEAFE', bg: 'bg-blue-50', headerBg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  { hex: 'FFF0FDF4', hexHeader: 'FFDCFCE7', bg: 'bg-green-50', headerBg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800' },
  { hex: 'FFFEFCE8', hexHeader: 'FFFEF08A', bg: 'bg-yellow-50', headerBg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800' },
  { hex: 'FFFAF5FF', hexHeader: 'FFF3E8FF', bg: 'bg-purple-50', headerBg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
  { hex: 'FFFFF7ED', hexHeader: 'FFFFEDD5', bg: 'bg-orange-50', headerBg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800' },
  { hex: 'FFECFEFF', hexHeader: 'FFCFFAFE', bg: 'bg-cyan-50', headerBg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-800' },
  { hex: 'FFFDF2F8', hexHeader: 'FFFCE7F3', bg: 'bg-pink-50', headerBg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-800' },
];

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const updateProduct = useProductStore(state => state.updateProduct);
  const addInventoryLogs = useProductStore(state => state.addInventoryLogs);
  const resetAllInventoryData = useProductStore(state => state.resetAllInventoryData);
  const inventoryLogs = useProductStore(state => state.inventoryLogs || []);
  const storeProducts = useProductStore(state => state.products);
  const initProducts = useProductStore(state => state.initProducts);
  const isLoaded = useProductStore(state => state.isLoaded);
  
  const [userName, setUserName] = useState(() => localStorage.getItem('partnerUser') || '파트너님');
  const [partnerRole, setPartnerRole] = useState(() => localStorage.getItem('partnerRole') || 'staff');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(() => new Date().toLocaleTimeString());
  const [searchTerm, setSearchTerm] = useState('');
  const [statPeriod, setStatPeriod] = useState('none'); // 'none' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 전체 제품 리스트 로드 (프로젝트 실제 데이터 매핑 및 글로벌 스토어 동기화 반영)
  const [inventoryList, setInventoryList] = useState(() => {
    const storeProducts = useProductStore.getState().products;

    return LXZIN_PRODUCTS.map((p, index) => {
      const storeState = storeProducts.find(sp => sp.id === p.id);
      
      const initialStock = storeState?.stock !== undefined ? storeState.stock : 0; // 초기 재고 0으로 설정
      const salesStatus = storeState?.salesStatus || (initialStock <= 0 ? '일시 품절' : '판매중');
      const expectedDate = storeState?.expectedDate || '';
      const remarks = storeState?.remarks || '';

      return {
        id: p.id || `unknown-${index}`,
        code: p.model_id || 'NO-CODE',
        name: `${p.subCategory || ''} ${p.title || ''}`.trim(),
        category: p.category || p.subCategory || '미분류', // 카테고리 속성 추가
        previousStock: initialStock,
        incoming: '',
        outgoing: '',
        currentStock: initialStock,
        salesStatus: salesStatus, // 동기화된 상태 사용
        expectedDate: expectedDate, // 동기화된 입고예정일
        remarks: remarks, // 동기화된 비고
        weeklyIn: 0,
        weeklyOut: 0,
        monthlyIn: 0,
        monthlyOut: 0,
        yearlyIn: 0,
        yearlyOut: 0,
        customIn: 0,
        customOut: 0,
      };
    });
  });

  // --- 통계 연산 로직 (useMemo) ---
  const statsMap = useMemo(() => {
    const map = {};
    if (statPeriod === 'none' && inventoryLogs.length === 0) return map;

    const now = new Date();
    
    // 기간별 시작 시간 계산
    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - 6);
    weeklyStart.setHours(0, 0, 0, 0);

    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearlyStart = new Date(now.getFullYear(), 0, 1);
    
    let customStart = new Date(0);
    let customEnd = new Date();
    customEnd.setHours(23, 59, 59, 999);
    
    if (startDate) {
      customStart = new Date(startDate);
      customStart.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      customEnd = new Date(endDate);
      customEnd.setHours(23, 59, 59, 999);
    }

    inventoryLogs.forEach(log => {
        if (!map[log.productId]) {
            map[log.productId] = {
                weeklyIn: 0, weeklyOut: 0,
                monthlyIn: 0, monthlyOut: 0,
                yearlyIn: 0, yearlyOut: 0,
                customIn: 0, customOut: 0
            };
        }
        const logDate = new Date(log.date);
        
        // 주간 통계
        if (logDate >= weeklyStart) {
            map[log.productId].weeklyIn += (log.incoming || 0);
            map[log.productId].weeklyOut += (log.outgoing || 0);
        }
        // 월간 통계
        if (logDate >= monthlyStart) {
            map[log.productId].monthlyIn += (log.incoming || 0);
            map[log.productId].monthlyOut += (log.outgoing || 0);
        }
        // 연간 통계
        if (logDate >= yearlyStart) {
            map[log.productId].yearlyIn += (log.incoming || 0);
            map[log.productId].yearlyOut += (log.outgoing || 0);
        }
        // 커스텀 통계
        if (logDate >= customStart && logDate <= customEnd) {
            map[log.productId].customIn += (log.incoming || 0);
            map[log.productId].customOut += (log.outgoing || 0);
        }
    });

    return map;
  }, [inventoryLogs, statPeriod, startDate, endDate]);

  useEffect(() => {
    // Firebase Auth 상태 구독으로 안전한 라우트 보호
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email?.endsWith('@partner.dailyhousing.com')) {
        // 비정상 접근 시 세션 초기화 후 튕겨내기
        localStorage.removeItem('partnerUser');
        localStorage.removeItem('partnerRole');
        localStorage.removeItem('partnerId');
        navigate('/shinilsangjae/login', { replace: true });
      } else {
        try {
          // 인증이 성공했다면 DB에서 확실하게 권한 동기화 (경쟁상태 / 캐시 무효화 목적)
          const vendorId = user.email.split('@')[0];
          const userDoc = await getDoc(doc(db, 'partner_users', vendorId));
          
          if (userDoc.exists()) {
             const data = userDoc.data();
             localStorage.setItem('partnerUser', data.name);
             localStorage.setItem('partnerRole', data.role);
             localStorage.setItem('partnerId', vendorId);
             
             setUserName(data.name);
             setPartnerRole(data.role);
          } else {
             // 혹시 DB에 없으면 기존 로컬스토리지 값 사용
             setUserName(localStorage.getItem('partnerUser') || '파트너님');
             setPartnerRole(localStorage.getItem('partnerRole') || 'staff');
          }
        } catch (error) {
           console.error("Partner sync error: ", error);
           setUserName(localStorage.getItem('partnerUser') || '파트너님');
           setPartnerRole(localStorage.getItem('partnerRole') || 'staff');
        }

        // 정상 로그인 확인 시 상품 초기화
        initProducts();
      }
    });

    return () => unsubscribe();
  }, [navigate, initProducts]);

  // 실시간 동기화: storeProducts가 (Firestore 등에 의해) 변경되면 inventoryList에 반영하되,
  // 사용자가 현재 입력 중인 입고/출고 수량은 보존합니다.
  useEffect(() => {
    if (!isLoaded || storeProducts.length === 0) return;

    setInventoryList(prev => {
      let isChanged = false;
      const newList = prev.map(item => {
        const storeState = storeProducts.find(sp => sp.id === item.id);
        if (!storeState) return item;

        const newStock = storeState.stock !== undefined ? storeState.stock : 0;
        const salesStatus = storeState.salesStatus || (newStock <= 0 ? '일시 품절' : '판매중');
        const expectedDate = storeState.expectedDate || '';
        const remarks = storeState.remarks || '';

        if (
          item.previousStock === newStock &&
          item.salesStatus === salesStatus &&
          item.expectedDate === expectedDate &&
          item.remarks === remarks
        ) {
          return item;
        }

        isChanged = true;
        const inc = item.incoming === '' ? 0 : Number(item.incoming);
        const out = item.outgoing === '' ? 0 : Number(item.outgoing);

        return {
          ...item,
          previousStock: newStock,
          currentStock: newStock + inc - out,
          salesStatus,
          expectedDate,
          remarks
        };
      });
      return isChanged ? newList : prev;
    });
  }, [storeProducts, isLoaded]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('partnerAuth');
    localStorage.removeItem('partnerUser');
    localStorage.removeItem('partnerRole');
    localStorage.removeItem('partnerId');
    navigate('/shinilsangjae/login', { replace: true });
  };

  const handleReset = () => {
    if (window.confirm("정말 모든 재고와 입출고 통계를 0으로 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
        resetAllInventoryData();
        alert("모든 데이터가 초기화되었습니다. 페이지를 새로고침합니다.");
        window.location.reload();
    }
  };

  const handleStockChange = (id, field, value) => {
    // 문자열 필드 처리 (판매 상태, 입고예정일, 비고)
    if (['salesStatus', 'expectedDate', 'remarks'].includes(field)) {
      setInventoryList(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
      return;
    }

    // 빈 값 처리
    if (value === '') {
      setInventoryList(prev => prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: '' };
          const inc = updated.incoming === '' ? 0 : updated.incoming;
          const out = updated.outgoing === '' ? 0 : updated.outgoing;
          updated.currentStock = updated.previousStock + inc - out;
          
          // 재고 연동 판매 상태 자동 갱신 (단종 상태가 아닐 때만)
          if (updated.salesStatus !== '단종') {
            updated.salesStatus = updated.currentStock <= 0 ? '일시 품절' : '판매중';
          }
          
          return updated;
        }
        return item;
      }));
      return;
    }

    // 숫자만 추출
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numValue)) return;

    setInventoryList(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: numValue };
          const inc = updatedItem.incoming === '' ? 0 : updatedItem.incoming;
          const out = updatedItem.outgoing === '' ? 0 : updatedItem.outgoing;
          updatedItem.currentStock = updatedItem.previousStock + inc - out;
          
          // 재고 연동 판매 상태 자동 갱신 (단종 상태가 아닐 때만)
          if (updatedItem.salesStatus !== '단종') {
            updatedItem.salesStatus = updatedItem.currentStock <= 0 ? '일시 품절' : '판매중';
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const newLogs = [];
      const timestamp = new Date().toISOString();
      const userId = localStorage.getItem('partnerId') || 'unknown';
      const storeProducts = useProductStore.getState().products;

      // 1. 계산 완료된 새로운 리스트 로컬 상태 반영
      const newList = inventoryList.map(item => {
        const inc = item.incoming === '' ? 0 : Number(item.incoming);
        const out = item.outgoing === '' ? 0 : Number(item.outgoing);

        if (inc > 0 || out > 0) {
          newLogs.push({
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            productId: item.id,
            date: timestamp,
            incoming: inc,
            outgoing: out,
            previousStock: item.previousStock,
            currentStock: item.currentStock,
            userId: userId
          });
        }

        return {
          ...item,
          previousStock: item.currentStock,
          incoming: '',
          outgoing: '',
        };
      });

      setInventoryList(newList);

      // 2. 변경된 사항만 필터링하여 Firestore 및 스토어 업데이트
      const updatePromises = newList.reduce((promises, item) => {
        const originalProduct = storeProducts.find(p => p.id === item.id);
        const isChanged = !originalProduct ||
            originalProduct.stock !== item.currentStock ||
            originalProduct.salesStatus !== item.salesStatus ||
            originalProduct.expectedDate !== item.expectedDate ||
            originalProduct.remarks !== item.remarks;

        if (isChanged) {
          promises.push(
            updateProduct(item.id, {
              stock: item.currentStock,
              salesStatus: item.salesStatus,
              expectedDate: item.expectedDate,
              remarks: item.remarks
            })
          );
        }
        return promises;
      }, []);

      await Promise.all(updatePromises);

      // 3. 로그 일괄 추가
      if (newLogs.length > 0) {
        await addInventoryLogs(newLogs);
      }

      setLastSaved(new Date().toLocaleTimeString());
      alert('입출고 내역이 안전하게 저장되었으며, 통계가 즉시 갱신되었습니다.');
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // 검색 필터 적용
  const filteredList = inventoryList.filter(item => 
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 고유 카테고리 추출
  const allCategories = Array.from(new Set(inventoryList.map(item => item.category))).filter(Boolean);

  // 검색된 결과 안에서 카테고리별로 데이터 그룹화
  const groupedProducts = allCategories.reduce((acc, cat) => {
    const items = filteredList.filter(item => item.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const handleExportExcel = async () => {
    if (filteredList.length === 0) {
      alert('출력할 데이터가 없습니다.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // 1. 헤더 설정
    const headers = [
      '제품 코드', '제품명', '기존 재고', '입고(+)', '출고(-)', '현재고(=)', '판매 상태', '입고 예정일'
    ];
    if (statPeriod === 'weekly' || statPeriod === 'all') {
      headers.push('주간 입고', '주간 출고');
    }
    if (statPeriod === 'monthly' || statPeriod === 'all') {
      headers.push('월간 입고', '월간 출고');
    } 
    if (statPeriod === 'yearly' || statPeriod === 'all') {
      headers.push('연간 입고', '연간 출고');
    }
    if (statPeriod === 'custom') {
      headers.push('지정기간 입고', '지정기간 출고');
    }
    headers.push('비고');

    const aoa = [headers];
    const merges = [];
    const cellStyles = {};

    // 2. 데이터 추가
    let rowIndex = 1; // header is row 0
    let catIndex = 0;

    Object.entries(groupedProducts).forEach(([category, items]) => {
      const theme = CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length];
      const rgbHeader = theme.hexHeader.substring(2); // remove 'FF'
      const rgbBg = theme.hex.substring(2);

      // 카테고리 헤더행
      const catRow = [`📁 ${category} (${items.length}개)`];
      for (let i = 1; i < headers.length; i++) catRow.push('');
      aoa.push(catRow);
      
      merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: headers.length - 1 } });

      // 카테고리 헤더행 스타일 지정 파라미터 저장
      for (let c = 0; c < headers.length; c++) {
        cellStyles[`${rowIndex},${c}`] = {
          fill: { fgColor: { rgb: rgbHeader } },
          font: { bold: true, sz: 12, color: { rgb: "111827" } },
          alignment: { vertical: "center", horizontal: c === 0 ? "left" : "center" },
          border: {
             top: { style: 'thin', color: { rgb: '9CA3AF' } },
             bottom: { style: 'thin', color: { rgb: '9CA3AF' } }
          }
        };
      }
      rowIndex++;
      
      // 데이터 행 추가
      items.forEach(item => {
        const rowData = [
          item.code,
          item.name,
          item.previousStock,
          item.incoming === '' ? 0 : item.incoming,
          item.outgoing === '' ? 0 : item.outgoing,
          item.currentStock,
          item.salesStatus,
          item.expectedDate || ''
        ];
        if (statPeriod === 'weekly' || statPeriod === 'all') {
           rowData.push(item.weeklyIn, item.weeklyOut);
        }
        if (statPeriod === 'monthly' || statPeriod === 'all') {
           rowData.push(item.monthlyIn, item.monthlyOut);
        }
        if (statPeriod === 'yearly' || statPeriod === 'all') {
           rowData.push(item.yearlyIn, item.yearlyOut);
        }
        if (statPeriod === 'custom') {
           rowData.push(item.customIn, item.customOut);
        }
        rowData.push(item.remarks || '');
        
        aoa.push(rowData);

        for (let c = 0; c < headers.length; c++) {
           const isStatus = headers[c] === '판매 상태';
           let fontColor = "000000";
           if (isStatus) {
             fontColor = item.salesStatus === '일시 품절' ? "EF4444" : item.salesStatus === '단종' ? "9CA3AF" : "2563EB";
           }
           
           cellStyles[`${rowIndex},${c}`] = {
             fill: { fgColor: { rgb: rgbBg } },
             font: { 
               bold: isStatus || c === 1, 
               color: { rgb: fontColor }
             },
             alignment: { vertical: "center", horizontal: c === 1 ? "left" : "center" },
             border: {
               top: { style: 'thin', color: { rgb: 'E5E7EB' } },
               left: { style: 'thin', color: { rgb: 'E5E7EB' } },
               bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
               right: { style: 'thin', color: { rgb: 'E5E7EB' } }
             }
           };
        }
        rowIndex++;
      });
      
      catIndex++;
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = merges;
    
    // 열 너비 지정
    const wscols = [
      { wch: 22 }, { wch: 45 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 14 }, { wch: 15 }, { wch: 18 }
    ];
    let extraCols = headers.length - 9;
    for(let i=0; i<extraCols; i++) wscols.push({ wch: 12 });
    wscols.push({ wch: 60 });
    ws['!cols'] = wscols;

    // 헤더 및 셀 스타일 적용
    for (let r = 0; r < aoa.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) continue;

        if (r === 0) {
           ws[cellRef].s = {
             fill: { fgColor: { rgb: "4B5563" } },
             font: { bold: true, color: { rgb: "FFFFFF" } },
             alignment: { vertical: "center", horizontal: "center" },
             border: {
               top: { style: 'thin', color: { rgb: '9CA3AF' } },
               left: { style: 'thin', color: { rgb: '9CA3AF' } },
               bottom: { style: 'thin', color: { rgb: '9CA3AF' } },
               right: { style: 'thin', color: { rgb: '9CA3AF' } }
             }
           };
        } else if (cellStyles[`${r},${c}`]) {
           ws[cellRef].s = cellStyles[`${r},${c}`];
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "재고현황");

    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const fileName = `신일상재_재고현황_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  // 스크롤 함수
  const scrollToCategory = (category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 날짜 구하기
  const today = new Date();
  const dateString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="w-full max-w-[1600px] px-4 md:px-6 mx-auto">
      {/* 대시보드 헤더 영역 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            반갑습니다, <span className="text-blue-600">{userName}</span> 담당자님!
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            오늘자 (<span className="text-blue-600 font-bold">{dateString}</span>) 기준 제품 입출고량을 입력해주세요.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {partnerRole === 'admin' && (
            <>
              <button 
                onClick={() => setIsManageModalOpen(true)}
                className="flex-auto min-w-[140px] md:flex-none flex items-center justify-center gap-1.5 bg-purple-50 text-purple-700 font-bold px-4 py-2.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-2 2 3 4 3 6v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                직원 계정 관리
              </button>
              <button 
                onClick={handleReset}
                className="flex-auto min-w-[140px] md:flex-none flex items-center justify-center gap-1.5 bg-red-50 text-red-700 font-bold px-4 py-2.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap"
                title="모든 재고 및 통계 0으로 초기화"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                데이터 초기화
              </button>
            </>
          )}
          <button 
            onClick={handleExportExcel}
            className="flex-auto min-w-[140px] md:flex-none flex items-center justify-center gap-1.5 bg-green-50 text-green-700 font-bold px-4 py-2.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            엑셀 다운로드
          </button>
          <button 
            onClick={handleLogout}
            className="flex-auto min-w-[140px] md:flex-none bg-gray-100 text-gray-700 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 액션바 (검색 및 카테고리 네비게이션) */}
      <div className="bg-white rounded-t-xl border border-gray-200 flex flex-col sticky top-0 z-20 shadow-sm">
        <div className="p-4 flex flex-col xl:flex-row justify-start items-start xl:items-center gap-4 border-b border-gray-100">
          {/* 검색창 */}
          <div className="relative w-full sm:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="제품 코드 또는 제품명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 기간별 통계 버튼 나열 (왼쪽 빈 칸 영역) */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {[
              { value: 'all', label: '통합 통계' },
              { value: 'weekly', label: '주간 통계' },
              { value: 'monthly', label: '월간 통계' },
              { value: 'yearly', label: '연간 통계' },
              { value: 'custom', label: '날짜 지정' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatPeriod(prev => prev === opt.value ? 'none' : opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-1 ${
                  statPeriod === opt.value
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500 ring-offset-1'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {opt.value !== 'custom' && <span>📊</span>}
                {opt.value === 'custom' && <span>📅</span>}
                {opt.label}
              </button>
            ))}

            {statPeriod === 'custom' && (
              <div className="flex items-center gap-1.5 ml-2 bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                />
                <span className="text-gray-400 font-bold">~</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* 상단 카테고리 빠른 이동 버튼 (Sticky) */}
        <div className="p-3 flex gap-2 overflow-x-auto hide-scrollbar bg-gray-50/80 backdrop-blur-sm">
          <span className="shrink-0 flex items-center text-xs font-bold text-gray-500 ml-1 mr-2">빠른 이동:</span>
          {Object.keys(groupedProducts).length > 0 ? Object.keys(groupedProducts).map(cat => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className="shrink-0 px-3.5 py-1.5 rounded-full bg-white text-gray-700 hover:bg-blue-600 hover:text-white font-semibold text-sm transition-all border border-gray-200 shadow-sm hover:shadow-md hover:border-transparent active:scale-95"
            >
              {cat}
            </button>
          )) : (
            <span className="text-sm text-gray-400 py-1.5">검색결과와 일치하는 카테고리가 없습니다.</span>
          )}
        </div>
      </div>

      {/* 재고 입력 테이블 영역 */}
      <div className="bg-white rounded-b-xl shadow-sm border-x border-b border-gray-200 overflow-hidden">
        <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center text-xs font-semibold text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
            엑셀처럼 탭(Tab) 키를 눌러 다음 칸으로 이동할 수 있습니다.
          </span>
          <span>마지막 동기화: {lastSaved}</span>
        </div>
        
        {/* 스몰 스크린 뷰 (Mobile Card View) */}
        <div className="md:hidden flex flex-col p-2 sm:p-4 bg-gray-50/50">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              검색된 제품이 없습니다.
            </div>
          ) : (
            Object.entries(groupedProducts).map(([category, items], catIndex) => {
              const theme = CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length];
              return (
              <div key={category} id={`m-category-${category}`} style={{ scrollMarginTop: '180px' }} className="mb-6">
                <div className={`p-3 ${theme.headerBg} border-l-4 ${theme.border} font-extrabold ${theme.text} rounded-lg shadow-sm mb-3 sticky top-[120px] z-10 flex items-center justify-between`}>
                  <span>📁 {category}</span>
                  <span className={`bg-white/90 shadow-sm ${theme.text} text-xs px-2.5 py-1 rounded-full font-bold`}>{items.length}개</span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map(item => (
                    <div key={item.id} className={`${theme.bg} border ${theme.border} rounded-xl p-4 shadow-sm relative transition-colors`}>
                       <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                          <div className="pr-2">
                             <div className="text-xs font-mono text-gray-400 mb-1">{item.code}</div>
                             <div className="font-bold text-gray-800 text-[15px] leading-tight break-keep">{item.name}</div>
                          </div>
                          <div className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-black ${item.salesStatus === '일시 품절' ? 'bg-red-50 text-red-600' : item.salesStatus === '단종' ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-600'}`}>
                            {item.salesStatus}
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-4 gap-2 mb-4 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                          <div className="flex flex-col items-center justify-center border-r border-gray-200">
                            <span className="text-[11px] font-bold text-gray-500 mb-1">기존재고</span>
                            <span className="font-bold text-gray-700 text-sm">{item.previousStock}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center border-r border-gray-200 px-1">
                            <span className="text-[11px] font-bold text-blue-600 mb-1">입고(+)</span>
                            <input type="text" inputMode="numeric" value={item.incoming} onChange={e => handleStockChange(item.id, 'incoming', e.target.value)} placeholder="0" className="w-full text-center p-1 text-sm font-bold border border-blue-200 rounded text-blue-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                          </div>
                          <div className="flex flex-col items-center justify-center border-r border-gray-200 px-1">
                            <span className="text-[11px] font-bold text-red-600 mb-1">출고(-)</span>
                            <input type="text" inputMode="numeric" value={item.outgoing} onChange={e => handleStockChange(item.id, 'outgoing', e.target.value)} placeholder="0" className="w-full text-center p-1 text-sm font-bold border border-red-200 rounded text-red-700 bg-white focus:ring-1 focus:ring-red-500 focus:outline-none" />
                          </div>
                          <div className="flex flex-col items-center justify-center relative">
                            <span className="text-[11px] font-bold text-green-600 mb-1">현재고(=)</span>
                            <span className={`font-black text-lg ${item.currentStock < 0 ? 'text-red-500' : 'text-gray-900'} ${item.incoming || item.outgoing ? 'text-green-600' : ''}`}>{item.currentStock}</span>
                            {(item.incoming || item.outgoing) && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>}
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                             <label className="text-[11px] font-bold text-gray-500 mb-1.5 block ml-1">판매 상태</label>
                             <select value={item.salesStatus} onChange={e => handleStockChange(item.id, 'salesStatus', e.target.value)} className="w-full p-2 text-sm text-center font-bold border border-gray-200 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white text-gray-700 appearance-none cursor-pointer" style={{ backgroundImage: 'none' }}>
                               <option value="판매중">판매중</option>
                               <option value="일시 품절">일시 품절</option>
                               <option value="단종">단종</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-[11px] font-bold text-gray-500 mb-1.5 block ml-1">입고 예정일</label>
                             <input type="date" value={item.expectedDate} onChange={e => handleStockChange(item.id, 'expectedDate', e.target.value)} className="w-full p-2 text-[13px] border border-gray-200 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white text-gray-700 font-medium h-[38px] md:h-[40px]" />
                          </div>
                       </div>
                       
                       <div>
                          <label className="text-[11px] font-bold text-gray-500 mb-1.5 block ml-1">비고 (선택)</label>
                          <input type="text" value={item.remarks} onChange={e => handleStockChange(item.id, 'remarks', e.target.value)} placeholder="특이사항을 입력해주세요." className="w-full p-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white text-gray-700" />
                       </div>

                       {statPeriod !== 'none' && (
                          <div className={`mt-4 ${statPeriod === 'all' ? 'grid grid-cols-1 sm:grid-cols-3' : 'grid grid-cols-1'} mx-auto gap-2 border-t border-gray-200/60 pt-4`}>
                             {(statPeriod === 'weekly' || statPeriod === 'all') && (
                               <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center justify-center border border-purple-100">
                                  <span className="text-[11px] text-purple-600 font-bold mb-1">주간(입고/출고)</span>
                                  <span className="text-sm font-black text-purple-700">{item.weeklyIn} / {item.weeklyOut}</span>
                               </div>
                             )}
                             {(statPeriod === 'monthly' || statPeriod === 'all') && (
                               <div className="bg-indigo-50 p-3 rounded-lg flex flex-col items-center justify-center border border-indigo-100">
                                  <span className="text-[11px] text-indigo-600 font-bold mb-1">월간(입고/출고)</span>
                                  <span className="text-sm font-black text-indigo-700">{item.monthlyIn} / {item.monthlyOut}</span>
                               </div>
                             )}
                             {(statPeriod === 'yearly' || statPeriod === 'all') && (
                               <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center border border-blue-100">
                                  <span className="text-[11px] text-blue-600 font-bold mb-1">연간(입고/출고)</span>
                                  <span className="text-sm font-black text-blue-700">{item.yearlyIn} / {item.yearlyOut}</span>
                               </div>
                             )}
                             {statPeriod === 'custom' && (
                               <div className="bg-orange-50 p-3 rounded-lg flex flex-col items-center justify-center border border-orange-100">
                                  <span className="text-[11px] text-orange-600 font-bold mb-1">지정기간(입/출)</span>
                                  <span className="text-sm font-black text-orange-700">{item.customIn} / {item.customOut}</span>
                               </div>
                             )}
                          </div>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            )})
          )}
        </div>

        {/* 데스크톱/태블릿 뷰 (Table) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-700">
                <th className="px-2 py-3 font-bold whitespace-nowrap w-20 border-r border-gray-200 text-center">제품 코드</th>
                <th className="px-2 py-3 font-bold whitespace-nowrap border-r border-gray-200 max-w-[200px]">제품명</th>
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap w-16 border-r border-gray-200 bg-gray-50">기존 재고</th>
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap w-20 border-r border-gray-200 bg-blue-50 text-blue-700">입고 (+)</th>
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap w-20 border-r border-gray-200 bg-red-50 text-red-700">출고 (-)</th>
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap w-16 bg-green-50 text-green-700 border-r border-green-200">현재고 (=)</th>
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap w-24 border-r border-gray-200">판매 상태</th>
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap w-24 border-r border-gray-200">입고 예정일</th>
                {(statPeriod === 'weekly' || statPeriod === 'all') && (
                  <>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-purple-50 text-purple-700">주간 입고</th>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-purple-50 text-purple-700 border-r border-purple-200">주간 출고</th>
                  </>
                )}
                {(statPeriod === 'monthly' || statPeriod === 'all') && (
                  <>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-indigo-50 text-indigo-700">월간 입고</th>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-indigo-50 text-indigo-700 border-r border-indigo-200">월간 출고</th>
                  </>
                )}
                {(statPeriod === 'yearly' || statPeriod === 'all') && (
                  <>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-blue-50 text-blue-700">연간 입고</th>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-blue-50 text-blue-700 border-r border-gray-200">연간 출고</th>
                  </>
                )}
                {statPeriod === 'custom' && (
                  <>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-orange-50 text-orange-700">지정 입고</th>
                    <th className="px-1 py-3 font-bold text-center whitespace-nowrap min-w-[60px] bg-orange-50 text-orange-700 border-r border-gray-200">지정 출고</th>
                  </>
                )}
                <th className="px-2 py-3 font-bold text-center whitespace-nowrap min-w-[150px] w-40 border-r border-gray-200">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(groupedProducts).length === 0 ? (
                <tr>
                  <td colSpan={statPeriod === 'all' ? 15 : (statPeriod !== 'none' ? 11 : 9)} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      검색된 제품이 없습니다.
                    </div>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedProducts).map(([category, items], catIndex) => {
                  const theme = CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length];
                  return (
                  <React.Fragment key={category}>
                    {/* 카테고리 헤더 (스크롤 앵커) */}
                    <tr id={`category-${category}`} style={{ scrollMarginTop: '180px' }} className={`${theme.headerBg} border-t-4 ${theme.border}`}>
                      <td colSpan={statPeriod === 'all' ? 15 : (statPeriod !== 'none' ? 11 : 9)} className={`p-3 pl-4 text-sm font-extrabold ${theme.text} border-b border-gray-200 shadow-inner`}>
                        📁 {category} <span className="opacity-70 ml-1">({items.length}개)</span>
                      </td>
                    </tr>
                    {items.map((item) => (
                      <tr key={item.id} className={`${theme.bg} hover:brightness-[0.98] transition-colors group border-b border-gray-100/50 text-xs`}>
                        <td className="px-2 py-2 font-mono text-gray-500 text-center border-r border-gray-100">
                          {item.code}
                        </td>
                        <td className="px-2 py-2 font-bold text-gray-800 border-r border-gray-100 max-w-[200px] truncate">
                          <div className="flex items-center">
                            <span className="truncate" title={item.name}>{item.name}</span>
                            {item.previousStock === 0 && item.currentStock === 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 whitespace-nowrap">품절</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-gray-100 bg-gray-50/50">
                          <span className="font-medium text-gray-600">{item.previousStock.toLocaleString()}</span>
                        </td>
                        <td className="px-1 py-1 text-center border-r border-gray-100 bg-blue-50/20">
                          <input 
                            type="text"
                            inputMode="numeric"
                            value={item.incoming}
                            onChange={(e) => handleStockChange(item.id, 'incoming', e.target.value)}
                            placeholder="입고량"
                            className="w-full text-center px-1 py-1 border border-transparent rounded bg-transparent focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-blue-600 placeholder-gray-300 transition-all hover:border-gray-200 group-hover:bg-white text-xs"
                          />
                        </td>
                        <td className="px-1 py-1 text-center border-r border-gray-100 bg-red-50/20">
                          <input 
                            type="text"
                            inputMode="numeric"
                            value={item.outgoing}
                            onChange={(e) => handleStockChange(item.id, 'outgoing', e.target.value)}
                            placeholder="출고량"
                            className="w-full text-center px-1 py-1 border border-transparent rounded bg-transparent focus:bg-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold text-red-600 placeholder-gray-300 transition-all hover:border-gray-200 group-hover:bg-white text-xs"
                          />
                        </td>
                        <td className="px-2 py-2 text-center bg-green-50/40 border-r border-green-100">
                          <span className={`font-bold text-sm ${item.currentStock < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                            {item.currentStock.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-1 py-1 text-center border-r border-gray-100">
                          <select 
                            value={item.salesStatus}
                            onChange={(e) => handleStockChange(item.id, 'salesStatus', e.target.value)}
                            className={`w-full text-center px-1 py-1 border border-transparent rounded bg-transparent focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 text-xs font-bold transition-all hover:border-gray-200 group-hover:bg-white appearance-none cursor-pointer ${item.salesStatus === '일시 품절' ? 'text-red-500' : item.salesStatus === '단종' ? 'text-gray-400 line-through' : 'text-blue-600'}`}
                            style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                          >
                            <option value="판매중">판매중</option>
                            <option value="일시 품절">일시 품절</option>
                            <option value="단종">단종</option>
                          </select>
                        </td>
                        <td className="px-1 py-1 text-center border-r border-gray-100">
                          <input 
                            type="date"
                            value={item.expectedDate}
                            onChange={(e) => handleStockChange(item.id, 'expectedDate', e.target.value)}
                            className="w-full text-center px-1 py-1 border border-transparent rounded bg-transparent focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 text-xs text-gray-600 transition-all hover:border-gray-200 group-hover:bg-white"
                          />
                        </td>
                        {(statPeriod === 'weekly' || statPeriod === 'all') && (
                          <>
                            <td className="px-1 py-2 text-center border-r border-purple-100 bg-purple-50/20 text-purple-700 font-medium">{(statsMap[item.id]?.weeklyIn || 0).toLocaleString()}</td>
                            <td className="px-1 py-2 text-center border-r border-purple-100 bg-purple-50/20 text-purple-700 font-medium">{(statsMap[item.id]?.weeklyOut || 0).toLocaleString()}</td>
                          </>
                        )}
                        {(statPeriod === 'monthly' || statPeriod === 'all') && (
                          <>
                            <td className="px-1 py-2 text-center border-r border-indigo-100 bg-indigo-50/20 text-indigo-700 font-medium">{(statsMap[item.id]?.monthlyIn || 0).toLocaleString()}</td>
                            <td className="px-1 py-2 text-center border-r border-indigo-100 bg-indigo-50/20 text-indigo-700 font-medium">{(statsMap[item.id]?.monthlyOut || 0).toLocaleString()}</td>
                          </>
                        )}
                        {(statPeriod === 'yearly' || statPeriod === 'all') && (
                          <>
                            <td className="px-1 py-2 text-center border-r border-blue-100 bg-blue-50/20 text-blue-700 font-medium">{(statsMap[item.id]?.yearlyIn || 0).toLocaleString()}</td>
                            <td className="px-1 py-2 text-center border-r border-gray-100 bg-blue-50/20 text-blue-700 font-medium">{(statsMap[item.id]?.yearlyOut || 0).toLocaleString()}</td>
                          </>
                        )}
                        {statPeriod === 'custom' && (
                          <>
                            <td className="px-1 py-2 text-center border-r border-orange-100 bg-orange-50/20 text-orange-700 font-medium">{(statsMap[item.id]?.customIn || 0).toLocaleString()}</td>
                            <td className="px-1 py-2 text-center border-r border-gray-100 bg-orange-50/20 text-orange-700 font-medium">{(statsMap[item.id]?.customOut || 0).toLocaleString()}</td>
                          </>
                        )}
                        <td className="px-1 py-1 text-center border-r border-gray-100">
                          <input 
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleStockChange(item.id, 'remarks', e.target.value)}
                            placeholder="비고 입력"
                            className="w-full text-left px-2 py-1 border border-transparent rounded bg-transparent focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 text-xs text-gray-600 transition-all hover:border-gray-200 group-hover:bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )})
              )}
            </tbody>
          </table>
        </div>
        
        {/* 하단 저장 플로팅 영역 (모바일 대응) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10 shadow-[0_-10px_15px_-3px_rgb(0,0,0,0.05)]">
          <div className="text-sm text-gray-500 font-medium text-center sm:text-left flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span> 
            <span>현재고 = 기존 재고 + 입고량 - 출고량</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all ${
              isSaving 
                ? 'bg-blue-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:-translate-y-0.5'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                저장 중...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                입출고 저장 및 동기화
              </>
            )}
          </button>
        </div>
      </div>

      {/* 퀵 스크롤 이동 플로팅 버튼 */}
      <div className="fixed bottom-24 right-2 md:right-3 flex flex-col gap-2 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-white/90 backdrop-blur border border-gray-200 text-gray-600 p-2.5 rounded-full shadow-lg hover:scale-110 hover:text-blue-600 hover:border-blue-300 focus:outline-none transition-all group"
          title="맨 위로 가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => document.documentElement.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-white/90 backdrop-blur border border-gray-200 text-gray-600 p-2.5 rounded-full shadow-lg hover:scale-110 hover:text-blue-600 hover:border-blue-300 focus:outline-none transition-all group"
          title="맨 아래로 가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 group-hover:translate-y-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isManageModalOpen && (
        <PartnerUserManageModal 
          isOpen={isManageModalOpen} 
          onClose={() => setIsManageModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default PartnerDashboard;
