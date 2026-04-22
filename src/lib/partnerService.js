import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * 파트너(외부 업체) 전용 서비스 로직
 * 외부 업체가 자신들의 재고 데이터에만 접근할 수 있도록 분리된 서비스입니다.
 */

const VENDOR_COLLECTION = 'vendors';

// 특정 파트너(업체)의 재고 목록 가져오기
export const getPartnerInventory = async (vendorId) => {
  try {
    // 실제로는 FireStore의 vendors/{vendorId}/inventory 컬렉션을 조회합니다.
    const vendorRef = doc(db, VENDOR_COLLECTION, vendorId);
    const vendorSnap = await getDoc(vendorRef);
    
    if (vendorSnap.exists()) {
      return vendorSnap.data().inventory || [];
    }
    return [];
  } catch (error) {
    console.error('재고 불러오기 실패:', error);
    throw new Error('재고 목록을 불러오지 못했습니다.');
  }
};

// 파트너(업체)가 오늘자 최신 재고 저장하기
export const updatePartnerInventory = async (vendorId, updatedInventory) => {
  try {
    const vendorRef = doc(db, VENDOR_COLLECTION, vendorId);
    
    // 타임스탬프와 함께 저장
    await setDoc(vendorRef, {
      inventory: updatedInventory,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: localStorage.getItem('partnerUser') || vendorId
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('재고 저장 실패:', error);
    throw new Error('데이터베이스에 접근할 수 없습니다.');
  }
};
