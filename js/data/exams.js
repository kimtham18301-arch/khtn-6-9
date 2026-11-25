// Hệ thống Đề kiểm tra KHTN phân loại rõ ràng theo Bộ GD&ĐT:
// kind: '15p' (Kiểm tra 15 phút), '45p' (Kiểm tra 45 phút / Chuyên đề), 'gk' (Giữa kì), 'ck' (Cuối kì), 'nc' (Củng cố / Nâng cao)
window.KHTN_EXAMS = [
  // =========================================================================
  // LỚP 7 – PHÂN LOẠI ĐẦY ĐỦ: 15 PHÚT HK1, 15 PHÚT HK2, 45 PHÚT, GIỮA KÌ, CUỐI KÌ, NÂNG CAO
  // =========================================================================

  // --- Lớp 7: Đề kiểm tra 15 phút – Học kì I ---
  {
    id:'l7-15p-hk1-1', grade:7, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 1',
    scope:'Phương pháp học tập KHTN & Cấu tạo Nguyên tử',
    topics:['l7-phuong-phap','l7-nguyen-tu']
  },
  {
    id:'l7-15p-hk1-2', grade:7, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 2',
    scope:'Nguyên tử, Nguyên tố hóa học & Bảng tuần hoàn',
    topics:['l7-nguyen-tu','l7-bang-tuan-hoan']
  },
  {
    id:'l7-15p-hk1-3', grade:7, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 3',
    scope:'Phân tử, Liên kết hóa học, Hóa trị & Công thức hóa học',
    topics:['l7-phan-tu','l7-hoa-tri']
  },
  {
    id:'l7-15p-hk1-4', grade:7, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 4',
    scope:'Tốc độ chuyển động, Đo tốc độ & Đồ thị quãng đường – thời gian',
    topics:['l7-toc-do']
  },
  {
    id:'l7-15p-hk1-5', grade:7, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 5',
    scope:'Sóng âm, Độ cao – Độ to của âm & Phản xạ âm',
    topics:['l7-am-thanh']
  },

  // --- Lớp 7: Đề kiểm tra 15 phút – Học kì II ---
  {
    id:'l7-15p-hk2-1', grade:7, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 1',
    scope:'Ánh sáng, Định luật phản xạ ánh sáng & Gương phẳng',
    topics:['l7-anh-sang']
  },
  {
    id:'l7-15p-hk2-2', grade:7, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 2',
    scope:'Nam châm, Từ trường Trái Đất & Nam châm điện',
    topics:['l7-tu']
  },
  {
    id:'l7-15p-hk2-3', grade:7, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 3',
    scope:'Quang hợp, Hô hấp tế bào & Trao đổi khí – nước – dinh dưỡng',
    topics:['l7-trao-doi-chat','l7-dinh-duong-van-chuyen']
  },
  {
    id:'l7-15p-hk2-4', grade:7, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 4',
    scope:'Cảm ứng, Tập tính, Sinh trưởng, Phát triển & Sinh sản',
    topics:['l7-cam-ung-sinh-san']
  },

  // --- Lớp 7: Đề kiểm tra 45 phút / Chuyên đề ---
  {
    id:'l7-45p-hoa', grade:7, term:'HK1', kind:'45p', minutes:45, count:16,
    title:'Kiểm tra 45 phút – Chuyên đề Hóa học 7',
    scope:'Toàn bộ mạch Chất: Nguyên tử, Bảng tuần hoàn, Liên kết & Hóa trị',
    topics:['l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri']
  },
  {
    id:'l7-45p-ly', grade:7, term:'Cả năm', kind:'45p', minutes:45, count:16,
    title:'Kiểm tra 45 phút – Chuyên đề Vật lí 7',
    scope:'Toàn bộ mạch Năng lượng: Tốc độ, Âm thanh, Ánh sáng & Từ trường',
    topics:['l7-toc-do','l7-am-thanh','l7-anh-sang','l7-tu']
  },
  {
    id:'l7-45p-sinh', grade:7, term:'HK2', kind:'45p', minutes:45, count:16,
    title:'Kiểm tra 45 phút – Chuyên đề Sinh học 7',
    scope:'Toàn bộ mạch Vật sống: Trao đổi chất, Vận chuyển, Cảm ứng & Sinh sản',
    topics:['l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung-sinh-san']
  },

  // --- Lớp 7: Đề kiểm tra Giữa kì ---
  {
    id:'l7-gk1', grade:7, term:'HK1', kind:'gk', minutes:45, count:20,
    title:'Đề Kiểm tra Giữa học kì I – Lớp 7',
    scope:'Mở đầu, Nguyên tử, Bảng tuần hoàn, Phân tử – Hóa trị & Tốc độ chuyển động',
    topics:['l7-phuong-phap','l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri','l7-toc-do']
  },
  {
    id:'l7-gk2', grade:7, term:'HK2', kind:'gk', minutes:45, count:20,
    title:'Đề Kiểm tra Giữa học kì II – Lớp 7',
    scope:'Ánh sáng – Gương phẳng, Từ trường – Nam châm điện, Quang hợp & Hô hấp tế bào',
    topics:['l7-anh-sang','l7-tu','l7-trao-doi-chat']
  },

  // --- Lớp 7: Đề kiểm tra Cuối kì ---
  {
    id:'l7-ck1', grade:7, term:'HK1', kind:'ck', minutes:60, count:24,
    title:'Đề Kiểm tra Cuối học kì I – Lớp 7',
    scope:'Tổng hợp toàn bộ Học kì I: Mở đầu, Hóa học 7, Tốc độ & Âm thanh',
    topics:['l7-phuong-phap','l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri','l7-toc-do','l7-am-thanh']
  },
  {
    id:'l7-ck2', grade:7, term:'HK2', kind:'ck', minutes:60, count:24,
    title:'Đề Kiểm tra Cuối học kì II – Lớp 7',
    scope:'Ánh sáng, Từ trường, Toàn bộ Sinh học 7 & Ôn cốt lõi cả năm',
    topics:['l7-anh-sang','l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung-sinh-san','l7-hoa-tri','l7-toc-do']
  },

  // --- Lớp 7: Đề Củng cố gốc & Bồi dưỡng Nâng cao ---
  {
    id:'l7-nc-goc', grade:7, term:'Cả năm', kind:'nc', minutes:45, count:20, presetLevel:'basic',
    title:'Đề Củng cố chắc gốc KHTN 7 (Từ dễ đến trung bình)',
    scope:'Ôn chắc kiến thức nền Nhận biết – Thông hiểu toàn bộ Lớp 7 trước khi lên Lớp 8',
    topics:['l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri','l7-toc-do','l7-am-thanh','l7-anh-sang','l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung-sinh-san']
  },
  {
    id:'l7-nc-hsg', grade:7, term:'Cả năm', kind:'nc', minutes:60, count:20, presetLevel:'advanced',
    title:'Đề Thử sức Vận dụng – Nâng cao KHTN 7',
    scope:'Các dạng bài toán tính toán nhiều bước & vận dụng thực tiễn phân loại điểm 9–10',
    topics:['l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri','l7-toc-do','l7-am-thanh','l7-anh-sang','l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung-sinh-san']
  },

  // =========================================================================
  // LỚP 8 – PHÂN LOẠI ĐẦY ĐỦ: 15 PHÚT HK1, 15 PHÚT HK2, 45 PHÚT, GIỮA KÌ, CUỐI KÌ, NÂNG CAO
  // =========================================================================

  // --- Lớp 8: Đề kiểm tra 15 phút – Học kì I ---
  {
    id:'l8-15p-hk1-1', grade:8, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 1',
    scope:'An toàn phòng thí nghiệm, Phản ứng hóa học & Định luật bảo toàn khối lượng',
    topics:['l8-thi-nghiem','l8-phan-ung']
  },
  {
    id:'l8-15p-hk1-2', grade:8, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 2',
    scope:'Mol, Thể tích mol khí (24,79 L), Tỉ khối & Nồng độ dung dịch (C%, CM)',
    topics:['l8-mol','l8-dung-dich']
  },
  {
    id:'l8-15p-hk1-3', grade:8, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 3',
    scope:'Tính theo phương trình hóa học, Hiệu suất & Tốc độ phản ứng – Xúc tác',
    topics:['l8-tinh-pthh']
  },
  {
    id:'l8-15p-hk1-4', grade:8, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 4',
    scope:'Acid, Base, Thang pH, Oxide, Muối & Phân bón hóa học',
    topics:['l8-acid-base','l8-oxide-muoi']
  },
  {
    id:'l8-15p-hk1-5', grade:8, term:'HK1', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK1 – Đề số 5',
    scope:'Khối lượng riêng, Áp suất (rắn, lỏng, khí quyển) & Lực đẩy Archimedes',
    topics:['l8-khoi-luong-rieng','l8-archimedes']
  },

  // --- Lớp 8: Đề kiểm tra 15 phút – Học kì II ---
  {
    id:'l8-15p-hk2-1', grade:8, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 1',
    scope:'Tác dụng làm quay của lực, Moment lực & Đòn bẩy',
    topics:['l8-don-bay']
  },
  {
    id:'l8-15p-hk2-2', grade:8, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 2',
    scope:'Nhiễm điện, Dòng điện, Sơ đồ mạch điện, Cường độ & Hiệu điện thế',
    topics:['l8-dien']
  },
  {
    id:'l8-15p-hk2-3', grade:8, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 3',
    scope:'Năng lượng nhiệt (Nội năng), Truyền nhiệt & Sự nở vì nhiệt',
    topics:['l8-nhiet']
  },
  {
    id:'l8-15p-hk2-4', grade:8, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 4',
    scope:'Hệ vận động, Dinh dưỡng – Tiêu hóa, Máu – Tuần hoàn, Hô hấp & Bài tiết',
    topics:['l8-van-dong-tieu-hoa','l8-co-the-nguoi']
  },
  {
    id:'l8-15p-hk2-5', grade:8, term:'HK2', kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15 phút HK2 – Đề số 5',
    scope:'Hệ thần kinh, Giác quan, Nội tiết, Sinh sản & Hệ sinh thái – Sinh quyển',
    topics:['l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },

  // --- Lớp 8: Đề kiểm tra 45 phút / Chuyên đề ---
  {
    id:'l8-45p-hoa', grade:8, term:'HK1', kind:'45p', minutes:45, count:18,
    title:'Kiểm tra 45 phút – Chuyên đề Hóa học 8',
    scope:'Toàn bộ Hóa 8: Phản ứng, Mol, Dung dịch, Tính theo PTHH, Acid – Base – Oxide – Muối',
    topics:['l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-acid-base','l8-oxide-muoi']
  },
  {
    id:'l8-45p-ly', grade:8, term:'Cả năm', kind:'45p', minutes:45, count:18,
    title:'Kiểm tra 45 phút – Chuyên đề Vật lí 8',
    scope:'Toàn bộ Lý 8: Khối lượng riêng, Áp suất, Archimedes, Đòn bẩy, Điện & Nhiệt',
    topics:['l8-khoi-luong-rieng','l8-archimedes','l8-don-bay','l8-dien','l8-nhiet']
  },
  {
    id:'l8-45p-sinh', grade:8, term:'HK2', kind:'45p', minutes:45, count:18,
    title:'Kiểm tra 45 phút – Chuyên đề Sinh học & Sinh thái 8',
    scope:'Cơ thể người (các hệ cơ quan, nội tiết, sinh sản) & Quần thể, Quần xã, Hệ sinh thái',
    topics:['l8-van-dong-tieu-hoa','l8-co-the-nguoi','l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },

  // --- Lớp 8: Đề kiểm tra Giữa kì ---
  {
    id:'l8-gk1', grade:8, term:'HK1', kind:'gk', minutes:45, count:20,
    title:'Đề Kiểm tra Giữa học kì I – Lớp 8',
    scope:'Thí nghiệm, Phản ứng hóa học, Mol, Dung dịch, Tính theo PTHH & Khối lượng riêng – Áp suất',
    topics:['l8-thi-nghiem','l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-khoi-luong-rieng']
  },
  {
    id:'l8-gk2', grade:8, term:'HK2', kind:'gk', minutes:45, count:20,
    title:'Đề Kiểm tra Giữa học kì II – Lớp 8',
    scope:'Đòn bẩy, Điện học, Nhiệt học & Hệ vận động – Tiêu hóa – Máu – Tuần hoàn',
    topics:['l8-don-bay','l8-dien','l8-nhiet','l8-van-dong-tieu-hoa','l8-co-the-nguoi']
  },

  // --- Lớp 8: Đề kiểm tra Cuối kì ---
  {
    id:'l8-ck1', grade:8, term:'HK1', kind:'ck', minutes:60, count:24,
    title:'Đề Kiểm tra Cuối học kì I – Lớp 8',
    scope:'Tổng hợp toàn bộ Hóa học 8, Khối lượng riêng – Áp suất & Lực đẩy Archimedes',
    topics:['l8-thi-nghiem','l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-acid-base','l8-oxide-muoi','l8-khoi-luong-rieng','l8-archimedes']
  },
  {
    id:'l8-ck2', grade:8, term:'HK2', kind:'ck', minutes:60, count:24,
    title:'Đề Kiểm tra Cuối học kì II – Lớp 8',
    scope:'Đòn bẩy, Điện, Nhiệt, Toàn bộ Sinh học người – Sinh thái & Ôn cốt lõi cả năm',
    topics:['l8-don-bay','l8-dien','l8-nhiet','l8-van-dong-tieu-hoa','l8-co-the-nguoi','l8-than-kinh-noi-tiet','l8-he-sinh-thai','l8-tinh-pthh','l8-acid-base']
  },

  // --- Lớp 8: Đề Củng cố gốc & Bồi dưỡng Nâng cao ---
  {
    id:'l8-nc-goc', grade:8, term:'Cả năm', kind:'nc', minutes:45, count:20, presetLevel:'basic',
    title:'Đề Củng cố chắc gốc KHTN 8 (Từ dễ đến trung bình)',
    scope:'Hệ thống lại toàn bộ kiến thức nền Nhận biết – Thông hiểu KHTN Lớp 8',
    topics:['l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-acid-base','l8-oxide-muoi','l8-khoi-luong-rieng','l8-archimedes','l8-don-bay','l8-dien','l8-nhiet','l8-van-dong-tieu-hoa','l8-co-the-nguoi','l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },
  {
    id:'l8-nc-hsg', grade:8, term:'Cả năm', kind:'nc', minutes:60, count:20, presetLevel:'advanced',
    title:'Đề Thử sức Vận dụng – Nâng cao KHTN 8',
    scope:'Bài toán chất dư – hiệu suất, pha trộn dung dịch, cơ – nhiệt – điện & sinh lí nâng cao',
    topics:['l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-acid-base','l8-oxide-muoi','l8-khoi-luong-rieng','l8-archimedes','l8-don-bay','l8-dien','l8-nhiet','l8-van-dong-tieu-hoa','l8-co-the-nguoi','l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },

  // =========================================================================
  // LỚP 6 & LỚP 9
  // =========================================================================
  {
    id:'l6-15p-1', grade:6, term:'HK1', kind:'15p', minutes:15, count:8,
    title:'Kiểm tra 15 phút HK1 – Lớp 6',
    scope:'Mở đầu, Các thể của chất, Oxygen & Hỗn hợp',
    topics:['l6-mo-dau','l6-the-chat','l6-oxy-kk','l6-hon-hop']
  },
  {
    id:'l6-15p-2', grade:6, term:'HK2', kind:'15p', minutes:15, count:8,
    title:'Kiểm tra 15 phút HK2 – Lớp 6',
    scope:'Tế bào, Đa dạng thế giới sống, Lực & Năng lượng',
    topics:['l6-te-bao','l6-phan-loai','l6-luc','l6-nang-luong']
  },
  {
    id:'l6-ck', grade:6, term:'Cả năm', kind:'ck', minutes:45, count:15,
    title:'Đề Kiểm tra Cuối năm – Lớp 6',
    scope:'Toàn bộ chương trình KHTN Lớp 6',
    topics:['l6-mo-dau','l6-the-chat','l6-oxy-kk','l6-hon-hop','l6-te-bao','l6-phan-loai','l6-luc','l6-nang-luong','l6-trai-dat']
  },
  {
    id:'l9-15p-1', grade:9, term:'HK1', kind:'15p', minutes:15, count:9,
    title:'Kiểm tra 15 phút HK1 – Lớp 9',
    scope:'Cơ năng, Quang học, Định luật Ohm, Công suất điện & Cảm ứng điện từ',
    topics:['l9-nang-luong-co','l9-anh-sang','l9-dien-ohm','l9-nang-luong-dien','l9-cam-ung']
  },
  {
    id:'l9-15p-2', grade:9, term:'HK2', kind:'15p', minutes:15, count:9,
    title:'Kiểm tra 15 phút HK2 – Lớp 9',
    scope:'Kim loại, Phi kim, Hữu cơ, Lipid – Carbohydrate – Polymer',
    topics:['l9-kim-loai','l9-phi-kim','l9-huu-co','l9-lipid-carb']
  },
  {
    id:'l9-ck', grade:9, term:'Cả năm', kind:'ck', minutes:45, count:18,
    title:'Đề Kiểm tra Tổng hợp – Lớp 9',
    scope:'Toàn bộ Lý – Hóa – Sinh – Trái Đất KHTN Lớp 9',
    topics:['l9-nang-luong-co','l9-anh-sang','l9-dien-ohm','l9-nang-luong-dien','l9-cam-ung','l9-kim-loai','l9-phi-kim','l9-huu-co','l9-lipid-carb','l9-di-truyen','l9-tien-hoa','l9-tai-nguyen']
  }
];
