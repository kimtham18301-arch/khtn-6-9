// Lộ trình Đề Kiểm Tra theo đúng tiến trình năm học THCS (140 tiết/năm · Thông tư 22/2021/TT-BGDĐT):
// Thứ tự thời gian chuẩn trong mỗi học kì để học sinh biết lấy đúng đề ở giai đoạn đang học:
//   [Giai đoạn đầu kì]  Kiểm tra 15p (Lần 1) -> Kiểm tra 15p (Lần 2) -> KIỂM TRA GIỮA KÌ
//   [Giai đoạn sau GK]  Kiểm tra 15p (Lần 3) -> Kiểm tra 15p (Lần 4) -> KIỂM TRA CUỐI KÌ
// Nguyên tắc KHÓA PHẠM VI NGHIÊM NGẶT: Mỗi bài kiểm tra 15p / Giữa kì / Cuối kì CHỈ lấy câu hỏi của đúng bài/giai đoạn đã học,
// TUYỆT ĐỐI KHÔNG chèn kiến thức của giai đoạn sau hay học kì sau!
window.KHTN_EXAMS = [
  // =========================================================================
  // LỚP 7 – CHIA THEO ĐÚNG TIẾN TRÌNH 4 GIAI ĐOẠN NĂM HỌC (140 TIẾT)
  // =========================================================================

  // --- GIAI ĐOẠN 1: Đầu Học kì I -> Giữa kì I (Tuần 1 – Tuần 9) ---
  {
    id:'l7-tx1-hk1', grade:7, term:'HK1', stage:1, weeks:'Tuần 4', col:'hk1-tx1', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Nguyên tử · Tuần 4',
    title:'Kiểm tra 15p Lần 1 (HK1): Nguyên tử & Vỏ electron',
    scope:'Chỉ xoay quanh Bài 2: Hạt p, n, e, sự trung hòa điện, lớp vỏ electron & khối lượng nguyên tử (amu)',
    topics:['l7-nguyen-tu']
  },
  {
    id:'l7-tx2-hk1', grade:7, term:'HK1', stage:1, weeks:'Tuần 6', col:'hk1-tx2', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Bảng tuần hoàn · Tuần 6',
    title:'Kiểm tra 15p Lần 2 (HK1): Nguyên tố & Bảng tuần hoàn',
    scope:'Chỉ xoay quanh Bài 3: Kí hiệu hóa học, ô nguyên tố, chu kì, nhóm và phân loại kim loại/phi kim/khí hiếm',
    topics:['l7-bang-tuan-hoan']
  },
  {
    id:'l7-15p-tocdo', grade:7, term:'HK1', stage:1, weeks:'Tuần 8', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Trước GK1): Tốc độ & Đồ thị s–t',
    scope:'Chỉ xoay quanh Bài 4: v = s/t, đổi đơn vị m/s ↔ km/h, đồ thị s–t và khoảng cách an toàn (không chèn bài khác)',
    topics:['l7-toc-do']
  },
  {
    id:'l7-gk1', grade:7, term:'HK1', stage:1, weeks:'Tuần 9', col:'hk1-gk', coef:2, kind:'gk', minutes:45, count:20,
    shortLabel:'Bài 1–4 · Tuần 9',
    title:'Kiểm tra Giữa học kì I – Lớp 7',
    scope:'Chỉ kiểm tra Giai đoạn đầu HK1 (Tuần 1–8): Mở đầu, Nguyên tử, Bảng tuần hoàn & Tốc độ chuyển động',
    topics:['l7-phuong-phap','l7-nguyen-tu','l7-bang-tuan-hoan','l7-toc-do']
  },

  // --- GIAI ĐOẠN 2: Sau Giữa kì I -> Cuối kì I (Tuần 10 – Tuần 18) ---
  {
    id:'l7-tx3-hk1', grade:7, term:'HK1', stage:2, weeks:'Tuần 13', col:'hk1-tx3', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Phân tử & Hóa trị · Tuần 13',
    title:'Kiểm tra 15p Lần 3 (HK1): Phân tử, Liên kết & Hóa trị',
    scope:'Chỉ xoay quanh Bài 5 & Bài 6: Đơn chất, hợp chất, liên kết ion/cộng hóa trị, hóa trị, lập CTHH & % nguyên tố',
    topics:['l7-phan-tu','l7-hoa-tri']
  },
  {
    id:'l7-15p-hoatri', grade:7, term:'HK1', stage:2, weeks:'Tuần 13', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Sau GK1): Riêng bài Hóa trị & CTHH',
    scope:'Chỉ xoay quanh Bài 6: Quy tắc hóa trị, lập CTHH và tính % khối lượng nguyên tố',
    topics:['l7-hoa-tri']
  },
  {
    id:'l7-tx4-hk1', grade:7, term:'HK1', stage:2, weeks:'Tuần 16', col:'hk1-tx4', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Âm & Ánh sáng · Tuần 16',
    title:'Kiểm tra 15p Lần 4 (HK1): Sóng âm & Phản xạ ánh sáng',
    scope:'Chỉ xoay quanh Bài 7 & Bài 8: Tần số, biên độ, phản xạ âm/tiếng vang, định luật phản xạ ánh sáng & gương phẳng',
    topics:['l7-am-thanh','l7-anh-sang']
  },
  {
    id:'l7-15p-guong', grade:7, term:'HK1', stage:2, weeks:'Tuần 17', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Sau GK1): Riêng bài Ánh sáng & Gương phẳng',
    scope:'Chỉ xoay quanh Bài 8: Tia sáng, góc tới, góc phản xạ và tính chất ảnh qua gương phẳng',
    topics:['l7-anh-sang']
  },
  {
    id:'l7-ck1', grade:7, term:'HK1', stage:2, weeks:'Tuần 18', col:'hk1-ck', coef:3, kind:'ck', minutes:60, count:24,
    shortLabel:'Trọn HK1 (Bài 1–8) · Tuần 18',
    title:'Kiểm tra Cuối học kì I – Lớp 7',
    scope:'Tổng hợp đúng phạm vi Học kì I (Bài 1 → Bài 8; tuyệt đối KHÔNG có Từ trường hay Sinh học của HK2)',
    topics:['l7-phuong-phap','l7-nguyen-tu','l7-bang-tuan-hoan','l7-toc-do','l7-phan-tu','l7-hoa-tri','l7-am-thanh','l7-anh-sang']
  },

  // --- GIAI ĐOẠN 3: Đầu Học kì II -> Giữa kì II (Tuần 19 – Tuần 26) ---
  {
    id:'l7-tx1-hk2', grade:7, term:'HK2', stage:3, weeks:'Tuần 21', col:'hk2-tx1', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Từ trường · Tuần 21',
    title:'Kiểm tra 15p Lần 1 (HK2): Nam châm & Từ trường',
    scope:'Chỉ xoay quanh Bài 9: Tương tác nam châm, đường sức từ, la bàn và nam châm điện',
    topics:['l7-tu']
  },
  {
    id:'l7-tx2-hk2', grade:7, term:'HK2', stage:3, weeks:'Tuần 24', col:'hk2-tx2', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Quang hợp & Hô hấp · Tuần 24',
    title:'Kiểm tra 15p Lần 2 (HK2): Quang hợp & Hô hấp tế bào',
    scope:'Chỉ xoay quanh Bài 10: Nguyên liệu, sản phẩm, ý nghĩa quang hợp – hô hấp tế bào & bảo quản nông sản',
    topics:['l7-trao-doi-chat']
  },
  {
    id:'l7-15p-vanchuyen', grade:7, term:'HK2', stage:3, weeks:'Tuần 25', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Trước GK2): Trao đổi khí, nước & dinh dưỡng',
    scope:'Chỉ xoay quanh Bài 11: Khí khổng, cơ quan trao đổi khí động vật, mạch gỗ, mạch rây & thoát hơi nước',
    topics:['l7-dinh-duong-van-chuyen']
  },
  {
    id:'l7-gk2', grade:7, term:'HK2', stage:3, weeks:'Tuần 26', col:'hk2-gk', coef:2, kind:'gk', minutes:45, count:20,
    shortLabel:'Bài 9–11 · Tuần 26',
    title:'Kiểm tra Giữa học kì II – Lớp 7',
    scope:'Chỉ kiểm tra Giai đoạn đầu HK2 (Tuần 19–26: Từ trường, Quang hợp – Hô hấp, Trao đổi khí – nước; chưa có Sinh sản)',
    topics:['l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen']
  },

  // --- GIAI ĐOẠN 4: Sau Giữa kì II -> Cuối kì II (Tuần 27 – Tuần 35) ---
  {
    id:'l7-tx3-hk2', grade:7, term:'HK2', stage:4, weeks:'Tuần 30', col:'hk2-tx3', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Cảm ứng · Tuần 30',
    title:'Kiểm tra 15p Lần 3 (HK2): Cảm ứng & Tập tính ở sinh vật',
    scope:'Chỉ xoay quanh Bài 12: Hướng động thực vật, tập tính bẩm sinh – học được và ứng dụng nông nghiệp',
    topics:['l7-cam-ung']
  },
  {
    id:'l7-tx4-hk2', grade:7, term:'HK2', stage:4, weeks:'Tuần 33', col:'hk2-tx4', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Sinh trưởng & Sinh sản · Tuần 33',
    title:'Kiểm tra 15p Lần 4 (HK2): Sinh trưởng, Phát triển & Sinh sản',
    scope:'Chỉ xoay quanh Bài 13: Mô phân sinh, vòng đời biến thái, sinh sản vô tính/hữu tính & tính thống nhất cơ thể',
    topics:['l7-cam-ung-sinh-san']
  },
  {
    id:'l7-ck2', grade:7, term:'HK2', stage:4, weeks:'Tuần 35', col:'hk2-ck', coef:3, kind:'ck', minutes:60, count:24,
    shortLabel:'Trọn HK2 (Bài 9–13) · Tuần 35',
    title:'Kiểm tra Cuối học kì II – Lớp 7',
    scope:'Tổng hợp đúng phạm vi Học kì II (Bài 9 → Bài 13: Từ trường & toàn bộ Sinh học lớp 7)',
    topics:['l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung','l7-cam-ung-sinh-san']
  },

  // --- GIAI ĐOẠN 5: Ôn tổng hợp chuyển lớp & Bồi dưỡng Nâng cao ---
  {
    id:'l7-nc-goc', grade:7, term:'Cả năm', stage:5, weeks:'Ôn hè', col:null, coef:1, kind:'nc', minutes:45, count:20, presetLevel:'basic',
    title:'Đề Củng cố gốc cả năm Lớp 7 lên Lớp 8',
    scope:'Ôn tổng hợp kiến thức nền Nhận biết – Thông hiểu cả năm Lớp 7 sau khi đã học xong 2 học kì',
    topics:['l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri','l7-toc-do','l7-am-thanh','l7-anh-sang','l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung','l7-cam-ung-sinh-san']
  },
  {
    id:'l7-nc-hsg', grade:7, term:'Cả năm', stage:5, weeks:'Bồi dưỡng', col:null, coef:1, kind:'nc', minutes:60, count:20, presetLevel:'advanced',
    title:'Đề Bồi dưỡng Vận dụng – Nâng cao KHTN 7',
    scope:'Các dạng bài toán tổng hợp nhiều bước phân loại điểm 9–10 / Học sinh giỏi Lớp 7',
    topics:['l7-nguyen-tu','l7-bang-tuan-hoan','l7-phan-tu','l7-hoa-tri','l7-toc-do','l7-am-thanh','l7-anh-sang','l7-tu','l7-trao-doi-chat','l7-dinh-duong-van-chuyen','l7-cam-ung','l7-cam-ung-sinh-san']
  },

  // =========================================================================
  // LỚP 8 – CHIA THEO ĐÚNG TIẾN TRÌNH 4 GIAI ĐOẠN NĂM HỌC (140 TIẾT)
  // =========================================================================

  // --- GIAI ĐOẠN 1: Đầu Học kì I -> Giữa kì I (Tuần 1 – Tuần 9) ---
  {
    id:'l8-tx1-hk1', grade:8, term:'HK1', stage:1, weeks:'Tuần 4', col:'hk1-tx1', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Phản ứng & BTKL · Tuần 4',
    title:'Kiểm tra 15p Lần 1 (HK1): Phản ứng hóa học & Bảo toàn khối lượng',
    scope:'Chỉ xoay quanh Bài 2: Biến đổi vật lí/hóa học, tỏa/thu nhiệt, cân bằng PTHH & định luật BTKL (chưa dùng mol/dung dịch)',
    topics:['l8-phan-ung']
  },
  {
    id:'l8-tx2-hk1', grade:8, term:'HK1', stage:1, weeks:'Tuần 6', col:'hk1-tx2', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Mol & Tỉ khối · Tuần 6',
    title:'Kiểm tra 15p Lần 2 (HK1): Mol, Thể tích khí & Tỉ khối',
    scope:'Chỉ xoay quanh Bài 3: Đổi đơn vị mol/mmol, khối lượng mol M, thể tích khí 24,79 L (25 °C, 1 bar) & tỉ khối khí (KHÔNG chèn nồng độ hay PTHH)',
    topics:['l8-mol']
  },
  {
    id:'l8-15p-apsuat', grade:8, term:'HK1', stage:1, weeks:'Tuần 8', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Trước GK1): Khối lượng riêng & Áp suất',
    scope:'Chỉ xoay quanh Bài 4: D = m/V, đổi g/cm³ ↔ kg/m³, áp suất rắn p = F/S, áp suất chất lỏng p = d·h & khí quyển',
    topics:['l8-khoi-luong-rieng']
  },
  {
    id:'l8-gk1', grade:8, term:'HK1', stage:1, weeks:'Tuần 9', col:'hk1-gk', coef:2, kind:'gk', minutes:45, count:20,
    shortLabel:'Bài 1–4 · Tuần 9',
    title:'Kiểm tra Giữa học kì I – Lớp 8',
    scope:'Chỉ kiểm tra Giai đoạn đầu HK1 (Tuần 1–8: An toàn thí nghiệm, Phản ứng – BTKL, Mol – Thể tích khí, Khối lượng riêng – Áp suất)',
    topics:['l8-thi-nghiem','l8-phan-ung','l8-mol','l8-khoi-luong-rieng']
  },

  // --- GIAI ĐOẠN 2: Sau Giữa kì I -> Cuối kì I (Tuần 10 – Tuần 18) ---
  {
    id:'l8-tx3-hk1', grade:8, term:'HK1', stage:2, weeks:'Tuần 11', col:'hk1-tx3', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Dung dịch C%, CM · Tuần 11',
    title:'Kiểm tra 15p Lần 3 (HK1): Độ tan, Dung dịch & Nồng độ C%, CM',
    scope:'Chỉ xoay quanh Bài 5: Độ tan S, nồng độ phần trăm C%, nồng độ mol CM và pha loãng dung dịch',
    topics:['l8-dung-dich']
  },
  {
    id:'l8-15p-pthh', grade:8, term:'HK1', stage:2, weeks:'Tuần 13', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Sau GK1): Tính theo PTHH, Hiệu suất & Tốc độ phản ứng',
    scope:'Chỉ xoay quanh Bài 6: Bài toán tính theo PTHH, chất dư – hết, hiệu suất H% và 5 yếu tố tốc độ phản ứng',
    topics:['l8-tinh-pthh']
  },
  {
    id:'l8-tx4-hk1', grade:8, term:'HK1', stage:2, weeks:'Tuần 15', col:'hk1-tx4', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Archimedes & Đòn bẩy · Tuần 15',
    title:'Kiểm tra 15p Lần 4 (HK1): Lực đẩy Archimedes & Đòn bẩy',
    scope:'Chỉ xoay quanh Bài 7 & Bài 8: FA = d·V, điều kiện vật nổi, moment lực M = F·d và cân bằng đòn bẩy',
    topics:['l8-archimedes','l8-don-bay']
  },
  {
    id:'l8-15p-tieuhoa', grade:8, term:'HK1', stage:2, weeks:'Tuần 17', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Sau GK1): Hệ vận động & Dinh dưỡng – Tiêu hóa',
    scope:'Chỉ xoay quanh Bài 9: Bộ xương – hệ cơ, sơ cứu gãy xương, ống tiêu hóa, enzyme và an toàn thực phẩm',
    topics:['l8-van-dong-tieu-hoa']
  },
  {
    id:'l8-ck1', grade:8, term:'HK1', stage:2, weeks:'Tuần 18', col:'hk1-ck', coef:3, kind:'ck', minutes:60, count:24,
    shortLabel:'Trọn HK1 (Bài 1–9) · Tuần 18',
    title:'Kiểm tra Cuối học kì I – Lớp 8',
    scope:'Tổng hợp đúng phạm vi Học kì I (Bài 1 → Bài 9; tuyệt đối KHÔNG chèn Acid–Base–Muối, Điện, Nhiệt, Sinh thái của HK2)',
    topics:['l8-thi-nghiem','l8-phan-ung','l8-mol','l8-khoi-luong-rieng','l8-dung-dich','l8-tinh-pthh','l8-archimedes','l8-don-bay','l8-van-dong-tieu-hoa']
  },

  // --- GIAI ĐOẠN 3: Đầu Học kì II -> Giữa kì II (Tuần 19 – Tuần 26) ---
  {
    id:'l8-tx1-hk2', grade:8, term:'HK2', stage:3, weeks:'Tuần 20', col:'hk2-tx1', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Acid – Base – pH · Tuần 20',
    title:'Kiểm tra 15p Lần 1 (HK2): Acid, Base & Thang pH',
    scope:'Chỉ xoay quanh Bài 10: Tính chất hóa học của acid, kiềm/base không tan, chỉ thị màu, thang pH & phản ứng trung hòa',
    topics:['l8-acid-base']
  },
  {
    id:'l8-15p-muoi', grade:8, term:'HK2', stage:3, weeks:'Tuần 22', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Trước GK2): Oxide, Muối & Phân bón hóa học',
    scope:'Chỉ xoay quanh Bài 11: 4 loại oxide, tên gọi & phản ứng trao đổi của muối, phân đạm – lân – kali – NPK',
    topics:['l8-oxide-muoi']
  },
  {
    id:'l8-tx2-hk2', grade:8, term:'HK2', stage:3, weeks:'Tuần 24', col:'hk2-tx2', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Điện học · Tuần 24',
    title:'Kiểm tra 15p Lần 2 (HK2): Nhiễm điện, Dòng điện, Cường độ & Hiệu điện thế',
    scope:'Chỉ xoay quanh Bài 12: Nhiễm điện do cọ xát, sơ đồ mạch điện, tác dụng dòng điện, ampe kế (I) & vôn kế (U)',
    topics:['l8-dien']
  },
  {
    id:'l8-15p-tuanhoan', grade:8, term:'HK2', stage:3, weeks:'Tuần 25', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Trước GK2): Máu, Tuần hoàn, Hô hấp & Bài tiết',
    scope:'Chỉ xoay quanh Bài 13: Thành phần máu, nhóm máu ABO, miễn dịch, tim – mạch, phổi và lọc máu ở thận',
    topics:['l8-co-the-nguoi']
  },
  {
    id:'l8-gk2', grade:8, term:'HK2', stage:3, weeks:'Tuần 26', col:'hk2-gk', coef:2, kind:'gk', minutes:45, count:20,
    shortLabel:'Bài 10–13 · Tuần 26',
    title:'Kiểm tra Giữa học kì II – Lớp 8',
    scope:'Chỉ kiểm tra Giai đoạn đầu HK2 (Tuần 19–26: Acid–Base–pH, Oxide–Muối–Phân bón, Điện học, Máu–Tuần hoàn–Hô hấp–Bài tiết)',
    topics:['l8-acid-base','l8-oxide-muoi','l8-dien','l8-co-the-nguoi']
  },

  // --- GIAI ĐOẠN 4: Sau Giữa kì II -> Cuối kì II (Tuần 27 – Tuần 35) ---
  {
    id:'l8-tx3-hk2', grade:8, term:'HK2', stage:4, weeks:'Tuần 29', col:'hk2-tx3', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Nhiệt học · Tuần 29',
    title:'Kiểm tra 15p Lần 3 (HK2): Năng lượng nhiệt, Truyền nhiệt & Nở vì nhiệt',
    scope:'Chỉ xoay quanh Bài 14: Nội năng, dẫn nhiệt – đối lưu – bức xạ nhiệt, sự nở vì nhiệt & nhiệt lượng Q = m·c·Δt',
    topics:['l8-nhiet']
  },
  {
    id:'l8-15p-thankinh', grade:8, term:'HK2', stage:4, weeks:'Tuần 31', col:null, coef:1, kind:'15p', minutes:15, count:10,
    title:'Kiểm tra 15p theo bài (Sau GK2): Hệ thần kinh, Giác quan, Nội tiết & Sinh sản',
    scope:'Chỉ xoay quanh Bài 15: Cung phản xạ, tật cận/viễn thị, các tuyến nội tiết (insulin, thyroxine) & sức khỏe sinh sản',
    topics:['l8-than-kinh-noi-tiet']
  },
  {
    id:'l8-tx4-hk2', grade:8, term:'HK2', stage:4, weeks:'Tuần 34', col:'hk2-tx4', coef:1, kind:'15p', minutes:15, count:10,
    shortLabel:'Hệ sinh thái · Tuần 34',
    title:'Kiểm tra 15p Lần 4 (HK2): Quần thể, Quần xã, Hệ sinh thái & Sinh quyển',
    scope:'Chỉ xoay quanh Bài 16: Nhân tố sinh thái, giới hạn sinh thái, quần thể, quần xã, chuỗi thức ăn & bảo vệ môi trường',
    topics:['l8-he-sinh-thai']
  },
  {
    id:'l8-ck2', grade:8, term:'HK2', stage:4, weeks:'Tuần 35', col:'hk2-ck', coef:3, kind:'ck', minutes:60, count:24,
    shortLabel:'Trọn HK2 (Bài 10–16) · Tuần 35',
    title:'Kiểm tra Cuối học kì II – Lớp 8',
    scope:'Tổng hợp đúng phạm vi Học kì II (Bài 10 → Bài 16: Acid–Base–Muối, Điện, Nhiệt, Sinh học người & Hệ sinh thái)',
    topics:['l8-acid-base','l8-oxide-muoi','l8-dien','l8-co-the-nguoi','l8-nhiet','l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },

  // --- GIAI ĐOẠN 5: Ôn tổng hợp cả năm & Bồi dưỡng Nâng cao ---
  {
    id:'l8-nc-goc', grade:8, term:'Cả năm', stage:5, weeks:'Ôn cuối năm', col:null, coef:1, kind:'nc', minutes:45, count:20, presetLevel:'basic',
    title:'Đề Củng cố gốc cả năm Lớp 8 lên Lớp 9',
    scope:'Hệ thống lại kiến thức nền Nhận biết – Thông hiểu toàn bộ năm học KHTN Lớp 8',
    topics:['l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-acid-base','l8-oxide-muoi','l8-khoi-luong-rieng','l8-archimedes','l8-don-bay','l8-dien','l8-nhiet','l8-van-dong-tieu-hoa','l8-co-the-nguoi','l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },
  {
    id:'l8-nc-hsg', grade:8, term:'Cả năm', stage:5, weeks:'Bồi dưỡng', col:null, coef:1, kind:'nc', minutes:60, count:20, presetLevel:'advanced',
    title:'Đề Bồi dưỡng Vận dụng – Nâng cao KHTN 8',
    scope:'Các dạng bài toán chất dư – hiệu suất, pha trộn dung dịch, cơ – nhiệt – điện & sinh lí nâng cao (điểm 9–10 / HSG)',
    topics:['l8-phan-ung','l8-mol','l8-dung-dich','l8-tinh-pthh','l8-acid-base','l8-oxide-muoi','l8-khoi-luong-rieng','l8-archimedes','l8-don-bay','l8-dien','l8-nhiet','l8-van-dong-tieu-hoa','l8-co-the-nguoi','l8-than-kinh-noi-tiet','l8-he-sinh-thai']
  },

  // =========================================================================
  // LỚP 6 & LỚP 9
  // =========================================================================
  {
    id:'l6-15p-1', grade:6, term:'HK1', stage:1, weeks:'Học kì I', col:'hk1-tx1', coef:1, kind:'15p', minutes:15, count:8,
    title:'Kiểm tra 15p (HK1) – Lớp 6',
    scope:'Mở đầu, Các thể của chất, Oxygen & Hỗn hợp',
    topics:['l6-mo-dau','l6-the-chat','l6-oxy-kk','l6-hon-hop']
  },
  {
    id:'l6-15p-2', grade:6, term:'HK2', stage:3, weeks:'Học kì II', col:'hk2-tx1', coef:1, kind:'15p', minutes:15, count:8,
    title:'Kiểm tra 15p (HK2) – Lớp 6',
    scope:'Tế bào, Đa dạng thế giới sống, Lực & Năng lượng',
    topics:['l6-te-bao','l6-phan-loai','l6-luc','l6-nang-luong']
  },
  {
    id:'l6-ck', grade:6, term:'Cả năm', stage:4, weeks:'Cuối năm', col:'hk2-ck', coef:3, kind:'ck', minutes:45, count:15,
    title:'Kiểm tra Cuối năm – Lớp 6',
    scope:'Toàn bộ chương trình KHTN Lớp 6',
    topics:['l6-mo-dau','l6-the-chat','l6-oxy-kk','l6-hon-hop','l6-te-bao','l6-phan-loai','l6-luc','l6-nang-luong','l6-trai-dat']
  },
  {
    id:'l9-15p-1', grade:9, term:'HK1', stage:1, weeks:'Học kì I', col:'hk1-tx1', coef:1, kind:'15p', minutes:15, count:9,
    title:'Kiểm tra 15p (HK1) – Lớp 9',
    scope:'Cơ năng, Quang học, Định luật Ohm, Công suất điện & Cảm ứng điện từ',
    topics:['l9-nang-luong-co','l9-anh-sang','l9-dien-ohm','l9-nang-luong-dien','l9-cam-ung']
  },
  {
    id:'l9-15p-2', grade:9, term:'HK2', stage:3, weeks:'Học kì II', col:'hk2-tx1', coef:1, kind:'15p', minutes:15, count:9,
    title:'Kiểm tra 15p (HK2) – Lớp 9',
    scope:'Kim loại, Phi kim, Hữu cơ, Lipid – Carbohydrate – Polymer',
    topics:['l9-kim-loai','l9-phi-kim','l9-huu-co','l9-lipid-carb']
  },
  {
    id:'l9-ck', grade:9, term:'Cả năm', stage:4, weeks:'Cuối năm', col:'hk2-ck', coef:3, kind:'ck', minutes:45, count:18,
    title:'Kiểm tra Tổng hợp – Lớp 9',
    scope:'Toàn bộ Lý – Hóa – Sinh – Trái Đất KHTN Lớp 9',
    topics:['l9-nang-luong-co','l9-anh-sang','l9-dien-ohm','l9-nang-luong-dien','l9-cam-ung','l9-kim-loai','l9-phi-kim','l9-huu-co','l9-lipid-carb','l9-di-truyen','l9-tien-hoa','l9-tai-nguyen']
  }
];
