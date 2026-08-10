export const caseStudies = [
    {
        id: 'case_001',
        title: '강남구 도곡동 타워팰리스 50평형 시공',
        category: 'residential',
        location: '서울시 강남구',
        productUsed: '에디톤 솔리드 - 모카 베이지',
        completionDate: '2024-02',
        description: '고급스러운 인테리어 무드에 맞춘 프리미엄 바닥재 시공 사례입니다. LX Z:IN 에디톤 시리즈의 고급스러운 질감이 공간의 격을 높여주었습니다.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
        tags: ['거실', '주방', '프리미엄']
    },
    {
        id: 'case_002',
        title: '판교 IT 밸리 스타트업 오피스 시공',
        category: 'commercial',
        location: '경기도 성남시',
        productUsed: '상업용 LVT - 에코노 플러스',
        completionDate: '2024-01',
        description: '모던하고 활동적인 사무 공간을 위해 내구성이 뛰어난 상업용 바닥재를 적용했습니다.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        tags: ['사무실', '공용공간', '내구성']
    },
    {
        id: 'case_003',
        title: '성동구 성수동 카페 단독 리모델링',
        category: 'commercial',
        location: '서울시 성동구',
        productUsed: '프레스티지 - 엔틱 월넛',
        completionDate: '2023-12',
        description: '빈티지한 카페 분위기에 어우러지는 짙은 톤의 바닥재로 공간의 깊이감을 더했습니다.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
        tags: ['카페', '성수동', '빈티지']
    },
    {
        id: 'case_004',
        title: '용인 수지 래미안 이스트팰리스 시공',
        category: 'residential',
        location: '경기도 용인시',
        productUsed: '지아 자연애 - 샌드화이트',
        completionDate: '2023-11',
        description: '화이트 톤 인테리어와 조화를 이루는 밝은 바닥재로 공간을 더욱 넓고 화사하게 연출했습니다.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
        tags: ['아파트', '화이트인테리어', '가성비']
    },
    {
        id: 'case_005',
        title: '송도 아메리칸타운 스테이 공간 시공',
        category: 'residential',
        location: '인천광역시 연수구',
        productUsed: '지아 사랑애 - 헤링본 그레이',
        completionDate: '2023-10',
        description: '헤링본 패턴을 적용하여 세련되면서도 클래식한 분위기를 연출한 시공 사례입니다.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&q=80&w=800',
        tags: ['거실', '헤링본', '모던']
    },
    {
        id: 'case_006',
        title: '여의도 금융권 본사 임원실 시공',
        category: 'commercial',
        location: '서울시 영등포구',
        productUsed: '데코타일 - 카펫 스타일',
        completionDate: '2023-09',
        description: '중후하고 차분한 오피스 분위기에 맞춘 패브릭 질감의 데코타일 시공 사례입니다.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800',
        tags: ['오피스', '임원실', '고급']
    },
    // 아래부터는 거래명세표로 실주소/자재를 검증한 실제 시공 현장입니다 (2026-08-10 추가)
    {
        id: 'case_yongin',
        title: '용인 수지구 죽전 동부센트레빌 47평 시공',
        category: 'residential',
        location: '경기도 용인시',
        productUsed: 'LX 지아사랑애 2.7T 장판',
        completionDate: '2026-08',
        description: '47평형 거실 확장, 빈집 상태로 첫차 시공한 실제 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-yongin.jpg',
        tags: ['아파트', '장판', '실제시공']
    },
    {
        id: 'case_namyangju',
        title: '남양주 건건동 이편한세상 25평 시공',
        category: 'residential',
        location: '경기도 남양주시',
        productUsed: 'LX 5131(3.2T) 툰드라화이트 장판',
        completionDate: '2026-07',
        description: '25평형 거실 확장, 빈집 상태로 첫차 시공한 실제 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-namyangju.jpg',
        tags: ['아파트', '장판', '실제시공']
    },
    {
        id: 'case_hwaseong',
        title: '화성 장안면 사곡리 산호아파트 시공',
        category: 'residential',
        location: '경기도 화성시',
        productUsed: 'LX 지아자연애 2.2T 장판',
        completionDate: '2026-06',
        description: '약 20평형, 거주 중 상태로 첫차 시공한 실제 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-hwaseong.jpg',
        tags: ['아파트', '장판', '실제시공']
    },
    {
        id: 'case_anyang',
        title: '안양 초원LG아파트 23평 시공',
        category: 'residential',
        location: '경기도 안양시',
        productUsed: 'LX 에디톤 600각 (솔티애쉬)',
        completionDate: '2026-04',
        description: '23평형 거실, 걸레받이 포함 시공한 실제 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-anyang.jpg',
        tags: ['아파트', '에디톤', '실제시공']
    },
    {
        id: 'case_suwon',
        title: '수원 우방센트파크 시공',
        category: 'residential',
        location: '경기도 수원시',
        productUsed: 'LX 프리미엄 장판',
        completionDate: '2026-06',
        description: '수원 지역 실제 시공 완료 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-suwon.jpg',
        tags: ['아파트', '장판', '실제시공']
    },
    {
        id: 'case_ilsan',
        title: '일산 문촌마을 시공',
        category: 'residential',
        location: '경기도 고양시',
        productUsed: 'LX 프리미엄 장판',
        completionDate: '2026-05',
        description: '일산 지역 실제 시공 완료 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-ilsan.jpg',
        tags: ['아파트', '장판', '실제시공']
    },
    {
        id: 'case_yangcheon',
        title: '서울 양천구 은성마을 승윤노블리안 28평 시공',
        category: 'residential',
        location: '서울시 양천구',
        productUsed: '한솔SB 무이네화이트(400각)',
        completionDate: '2026-04',
        description: '28평형 마루 시공, 몰딩·실리콘·마감재까지 전체 시공한 실제 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/seoul-yangcheon.jpg',
        tags: ['아파트', '마루', '실제시공']
    },
    {
        id: 'case_siheung',
        title: '시흥 하상동 태영아파트 40평 시공',
        category: 'residential',
        location: '경기도 시흥시',
        productUsed: 'LX 강그린 프로 (골든필드)',
        completionDate: '2026-06',
        description: '40평형, 비어있는 상태로 시공만 진행한 실제 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-siheung.jpg',
        tags: ['아파트', '강마루', '실제시공']
    },
    {
        id: 'case_gwangju',
        title: '경기 광주 힐스테이트 태정아파트 시공',
        category: 'residential',
        location: '경기도 광주시',
        productUsed: 'LX 에디톤 (솔티애쉬)',
        completionDate: '2026-06',
        description: '경기 광주 지역 실제 시공 완료 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/gyeonggi-gwangju.jpg',
        tags: ['아파트', '에디톤', '실제시공']
    },
    {
        id: 'case_asan',
        title: '아산 배방자이 시공',
        category: 'residential',
        location: '충청남도 아산시',
        productUsed: 'LX 에디톤 (콘크리트라이트)',
        completionDate: '2026-06',
        description: '아산 배방읍 지역 실제 시공 완료 현장입니다.',
        thumbnailUrl: '/assets/images/case-studies/chungnam-asan.jpg',
        tags: ['아파트', '에디톤', '실제시공']
    }
];
