(function(){
'use strict';

// Ngân hàng câu hỏi mở rộng + Bộ sinh biến thể tham số động (Parametric Question Generator)
// Đảm bảo mỗi lần bấm vào bài học hoặc đề kiểm tra đều sinh bộ câu hỏi ngẫu nhiên mới, chuẩn xác 100% theo GDPT 2018.

function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function round(v, dec){ var f = Math.pow(10, dec || 0); return Math.round(v * f) / f; }
function fmt(n){ return String(n).replace('.', ','); }
function shuffle(a){
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// ============================================================================
// 1. NGÂN HÀNG CÂU HỎI TĨNH BỔ SUNG CHO CÁC BÀI LÍ THUYẾT / SINH HỌC / THỰC HÀNH
// ============================================================================
var EXTRA_STATIC = {
  'l7-phuong-phap': [
    {d:1,q:'Dụng cụ nào dùng để quan sát cấu tạo tế bào biểu bì vảy hành trong phòng thí nghiệm?',o:['Kính hiển vi quang học','Kính thiên văn','Ống nhòm','Nhiệt kế thủy ngân'],w:'Tế bào có kích thước hiển vi nên cần quan sát bằng kính hiển vi quang học.'},
    {d:1,q:'Khi đọc mực chất lỏng trong ống đong, ta cần đặt mắt như thế nào?',o:['Ngang bằng với đáy vạch cong của mặt chất lỏng','Nhìn xiên từ trên cao xuống','Nhìn xiên từ dưới thấp lên','Nhắm một mắt nhìn từ xa 2 m'],w:'Đặt mắt vuông góc ngang tầm vạch chia đáy mặt khum để tránh sai số thị sai.'},
    {d:2,q:'Bước cuối cùng của tiến trình tìm hiểu tự nhiên là gì?',o:['Viết báo cáo, trình bày và rút ra kết luận','Đưa ra dự đoán ban đầu','Quan sát hiện tượng','Chuẩn bị hóa chất'],w:'Sau khi kiểm tra giả thuyết bằng thí nghiệm, nhà nghiên cứu báo cáo và kết luận.'},
    {d:2,q:'Đổi khoảng thời gian 1,25 giây sang mili-giây (ms).',n:1250,t:0,u:'ms',w:'1,25 × 1000 = 1250 ms.'},
    {d:3,q:'Xe lăn gắn tấm cản quang rộng 4 cm đi qua cổng quang điện trong 0,08 s. Tốc độ xe qua cổng là bao nhiêu cm/s?',n:50,t:0.1,u:'cm/s',w:'v = 4 : 0,08 = 50 cm/s.'},
    {d:4,q:'Khoảng cách giữa hai cổng quang điện A và B là 60 cm. Đồng hồ hiện số ở chế độ A↔B chỉ 1,200 s. Tốc độ trung bình của xe trên đoạn AB là bao nhiêu m/s?',n:0.5,t:0.01,u:'m/s',w:'Đổi 60 cm = 0,6 m ⇒ v = 0,6 / 1,2 = 0,5 m/s.'}
  ],
  'l7-tu': [
    {d:1,q:'Trên thanh nam châm thẳng thường sơn hai màu và kí hiệu N, S. Kí hiệu S chỉ cực nào của nam châm?',o:['Cực Nam (South)','Cực Bắc (North)','Vùng trung hòa','Cực Đông'],w:'N là cực Bắc (North), S là cực Nam (South).'},
    {d:1,q:'Vật nào sau đây KHÔNG bị nam châm hút?',o:['Thước nhựa và dây đồng','Đinh sắt','Ghim giấy bằng thép','Mảnh niken'],w:'Nhựa và đồng không phải vật liệu có từ tính.'},
    {d:2,q:'Hình ảnh các đường cong tạo bởi mạt sắt xung quanh nam châm được gọi là gì?',o:['Từ phổ','Quang phổ','Đồ thị quãng đường','Sơ đồ mạch điện'],w:'Mạt sắt sắp xếp dọc theo đường sức từ tạo thành từ phổ.'},
    {d:2,q:'Trên thanh nam châm thẳng, vùng nào có từ tính YẾU NHẤT?',o:['Phần chính giữa thanh nam châm','Đầu cực Bắc (N)','Đầu cực Nam (S)','Hai đầu cực mạnh bằng vùng giữa'],w:'Từ tính tập trung mạnh nhất ở hai từ cực và rất yếu ở chính giữa (miền trung hòa).'},
    {d:3,q:'Khi đưa cực Bắc của nam châm lại gần một đầu cuộn dây có dòng điện thì thấy chúng ĐẨY NHAU. Đầu cuộn dây đó là cực từ gì?',o:['Cực Bắc (N)','Cực Nam (S)','Không có cực từ','Cực âm điện'],w:'Hai cực cùng tên đẩy nhau nên đầu cuộn dây đó là cực Bắc (N).'},
    {d:3,q:'Thiết bị nào sau đây có bộ phận chính là nam châm điện?',o:['Chuông điện và rơ-le điện từ','Gương chiếu hậu xe máy','Nhiệt kế y tế','Ống đong thủy tinh'],w:'Chuông điện, cần cẩu từ, loa điện động và rơ-le đều hoạt động nhờ nam châm điện.'},
    {d:4,q:'Một tàu thám hiểm ở Bắc Bán Cầu nhìn la bàn thấy đầu kim sơn đỏ chỉ thẳng về phía trước mặt. Phía bên tay phải của người cầm la bàn là hướng địa lí nào?',o:['Hướng Đông','Hướng Tây','Hướng Nam','Hướng Bắc'],w:'Trước mặt là Bắc, sau lưng là Nam, bên phải là Đông, bên trái là Tây.'}
  ],
  'l7-trao-doi-chat': [
    {d:1,q:'Bào quan thực hiện chức năng quang hợp ở tế bào lá cây xanh là gì?',o:['Lục lạp','Ti thể','Nhân tế bào','Màng sinh chất'],w:'Lục lạp chứa chất diệp lục hấp thụ năng lượng ánh sáng.'},
    {d:1,q:'Nguyên liệu trực tiếp của quá trình quang hợp ở thực vật gồm những chất nào?',o:['Khí carbon dioxide (CO₂) và nước (H₂O)','Khí oxygen (O₂) và glucose','Nitrogen (N₂) và tinh bột','Protein và muối khoáng'],w:'Cây lấy H₂O từ rễ và CO₂ qua khí khổng để quang hợp.'},
    {d:2,q:'Nhiệt độ quá cao (trên 45 – 50 °C) làm tốc độ quang hợp và hô hấp tế bào giảm mạnh vì sao?',o:['Làm biến tính và mất hoạt tính các enzyme xúc tác trong tế bào','Làm cây biến thành động vật','Làm ánh sáng biến mất','Làm nước đông thành đá'],w:'Quang hợp và hô hấp đều do hệ enzyme protein xúc tác, rất nhạy cảm với nhiệt độ cao.'},
    {d:2,q:'Loài cây nào sau đây thuộc nhóm CÂY ƯA BÓNG (sống tốt nơi ánh sáng yếu, dưới tán rừng hoặc trong nhà)?',o:['Cây lá lốt, trầu bà, lan ý','Cây lúa nước','Cây ngô (bắp)','Cây phi lao ngoài bãi biển'],w:'Lá lốt, trầu bà có phiến lá mỏng, màu xanh sẫm thích nghi ánh sáng tán xạ yếu.'},
    {d:3,q:'Trong thí nghiệm chứng minh hạt đang nảy mầm hô hấp, người ta dẫn khí trong bình chứa hạt nảy mầm vào ống nghiệm đựng nước vôi trong thì thấy hiện tượng gì?',o:['Nước vôi trong bị vẩn đục trắng do hạt hô hấp thải ra nhiều khí CO₂','Nước vôi trong chuyển sang màu đỏ tươi','Que đóm tắt bùng cháy mãnh liệt','Bình hạt tự đóng băng'],w:'Hạt nảy mầm hô hấp mạnh thải CO₂ làm đục nước vôi trong Ca(OH)₂.'},
    {d:4,q:'Khi ủ hạt thóc giống ẩm trong đống kín để nảy mầm, sờ tay vào đống thóc thấy ẤM NÓNG lên. Nguyên nhân của hiện tượng này là gì?',o:['Hạt đang nảy mầm hô hấp tế bào rất mạnh, một phần năng lượng giải phóng dưới dạng nhiệt','Hạt đang quang hợp tạo ra lửa','Ánh sáng trong kho chiếu vào làm nóng','Nước tự phân hủy thành khí hydrogen'],w:'Hô hấp tế bào phân giải chất hữu cơ tạo ATP và tỏa nhiều nhiệt năng.'}
  ],
  'l7-dinh-duong-van-chuyen': [
    {d:1,q:'Ở lá của phần lớn cây thân gỗ trên cạn, khí khổng thường tập trung nhiều hơn ở đâu?',o:['Biểu bì mặt dưới của lá','Biểu bì mặt trên của lá','Trong lõi gỗ của thân','Ở chóp rễ dưới đất'],w:'Mặt dưới lá ít bị nắng chiếu trực tiếp giúp giảm mất nước quá mức qua khí khổng.'},
    {d:1,q:'Ếch đồng trưởng thành trao đổi khí qua những cơ quan nào?',o:['Qua phổi và qua lớp da ẩm ướt','Chỉ qua hệ thống ống khí','Chỉ qua mang ngoài','Qua khí khổng'],w:'Lưỡng cư (ếch) hô hấp bằng phổi kết hợp trao đổi khí mạnh qua da ẩm.'},
    {d:2,q:'Động lực chính giúp kéo cột nước và muối khoáng từ rễ lên tới ngọn những cây cao hàng chục mét là gì?',o:['Lực hút đầu trên do quá trình thoát hơi nước ở lá kết hợp lực đẩy của rễ','Do gió thổi từ dưới lên','Do mạch rây bơm ngược lên','Do trọng lực hút lên trên'],w:'Thoát hơi nước qua khí khổng tạo sức hút lớn kéo dòng mạch gỗ liên tục đi lên.'},
    {d:2,q:'Bệnh BƯỚU CỔ ở người chủ yếu liên quan đến sự thiếu hụt nguyên tố vi lượng nào trong chế độ dinh dưỡng?',o:['Iodine (i-ốt)','Calcium','Vitamin C','Chất xơ'],w:'Thiếu iodine làm tuyến giáp không tổng hợp đủ hormone.'},
    {d:3,q:'Vì sao đất trồng cây trên cạn cần được xới xáo tơi xốp và tiêu nước kịp thời khi ngập úng lâu ngày?',o:['Để rễ cây có đủ khí oxygen trong các khe đất thực hiện hô hấp tế bào, hút nước và khoáng tốt','Để rễ cây nhận được ánh sáng quang hợp','Để tiêu diệt toàn bộ giun đất','Để làm đứt hết lông hút của cây'],w:'Ngập úng lâu làm thiếu O₂, rễ hô hấp kị khí sinh chất độc làm thối rễ, cây héo chết.'},
    {d:4,q:'Trong một ngày nắng ráo mùa hè, vào khoảng 12 giờ trưa nắng gắt nhất, nhiều cây trên cạn lại có hiện tượng giảm nhẹ thoát hơi nước ("ngủ trưa"). Vì sao?',o:['Nhiệt độ quá cao và thiếu nước tạm thời làm tế bào khí khổng đóng bớt lại để bảo vệ cây khỏi héo','Vì 12 giờ trưa không có ánh sáng Mặt Trời','Vì mạch gỗ biến mất vào buổi trưa','Vì rễ cây ngừng sống vào buổi trưa'],w:'Cơ chế tự vệ đóng bớt khí khổng giữa trưa nắng gắt giúp cây tránh mất nước nguy kịch.'}
  ],
  'l7-cam-ung-sinh-san': [
    {d:1,q:'Khi chạm nhẹ tay vào lá cây trinh nữ (cây xấu hổ), lá lập tức cụp lại. Đây là hiện tượng gì?',o:['Cảm ứng (ứng động tiếp xúc) ở thực vật','Quang hợp của lá','Sinh sản vô tính','Hô hấp tế bào'],w:'Sức trương nước ở thể gối cuống lá giảm đột ngột làm lá cụp lại.'},
    {d:1,q:'Loài động vật nào sau đây sinh sản vô tính bằng hình thức NẢY CHỒI?',o:['Thủy tức','Chó nhà','Chim bồ câu','Cá chép'],w:'Cơ thể con mọc chồi từ thân thủy tức mẹ rồi tách ra sống độc lập.'},
    {d:2,q:'Rễ cây luôn mọc đâm sâu xuống đất (cùng chiều trọng lực) là kiểu hướng động nào?',o:['Hướng trọng lực dương (hướng đất dương)','Hướng sáng dương','Hướng trọng lực âm','Hướng tiếp xúc'],w:'Rễ hướng trọng lực dương để bám đất và tìm nước; thân hướng trọng lực âm.'},
    {d:2,q:'Sự chuyển hạt phấn từ nhị tới đầu nhụy của hoa được gọi là quá trình gì?',o:['Thụ phấn','Thụ tinh','Nảy mầm','Nguyên phân'],w:'Thụ phấn xảy ra trước, sau đó ống phấn mọc tới noãn mới diễn ra thụ tinh.'},
    {d:3,q:'Người dân dùng đèn bẫy côn trùng vào ban đêm để diệt sâu bướm hại lúa là ứng dụng hiện tượng nào?',o:['Tập tính hướng sáng của nhiều loài côn trùng hoạt động ban đêm','Tập tính di cư tránh đông','Sinh sản vô tính của sâu bướm','Quang hợp của côn trùng'],w:'Nhiều loài bướm đêm có tập tính lao vào nguồn sáng.'},
    {d:4,q:'Khi ghép cành bưởi diễn (quả ngọt) lên gốc cây bưởi dại (rễ khỏe, chịu hạn tốt), quả mọc ra trên cành ghép sẽ mang đặc điểm vị của cây nào?',o:['Ngọt thơm giống cây bưởi diễn cho cành ghép','Chua đắng giống gốc bưởi dại','Nửa quả ngọt nửa quả đắng','Biến thành quả cam'],w:'Cành ghép phát triển bằng nguyên phân giữ nguyên kiểu gene của cây cho cành, còn gốc ghép cung cấp nước và khoáng.'}
  ],
  'l8-thi-nghiem': [
    {d:1,q:'Dụng cụ thủy tinh có cổ hẹp, đáy rộng phẳng (dùng lắc dung dịch khi chuẩn độ mà không bị sánh ra ngoài) gọi là gì?',o:['Bình tam giác (Erlenmeyer)','Ống nghiệm','Mặt kính đồng hồ','Đũa thủy tinh'],w:'Bình tam giác có thành nghiêng thu hẹp ở cổ giúp lắc trộn an toàn.'},
    {d:2,q:'Kí hiệu cảnh báo hình đầu lâu xương chéo trên nhãn lọ hóa chất cho biết ý nghĩa gì?',o:['Hóa chất độc hại nguy hiểm','Hóa chất dễ ăn mòn','Chất phóng xạ','Dụng cụ thủy tinh dễ vỡ'],w:'Biểu tượng đầu lâu xương chéo cảnh báo hóa chất độc cấp tính.'},
    {d:3,q:'Khi dùng biến áp nguồn trong thí nghiệm điện lớp 8, thao tác nào cần thực hiện TRƯỚC KHI cắm điện và bật công tắc nguồn?',o:['Kiểm tra sơ đồ mạch đúng chưa và vặn núm chọn điện áp về mức nhỏ nhất phù hợp','Chập hai đầu dây đầu ra lại với nhau để thử lửa','Tháo cầu chì bảo vệ của biến áp nguồn','Nhúng biến áp nguồn vào chậu nước làm mát'],w:'Luôn kiểm tra mạch hở/ngắn mạch và đặt mức điện áp thấp đúng yêu cầu trước khi cấp nguồn.'},
    {d:4,q:'Vì sao không dùng nước để dập đám cháy do xăng, dầu hỏa trong phòng thí nghiệm mà phải dùng cát hoặc bình chữa cháy bột/CO₂?',o:['Xăng dầu nhẹ hơn nước và không tan trong nước nên nổi lên trên mặt nước khiến đám cháy loang rộng hơn','Vì nước tác dụng hóa học với xăng tạo khí nổ','Vì nước nặng hơn cát gấp 10 lần','Vì xăng dầu làm đóng băng nước'],w:'D_xăng < D_nước nên phun nước làm xăng nổi tràn lan, lửa càng cháy rộng.'}
  ],
  'l8-van-dong-tieu-hoa': [
    {d:1,q:'Khớp xương nào sau đây thuộc loại KHỚP ĐỘNG (cử động linh hoạt rộng rãi)?',o:['Khớp đầu gối, khớp khuỷu tay, khớp vai','Khớp hộp sọ','Khớp giữa các đốt sống thắt lưng','Khớp xương chậu cố định'],w:'Khớp động có sụn đầu khớp và dịch khớp giúp cử động dễ dàng.'},
    {d:2,q:'Ở dạ dày người, loại enzyme nào hoạt động trong môi trường acid HCl để bước đầu phân giải protein thành chuỗi ngắn?',o:['Enzyme pepsin','Enzyme amylase nước bọt','Hormone insulin','Sắc tố hemoglobin'],w:'Tuyến vị tiết HCl hoạt hóa pepsinogen thành pepsin tiêu hóa protein.'},
    {d:3,q:'Thực phẩm lạc (đậu phộng), ngô bị mốc xanh mốc vàng tuyệt đối không được ăn vì chứa độc tố nguy hiểm nào gây ung thư gan?',o:['Độc tố Aflatoxin do nấm mốc Aspergillus tiết ra','Vitamin B12','Muối khoáng Calcium','Đường maltose'],w:'Aflatoxin rất bền với nhiệt (đun sôi thường không phân hủy hết) và gây ung thư gan.'},
    {d:4,q:'Khi vận động chạy bền quá sức, bắp cơ bị mỏi và đau nhức chủ yếu do sự tích tụ chất nào khi tế bào cơ thiếu oxygen?',o:['Lactic acid','Đường saccharose','Khí nitrogen','Tinh bột'],w:'Hô hấp kị khí ở tế bào cơ thiếu O₂ sinh ra lactic acid gây mỏi cơ.'}
  ],
  'l8-co-the-nguoi': [
    {d:1,q:'Thành phần nào của máu giữ vai trò chính trong quá trình ĐÔNG MÁU bảo vệ cơ thể khỏi mất máu khi đứt tay?',o:['Tiểu cầu','Hồng cầu','Kháng thể nhóm ABO','Nước tiểu đầu'],w:'Tiểu cầu vỡ giải phóng enzyme tạo mạng sợi tơ máu (fibrin) giữ tế bào máu thành cục máu đông.'},
    {d:2,q:'Ở người trưởng thành bình thường lúc nghỉ ngơi, nhịp tim trung bình khoảng bao nhiêu lần mỗi phút?',o:['Khoảng 70 – 75 nhịp/phút','Khoảng 10 – 12 nhịp/phút','Khoảng 250 nhịp/phút','Đúng 5 nhịp/phút'],w:'Một chu kì tim kéo dài khoảng 0,8 s ⇒ 60 / 0,8 = 75 nhịp/phút.'},
    {d:3,q:'Một bệnh nhân có nhóm máu AB cần truyền máu. Theo quy tắc truyền máu hệ ABO, bệnh nhân này có thể nhận máu từ nhóm nào mà không bị ngưng kết hồng cầu?',o:['Nhận được từ cả 4 nhóm O, A, B, AB (tốt nhất là cùng nhóm AB)','Chỉ nhận được duy nhất nhóm O','Chỉ nhận được nhóm A','Không nhận được nhóm nào'],w:'Huyết tương nhóm AB không có kháng thể α và β nên là nhóm chuyên nhận.'},
    {d:4,q:'Cơ chế hít vào bình thường ở người diễn ra như thế nào?',o:['Cơ liên sườn ngoài và cơ hoành co làm thể tích lồng ngực tăng, áp suất trong phổi giảm nhỏ hơn khí quyển nên không khí tràn vào phổi','Tim bơm không khí vào phổi làm lồng ngực phồng lên','Phế nang tự nở ra hút xương sườn đi vào','Cơ hoành dãn nâng lên làm thể tích lồng ngực giảm'],w:'Thể tích lồng ngực tăng → áp suất phế nang giảm → không khí đi từ ngoài vào phổi.'}
  ],
  'l8-than-kinh-noi-tiet': [
    {d:1,q:'Tiểu não ở não bộ người có chức năng quan trọng nhất là gì?',o:['Điều hòa, phối hợp các cử động phức tạp và giữ thăng bằng cơ thể','Lọc máu tạo nước tiểu','Tiết dịch mật tiêu hóa mỡ','Thu nhận ánh sáng tạo ảnh'],w:'Tổn thương tiểu não làm người đi đứng loạng choạng, mất thăng bằng.'},
    {d:2,q:'Người già hoặc người có cầu mắt quá ngắn thường mắc tật VIỄN THỊ (ảnh hiện sau màng lưới). Để nhìn rõ vật ở gần cần đeo kính gì?',o:['Kính lão là thấu kính hội tụ','Thấu kính phân kì','Gương cầu lồi','Kính râm không độ'],w:'Thấu kính hội tụ kéo ảnh từ phía sau tiến về đúng trên màng lưới.'},
    {d:3,q:'Khi gặp tình huống nguy hiểm bất ngờ (như chó dữ đuổi), tuyến thượng thận tiết nhanh hormone nào làm tim đập nhanh, tăng huyết áp và đường huyết để cơ thể phản ứng tức thời?',o:['Adrenaline','Estrogen','Amylase','Pepsin'],w:'Adrenaline huy động năng lượng khẩn cấp cho phản ứng "chiến đấu hay bỏ chạy".'},
    {d:4,q:'Tuyến tụy được gọi là TUYẾN PHA vì lí do nào sau đây?',o:['Vừa thực hiện chức năng ngoại tiết (tiết dịch tụy đổ vào ruột non tiêu hóa), vừa nội tiết (tiết insulin và glucagon ngấm thẳng vào máu)','Vì nằm pha trộn ở trong tim','Vì chỉ hoạt động vào mùa xuân','Vì vừa lọc nước tiểu vừa trao đổi khí'],w:'Tuyến tụy và tuyến sinh dục đều là các tuyến pha (vừa nội tiết vừa ngoại tiết).'}
  ],
  'l8-he-sinh-thai': [
    {d:1,q:'Các cây thông nhựa mọc gần nhau trong rừng có hiện tượng rễ liền nhau giúp chia sẻ nước và muối khoáng, chống chịu gió bão tốt hơn. Đây là mối quan hệ gì?',o:['Hỗ trợ cùng loài','Cạnh tranh khác loài','Kí sinh cùng loài','Sinh vật này ăn sinh vật khác'],w:'Các cây thông cùng loài hỗ trợ nhau vượt qua điều kiện bất lợi.'},
    {d:2,q:'Mối quan hệ giữa cây tầm gửi sống bám trên thân cây nhãn, hút nước và chất dinh dưỡng của cây nhãn làm cây nhãn suy yếu là quan hệ gì?',o:['Kí sinh – vật chủ','Cộng sinh đôi bên cùng lợi','Hội sinh','Hợp tác'],w:'Một loài có lợi còn loài chủ bị hại là quan hệ kí sinh.'},
    {d:3,q:'Trong một lưới thức ăn tự nhiên ở rừng, vì sao hệ sinh thái rừng mưa nhiệt đới lại có tính ổn định cân bằng sinh học cao hơn hệ sinh thái đồng ruộng độc canh?',o:['Vì rừng có độ đa dạng loài rất cao, lưới thức ăn phức tạp nên nếu 1 loài biến động thì loài khác thay thế mắt xích dễ dàng','Vì rừng không có sinh vật phân giải','Vì đồng ruộng có nhiều loài hổ báo hơn','Vì rừng không chịu tác động của ánh sáng'],w:'Độ đa dạng sinh học càng cao, lưới thức ăn càng nhiều mắt xích chung thì hệ sinh thái càng bền vững.'},
    {d:4,q:'Cho chuỗi thức ăn: Tảo lục → Giáp xác nhỏ → Cá mương → Cá quả (cá lóc). Nếu nguồn nước bị nhiễm kim loại nặng khó phân hủy sinh học (như thủy ngân) ở nồng độ thấp, loài nào trong chuỗi sẽ tích lũy độc chất ở nồng độ CAO NHẤT?',o:['Cá quả (bậc dinh dưỡng cao nhất cuối chuỗi)','Tảo lục','Giáp xác nhỏ','Cả 4 loài có nồng độ bằng hệt nhau'],w:'Hiện tượng khuếch đại sinh học: chất độc khó phân hủy tích lũy tăng dần lên bậc dinh dưỡng cao nhất.'}
  ]
};

// ============================================================================
// 2. BỘ SINH CÂU HỎI ĐỘNG THEO THAM SỐ (PARAMETRIC GENERATORS) CHO LỚP 7 & LỚP 8
// ============================================================================
var ELEMENTS_20 = [
  {z:3,sym:'Li',name:'Lithium',n:4,p:2,g:'IA',type:'Kim loại'},
  {z:4,sym:'Be',name:'Beryllium',n:5,p:2,g:'IIA',type:'Kim loại'},
  {z:6,sym:'C',name:'Carbon',n:6,p:2,g:'IVA',type:'Phi kim'},
  {z:7,sym:'N',name:'Nitrogen',n:7,p:2,g:'VA',type:'Phi kim'},
  {z:8,sym:'O',name:'Oxygen',n:8,p:2,g:'VIA',type:'Phi kim'},
  {z:9,sym:'F',name:'Fluorine',n:10,p:2,g:'VIIA',type:'Phi kim'},
  {z:10,sym:'Ne',name:'Neon',n:10,p:2,g:'VIIIA',type:'Khí hiếm'},
  {z:11,sym:'Na',name:'Sodium',n:12,p:3,g:'IA',type:'Kim loại'},
  {z:12,sym:'Mg',name:'Magnesium',n:12,p:3,g:'IIA',type:'Kim loại'},
  {z:13,sym:'Al',name:'Aluminium',n:14,p:3,g:'IIIA',type:'Kim loại'},
  {z:14,sym:'Si',name:'Silicon',n:14,p:3,g:'IVA',type:'Phi kim'},
  {z:15,sym:'P',name:'Phosphorus',n:16,p:3,g:'VA',type:'Phi kim'},
  {z:16,sym:'S',name:'Sulfur',n:16,p:3,g:'VIA',type:'Phi kim'},
  {z:17,sym:'Cl',name:'Chlorine',n:18,p:3,g:'VIIA',type:'Phi kim'},
  {z:18,sym:'Ar',name:'Argon',n:22,p:3,g:'VIIIA',type:'Khí hiếm'},
  {z:19,sym:'K',name:'Potassium',n:20,p:4,g:'IA',type:'Kim loại'},
  {z:20,sym:'Ca',name:'Calcium',n:20,p:4,g:'IIA',type:'Kim loại'}
];

function outerElectrons(z){
  if (z <= 2) return z;
  if (z <= 10) return z - 2;
  if (z <= 18) return z - 10;
  return z - 18;
}

var COMPOUNDS = [
  {f:'Na₂O', M:62, el:'Na', x:2, Mx:23, hint:'Na=23, O=16'},
  {f:'K₂O', M:94, el:'K', x:2, Mx:39, hint:'K=39, O=16'},
  {f:'MgO', M:40, el:'Mg', x:1, Mx:24, hint:'Mg=24, O=16'},
  {f:'CaO', M:56, el:'Ca', x:1, Mx:40, hint:'Ca=40, O=16'},
  {f:'Al₂O₃', M:102, el:'Al', x:2, Mx:27, hint:'Al=27, O=16'},
  {f:'FeO', M:72, el:'Fe', x:1, Mx:56, hint:'Fe=56, O=16'},
  {f:'Fe₂O₃', M:160, el:'Fe', x:2, Mx:56, hint:'Fe=56, O=16'},
  {f:'CuO', M:80, el:'Cu', x:1, Mx:64, hint:'Cu=64, O=16'},
  {f:'SO₂', M:64, el:'S', x:1, Mx:32, hint:'S=32, O=16'},
  {f:'SO₃', M:80, el:'S', x:1, Mx:32, hint:'S=32, O=16'},
  {f:'P₂O₅', M:142, el:'P', x:2, Mx:31, hint:'P=31, O=16'},
  {f:'CaCO₃', M:100, el:'Ca', x:1, Mx:40, hint:'Ca=40, C=12, O=16'},
  {f:'MgSO₄', M:120, el:'Mg', x:1, Mx:24, hint:'Mg=24, S=32, O=16'},
  {f:'CuSO₄', M:160, el:'Cu', x:1, Mx:64, hint:'Cu=64, S=32, O=16'},
  {f:'NaOH', M:40, el:'Na', x:1, Mx:23, hint:'Na=23, O=16, H=1'},
  {f:'Ca(OH)₂', M:74, el:'Ca', x:1, Mx:40, hint:'Ca=40, O=16, H=1'},
  {f:'Fe₂(SO₄)₃', M:400, el:'Fe', x:2, Mx:56, hint:'Fe=56, S=32, O=16'}
];

var GASES = [
  {f:'H₂', M:2, hint:'H = 1'},
  {f:'CH₄', M:16, hint:'C = 12, H = 1'},
  {f:'NH₃', M:17, hint:'N = 14, H = 1'},
  {f:'N₂', M:28, hint:'N = 14'},
  {f:'CO', M:28, hint:'C = 12, O = 16'},
  {f:'O₂', M:32, hint:'O = 16'},
  {f:'CO₂', M:44, hint:'C = 12, O = 16'},
  {f:'SO₂', M:64, hint:'S = 32, O = 16'}
];

var GENERATORS = {
  'l7-nguyen-tu': function(){
    var out = [];
    var e1 = pick(ELEMENTS_20), e2 = pick(ELEMENTS_20), e3 = pick(ELEMENTS_20), e4 = pick(ELEMENTS_20);
    out.push({
      d:1, q:'Nguyên tử ' + e1.name + ' (' + e1.sym + ') có ' + e1.z + ' proton trong hạt nhân. Số electron ở vỏ nguyên tử này là bao nhiêu?',
      n:e1.z, t:0, u:'electron', w:'Nguyên tử trung hòa về điện nên số e = số p = ' + e1.z + '.'
    });
    out.push({
      d:2, q:'Nguyên tử ' + e2.name + ' (' + e2.sym + ') có ' + e2.z + ' proton và ' + e2.n + ' neutron. Khối lượng nguyên tử xấp xỉ bao nhiêu amu?',
      n:e2.z + e2.n, t:0, u:'amu', w:'Khối lượng nguyên tử ≈ p + n = ' + e2.z + ' + ' + e2.n + ' = ' + (e2.z + e2.n) + ' amu.'
    });
    out.push({
      d:2, q:'Nguyên tử ' + e3.name + ' có Z = ' + e3.z + ' electron. Số electron ở lớp ngoài cùng của nguyên tử này là bao nhiêu?',
      n:outerElectrons(e3.z), t:0, u:'electron', w:'Phân bố ' + e3.z + 'e vào các lớp (tối đa 2, 8, 8…) ⇒ lớp ngoài cùng có ' + outerElectrons(e3.z) + 'e.'
    });
    var S = 2 * e4.z + e4.n;
    out.push({
      d:3, q:'Tổng số hạt (p, n, e) trong nguyên tử X là ' + S + ', biết số hạt không mang điện là ' + e4.n + '. Số proton của X là bao nhiêu?',
      n:e4.z, t:0, u:'proton', w:'2p + ' + e4.n + ' = ' + S + ' ⇒ 2p = ' + (2 * e4.z) + ' ⇒ p = ' + e4.z + '.'
    });
    var diff = 2 * e2.z - e2.n;
    out.push({
      d:4, q:'Nguyên tử R có tổng số hạt (p, n, e) là ' + (2*e2.z + e2.n) + ', trong đó số hạt mang điện nhiều hơn số hạt không mang điện là ' + diff + '. Khối lượng nguyên tử R là bao nhiêu amu?',
      n:e2.z + e2.n, t:0, u:'amu', w:'Hệ 2p + n = ' + (2*e2.z + e2.n) + ' và 2p − n = ' + diff + ' ⇒ p = ' + e2.z + ', n = ' + e2.n + ' ⇒ khối lượng = ' + (e2.z + e2.n) + ' amu.'
    });
    return out;
  },

  'l7-bang-tuan-hoan': function(){
    var out = [];
    var e1 = pick(ELEMENTS_20), e2 = pick(ELEMENTS_20.filter(function(x){ return x.p <= 3 && x.g !== 'VIIIA'; }));
    out.push({
      d:1, q:'Nguyên tố ' + e1.name + ' (' + e1.sym + ') đứng ở ô số ' + e1.z + ' trong bảng tuần hoàn. Điện tích hạt nhân có bao nhiêu proton?',
      n:e1.z, t:0, u:'proton', w:'Số thứ tự ô = số hiệu nguyên tử Z = số proton = ' + e1.z + '.'
    });
    out.push({
      d:2, q:'Nguyên tử của nguyên tố ' + e1.sym + ' (Z = ' + e1.z + ') có ' + e1.p + ' lớp electron. Nguyên tố này nằm ở chu kì mấy?',
      n:e1.p, t:0, u:'', w:'Số thứ tự chu kì đúng bằng số lớp electron = ' + e1.p + '.'
    });
    var wrongTypes = ['Kim loại','Phi kim','Khí hiếm'].filter(function(t){ return t !== e1.type; });
    out.push({
      d:3, q:'Nguyên tố ' + e1.name + ' (' + e1.sym + ', thuộc chu kì ' + e1.p + ', nhóm ' + e1.g + ') được phân loại là gì?',
      o:[e1.type, wrongTypes[0], wrongTypes[1], 'Hợp chất hữu cơ'],
      w:e1.sym + ' thuộc nhóm ' + e1.g + ' nên là ' + e1.type.toLowerCase() + '.'
    });
    out.push({
      d:4, q:'Nguyên tố X nằm ở chu kì ' + e2.p + ', nhóm ' + e2.g + '. Số hiệu nguyên tử Z của X bằng bao nhiêu?',
      n:e2.z, t:0, u:'', w:'Chu kì ' + e2.p + ' có ' + e2.p + ' lớp e, nhóm ' + e2.g + ' có ' + outerElectrons(e2.z) + 'e lớp ngoài cùng ⇒ tổng e = Z = ' + e2.z + '.'
    });
    return out;
  },

  'l7-phan-tu': function(){
    var out = [];
    var c1 = pick(COMPOUNDS), c2 = pick(COMPOUNDS.filter(function(c){ return c.f !== c1.f; }));
    out.push({
      d:2, q:'Tính khối lượng phân tử của hợp chất ' + c1.f + ' (' + c1.hint + ').',
      n:c1.M, t:0, u:'amu', w:'Cộng khối lượng các nguyên tử trong ' + c1.f + ' ta được ' + c1.M + ' amu.'
    });
    var k = pick([
      {f:'XO₂', M:44, O:2, X:12, sym:'C'},
      {f:'XO₃', M:80, O:3, X:32, sym:'S'},
      {f:'X₂O₃', M:102, O:3, X:27, sym:'Al'},
      {f:'X₂O', M:94, O:1, X:39, sym:'K'},
      {f:'XO', M:56, O:1, X:40, sym:'Ca'}
    ]);
    var xCount = k.f.indexOf('X₂') === 0 ? 2 : 1;
    out.push({
      d:3, q:'Hợp chất ' + k.f + ' có khối lượng phân tử bằng ' + k.M + ' amu (biết O = 16). Nguyên tử khối của X là bao nhiêu amu?',
      n:k.X, t:0, u:'amu', w:xCount + '·X + ' + (k.O*16) + ' = ' + k.M + ' ⇒ X = ' + k.X + ' amu (' + k.sym + ').'
    });
    var mult = pick([1.5, 2, 2.5]);
    var Mbase = 32; // O2
    var targetM = mult * Mbase;
    out.push({
      d:4, q:'Một phân tử hợp chất khí A nặng gấp ' + fmt(mult) + ' lần phân tử khí oxygen O₂ (O = 16). Khối lượng phân tử của A là bao nhiêu amu?',
      n:targetM, t:0.1, u:'amu', w:'M(O₂) = 32 amu ⇒ M(A) = ' + fmt(mult) + ' × 32 = ' + fmt(targetM) + ' amu.'
    });
    return out;
  },

  'l7-hoa-tri': function(){
    var out = [];
    var c = pick(COMPOUNDS);
    var pctVal = round((c.x * c.Mx / c.M) * 100, 1);
    out.push({
      d:3, q:'Tính phần trăm khối lượng của nguyên tố ' + c.el + ' trong hợp chất ' + c.f + ' (' + c.hint + '; làm tròn đến 1 chữ số thập phân nếu lẻ).',
      n:pctVal, t:0.15, u:'%', w:'M(' + c.f + ') = ' + c.M + ' ⇒ %' + c.el + ' = (' + (c.x * c.Mx) + ' / ' + c.M + ') × 100% ≈ ' + fmt(pctVal) + '%.'
    });
    var ox = pick([
      {f:'SO₂', v:'IV', wrong:['II','VI','I'], w:'1 · a = 2 · II ⇒ a = IV.'},
      {f:'SO₃', v:'VI', wrong:['IV','II','III'], w:'1 · a = 3 · II ⇒ a = VI.'},
      {f:'P₂O₅', v:'V', wrong:['III','II','IV'], w:'2 · a = 5 · II ⇒ a = V.'},
      {f:'Cr₂O₃', v:'III', wrong:['II','VI','I'], w:'2 · a = 3 · II ⇒ a = III.'},
      {f:'MnO₂', v:'IV', wrong:['II','VII','III'], w:'1 · a = 2 · II ⇒ a = IV.'}
    ]);
    out.push({
      d:2, q:'Theo quy tắc hóa trị (O hóa trị II), hóa trị của nguyên tố đứng trước O trong hợp chất ' + ox.f + ' là bao nhiêu?',
      o:[ox.v].concat(ox.wrong), w:ox.w
    });
    var fm = pick([
      {q:'Fe (II) và nhóm SO₄ (II)', ans:'FeSO₄', w:['Fe₂(SO₄)₃','Fe(SO₄)₂','Fe₂SO₄']},
      {q:'Fe (III) và Cl (I)', ans:'FeCl₃', w:['FeCl₂','Fe₃Cl','FeCl']},
      {q:'Al (III) và nhóm SO₄ (II)', ans:'Al₂(SO₄)₃', w:['AlSO₄','Al₃(SO₄)₂','Al(SO₄)₃']},
      {q:'Ba (II) và nhóm NO₃ (I)', ans:'Ba(NO₃)₂', w:['BaNO₃','Ba₂NO₃','BaNO₆']}
    ]);
    out.push({
      d:2, q:'Công thức hóa học đúng của hợp chất tạo bởi ' + fm.q + ' là gì?',
      o:[fm.ans].concat(fm.w), w:'Áp dụng quy tắc chéo hóa trị và tối giản chỉ số ta được ' + fm.ans + '.'
    });
    var det = pick([
      {el1:'Fe', m1:56, el2:'O', m2:16, M:160, p1:70, sum:5, f:'Fe₂O₃'},
      {el1:'Cu', m1:64, el2:'O', m2:16, M:80, p1:80, sum:2, f:'CuO'},
      {el1:'S', m1:32, el2:'O', m2:16, M:80, p1:40, sum:4, f:'SO₃'},
      {el1:'Al', m1:27, el2:'O', m2:16, M:102, p1:52.94, sum:5, f:'Al₂O₃'}
    ]);
    out.push({
      d:4, q:'Một oxide của ' + det.el1 + ' có khối lượng phân tử ' + det.M + ' amu, trong đó ' + det.el1 + ' chiếm khoảng ' + fmt(det.p1) + '% về khối lượng (' + det.el1 + '=' + det.m1 + ', O=16). Tổng số nguyên tử trong 1 phân tử oxide này là bao nhiêu?',
      n:det.sum, t:0, u:'nguyên tử', w:'Từ % khối lượng và M = ' + det.M + ' tìm được công thức ' + det.f + ', có tổng cộng ' + det.sum + ' nguyên tử.'
    });
    return out;
  },

  'l7-toc-do': function(){
    var out = [];
    var vMs = pick([5, 10, 12, 15, 20, 25]);
    var vKmh = round(vMs * 3.6, 1);
    out.push({
      d:2, q:'Đổi tốc độ ' + fmt(vKmh) + ' km/h sang đơn vị m/s.',
      n:vMs, t:0.05, u:'m/s', w:fmt(vKmh) + ' : 3,6 = ' + vMs + ' m/s.'
    });
    var tH = pick([0.5, 1.5, 2, 2.5]);
    var vCar = pick([40, 48, 50, 60, 70]);
    var sKm = round(vCar * tH, 1);
    out.push({
      d:2, q:'Một ô tô chuyển động trên quãng đường ' + fmt(sKm) + ' km hết ' + fmt(tH) + ' giờ. Tốc độ trung bình của xe là bao nhiêu km/h?',
      n:vCar, t:0.1, u:'km/h', w:'v = s / t = ' + fmt(sKm) + ' : ' + fmt(tH) + ' = ' + vCar + ' km/h.'
    });
    var t1 = 0.5, v1 = pick([30, 40, 50]), t2 = 1.5, v2 = pick([50, 60, 70]);
    var sTot = round(t1 * v1 + t2 * v2, 1);
    out.push({
      d:3, q:'Một xe đi ' + fmt(t1) + ' giờ đầu với tốc độ ' + v1 + ' km/h, sau đó đi tiếp ' + fmt(t2) + ' giờ với tốc độ ' + v2 + ' km/h. Tổng quãng đường xe đi được là bao nhiêu km?',
      n:sTot, t:0.1, u:'km', w:'s = ' + v1 + '×' + fmt(t1) + ' + ' + v2 + '×' + fmt(t2) + ' = ' + fmt(sTot) + ' km.'
    });
    var va = pick([30, 35, 40]), vb = pick([20, 25, 30]), meetT = pick([1.5, 2, 2.5]);
    var distAB = (va + vb) * meetT;
    out.push({
      d:4, q:'Hai xe khởi hành cùng lúc từ A và B cách nhau ' + fmt(distAB) + ' km đi ngược chiều nhau với tốc độ ' + va + ' km/h và ' + vb + ' km/h. Sau bao nhiêu giờ hai xe gặp nhau?',
      n:meetT, t:0.05, u:'giờ', w:'t = s / (v₁ + v₂) = ' + fmt(distAB) + ' / (' + va + ' + ' + vb + ') = ' + fmt(meetT) + ' giờ.'
    });
    return out;
  },

  'l7-am-thanh': function(){
    var out = [];
    var f = pick([50, 80, 120, 250, 440]), sec = pick([10, 15, 20, 30]);
    var N = f * sec;
    out.push({
      d:2, q:'Một vật dao động thực hiện được ' + N + ' dao động trong ' + sec + ' giây. Tần số dao động của vật bằng bao nhiêu Hz?',
      n:f, t:0.1, u:'Hz', w:'f = N / t = ' + N + ' / ' + sec + ' = ' + f + ' Hz.'
    });
    var tEcho = pick([0.8, 1.2, 1.5, 2.4]);
    var dAir = round(340 * tEcho / 2, 1);
    out.push({
      d:3, q:'Đứng trước vách núi hét to, người ta nghe thấy tiếng vang sau ' + fmt(tEcho) + ' giây (biết v_âm trong không khí = 340 m/s). Khoảng cách đến vách núi là bao nhiêu mét?',
      n:dAir, t:0.2, u:'m', w:'d = v · t / 2 = 340 × ' + fmt(tEcho) + ' / 2 = ' + fmt(dAir) + ' m.'
    });
    var tSea = pick([0.6, 1.0, 1.4, 2.0, 2.8]);
    var dSea = round(1500 * tSea / 2, 1);
    out.push({
      d:3, q:'Tàu khảo sát phát siêu âm xuống đáy biển và nhận âm phản xạ sau ' + fmt(tSea) + ' giây (v_âm trong nước biển = 1500 m/s). Độ sâu đáy biển là bao nhiêu mét?',
      n:dSea, t:0.5, u:'m', w:'d = 1500 × ' + fmt(tSea) + ' / 2 = ' + fmt(dSea) + ' m.'
    });
    return out;
  },

  'l7-anh-sang': function(){
    var out = [];
    var alpha = pick([20, 25, 30, 40, 50, 65]);
    var inc = 90 - alpha;
    out.push({
      d:2, q:'Chiếu một tia sáng hợp với MẶT GƯƠNG PHẲNG một góc ' + alpha + '°. Góc phản xạ bằng bao nhiêu độ?',
      n:inc, t:0, u:'°', w:'Góc tới hợp với pháp tuyến: i = 90° − ' + alpha + '° = ' + inc + '° ⇒ góc phản xạ i′ = ' + inc + '°.'
    });
    var twoI = pick([60, 80, 90, 120, 130, 140]);
    out.push({
      d:3, q:'Chiếu tia sáng tới gương phẳng sao cho góc hợp bởi tia tới và tia phản xạ bằng ' + twoI + '°. Góc tới bằng bao nhiêu độ?',
      n:twoI / 2, t:0, u:'°', w:'i + i′ = 2i = ' + twoI + '° ⇒ i = ' + (twoI / 2) + '°.'
    });
    var d0 = pick([1.8, 2.2, 2.5, 3.0]), step = pick([0.4, 0.5, 0.7]);
    var dNew = round((d0 - step) * 2, 2);
    out.push({
      d:3, q:'Một người đứng cách gương phẳng ' + fmt(d0) + ' m, sau đó bước tiến lại gần gương thêm ' + fmt(step) + ' m. Lúc này người đó cách ảnh của mình bao nhiêu mét?',
      n:dNew, t:0.02, u:'m', w:'Khoảng cách mới tới gương = ' + fmt(d0) + ' − ' + fmt(step) + ' = ' + fmt(round(d0 - step, 2)) + ' m ⇒ cách ảnh = ' + fmt(dNew) + ' m.'
    });
    var rot = pick([10, 12, 18, 20, 25]);
    out.push({
      d:4, q:'Giữ cố định tia sáng tới, nếu quay gương phẳng một góc ' + rot + '° quanh điểm tới thì tia phản xạ quay đi một góc bao nhiêu độ?',
      n:rot * 2, t:0, u:'°', w:'Khi gương quay góc α thì tia phản xạ quay một góc 2α = 2 × ' + rot + '° = ' + (rot * 2) + '°.'
    });
    return out;
  },

  'l8-phan-ung': function(){
    var out = [];
    var k = pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    var mMg = round(24 * k, 2), mO2 = round(16 * k, 2), mMgO = round(40 * k, 2);
    out.push({
      d:2, q:'Đốt cháy hoàn toàn ' + fmt(mMg) + ' g kim loại Mg trong không khí thu được ' + fmt(mMgO) + ' g MgO (2Mg + O₂ → 2MgO). Khối lượng khí O₂ đã tham gia phản ứng là bao nhiêu gam?',
      n:mO2, t:0.05, u:'g', w:'Theo định luật BTKL: m(O₂) = m(MgO) − m(Mg) = ' + fmt(mMgO) + ' − ' + fmt(mMg) + ' = ' + fmt(mO2) + ' g.'
    });
    var molCa = pick([0.5, 0.8, 1.2, 1.5, 2.0]);
    var mCaCO3 = round(100 * molCa, 1), mCaO = round(56 * molCa, 1), mCO2 = round(44 * molCa, 1);
    out.push({
      d:3, q:'Nung hoàn toàn ' + fmt(mCaCO3) + ' g CaCO₃ nguyên chất thu được ' + fmt(mCaO) + ' g vôi sống CaO và khí CO₂ thoát ra. Khối lượng CO₂ thu được là bao nhiêu gam?',
      n:mCO2, t:0.1, u:'g', w:'BTKL: m(CO₂) = ' + fmt(mCaCO3) + ' − ' + fmt(mCaO) + ' = ' + fmt(mCO2) + ' g.'
    });
    var eq = pick([
      {s:'P + O₂ —(t°)→ P₂O₅', sum:9, w:'4P + 5O₂ → 2P₂O₅ ⇒ tổng hệ số = 4 + 5 + 2 = 11', fix:11},
      {s:'Fe(OH)₃ —(t°)→ Fe₂O₃ + H₂O', sum:6, w:'2Fe(OH)₃ → 1Fe₂O₃ + 3H₂O ⇒ tổng hệ số = 2 + 1 + 3 = 6', fix:6},
      {s:'Al + H₂SO₄ → Al₂(SO₄)₃ + H₂', sum:9, w:'2Al + 3H₂SO₄ → 1Al₂(SO₄)₃ + 3H₂ ⇒ tổng hệ số = 2 + 3 + 1 + 3 = 9', fix:9},
      {s:'KClO₃ —(t°, xt)→ KCl + O₂', sum:7, w:'2KClO₃ → 2KCl + 3O₂ ⇒ tổng hệ số = 2 + 2 + 3 = 7', fix:7}
    ]);
    out.push({
      d:3, q:'Cân bằng phương trình hóa học: ' + eq.s + ' với hệ số nguyên tối giản. Tổng tất cả các hệ số trong phương trình bằng bao nhiêu?',
      n:eq.fix, t:0, u:'', w:eq.w + '.'
    });
    var mRock = pick([150, 200, 250]), pur = pick([80, 85, 90]);
    var pureCa = mRock * pur / 100;
    var co2Out = round(pureCa * 0.44, 2);
    out.push({
      d:4, q:'Nung hoàn toàn ' + mRock + ' g đá vôi chứa ' + pur + '% CaCO₃ (còn lại là tạp chất trơ; biết 100 g CaCO₃ phân hủy tạo 56 g CaO và 44 g CO₂). Khối lượng khí CO₂ thu được là bao nhiêu gam?',
      n:co2Out, t:0.1, u:'g', w:'m(CaCO₃ nguyên chất) = ' + mRock + ' × ' + pur + '% = ' + fmt(pureCa) + ' g ⇒ m(CO₂) = ' + fmt(co2Out) + ' g.'
    });
    return out;
  },

  'l8-mol': function(){
    var out = [];
    var g1 = pick(GASES.filter(function(g){ return g.M >= 16; }));
    var n1 = pick([0.1, 0.15, 0.2, 0.25, 0.4, 0.5]);
    var m1 = round(n1 * g1.M, 2);
    out.push({
      d:2, q:'Tính số mol có trong ' + fmt(m1) + ' gam khí ' + g1.f + ' (' + g1.hint + ').',
      n:n1, t:0.005, u:'mol', w:'M(' + g1.f + ') = ' + g1.M + ' g/mol ⇒ n = ' + fmt(m1) + ' / ' + g1.M + ' = ' + fmt(n1) + ' mol.'
    });
    var n2 = pick([0.1, 0.2, 0.3, 0.4, 0.6, 0.8]);
    var v2 = round(n2 * 24.79, 2);
    out.push({
      d:2, q:'Ở điều kiện chuẩn (25 °C, 1 bar), ' + fmt(n2) + ' mol khí bất kì chiếm thể tích bao nhiêu lít? (làm tròn đến 2 chữ số thập phân)',
      n:v2, t:0.03, u:'L', w:'V = ' + fmt(n2) + ' × 24,79 = ' + fmt(round(n2 * 24.79, 3)) + ' L ≈ ' + fmt(v2) + ' L.'
    });
    var gHeavy = pick([{f:'O₂',M:32},{f:'CO₂',M:44},{f:'SO₂',M:64},{f:'CH₄',M:16}]);
    out.push({
      d:3, q:'Tỉ khối của khí ' + gHeavy.f + ' (M = ' + gHeavy.M + ') đối với khí H₂ (M = 2) bằng bao nhiêu?',
      n:gHeavy.M / 2, t:0.01, u:'', w:'d = ' + gHeavy.M + ' / 2 = ' + (gHeavy.M / 2) + '.'
    });
    var na = pick([0.1, 0.2, 0.3]), nb = pick([0.2, 0.3]);
    var Mtb = round((na * 28 + nb * 32) / (na + nb), 2);
    out.push({
      d:4, q:'Hỗn hợp khí gồm ' + fmt(na) + ' mol N₂ (M = 28) và ' + fmt(nb) + ' mol O₂ (M = 32). Khối lượng mol trung bình của hỗn hợp là bao nhiêu g/mol? (làm tròn 2 chữ số thập phân)',
      n:Mtb, t:0.05, u:'g/mol', w:'M_tb = (' + fmt(na) + '×28 + ' + fmt(nb) + '×32) / (' + fmt(round(na+nb,2)) + ') ≈ ' + fmt(Mtb) + ' g/mol.'
    });
    return out;
  },

  'l8-dung-dich': function(){
    var out = [];
    var mct = pick([15, 20, 25, 30, 40, 50]), mdd = pick([200, 250, 400, 500]);
    var mH2O = mdd - mct;
    var cPct = round((mct / mdd) * 100, 2);
    out.push({
      d:2, q:'Hòa tan hoàn toàn ' + mct + ' g đường vào ' + mH2O + ' g nước. Nồng độ phần trăm (C%) của dung dịch thu được là bao nhiêu %?',
      n:cPct, t:0.05, u:'%', w:'m_dd = ' + mct + ' + ' + mH2O + ' = ' + mdd + ' g ⇒ C% = (' + mct + '/' + mdd + ') × 100% = ' + fmt(cPct) + '%.'
    });
    var mol = pick([0.1, 0.2, 0.3, 0.45, 0.6]), vMl = pick([200, 250, 500]);
    var cm = round(mol / (vMl / 1000), 2);
    out.push({
      d:2, q:'Hòa tan ' + fmt(mol) + ' mol chất tan vào nước thu được ' + vMl + ' mL dung dịch. Nồng độ mol (C_M) là bao nhiêu M?',
      n:cm, t:0.02, u:'M', w:'Đổi V = ' + (vMl/1000) + ' L ⇒ C_M = ' + fmt(mol) + ' / ' + fmt(vMl/1000) + ' = ' + fmt(cm) + ' M.'
    });
    var mdd1 = pick([150, 200, 300]), c1 = pick([12, 15, 20, 25]), c2 = pick([5, 6, 10]);
    var mdd2 = (mdd1 * c1) / c2;
    var addW = round(mdd2 - mdd1, 1);
    out.push({
      d:4, q:'Cần thêm bao nhiêu gam nước vào ' + mdd1 + ' g dung dịch muối ' + c1 + '% để pha loãng thành dung dịch ' + c2 + '%?',
      n:addW, t:0.2, u:'g', w:'m_ct = ' + fmt(mdd1*c1/100) + ' g ⇒ m_dd sau = ' + fmt(mdd2) + ' g ⇒ nước cần thêm = ' + fmt(mdd2) + ' − ' + mdd1 + ' = ' + fmt(addW) + ' g.'
    });
    return out;
  },

  'l8-tinh-pthh': function(){
    var out = [];
    var met = pick([
      {sym:'Mg', M:24}, {sym:'Zn', M:65}, {sym:'Fe', M:56}
    ]);
    var nM = pick([0.05, 0.1, 0.15, 0.2, 0.25]);
    var mM = round(nM * met.M, 2);
    var vH2 = round(nM * 24.79, 2);
    out.push({
      d:3, q:'Hòa tan hoàn toàn ' + fmt(mM) + ' g ' + met.sym + ' (M = ' + met.M + ') vào dung dịch HCl dư (' + met.sym + ' + 2HCl → ' + met.sym + 'Cl₂ + H₂↑). Thể tích khí H₂ ở 25 °C, 1 bar là bao nhiêu lít? (làm tròn 2 chữ số thập phân)',
      n:vH2, t:0.03, u:'L', w:'n(' + met.sym + ') = ' + fmt(nM) + ' mol ⇒ n(H₂) = ' + fmt(nM) + ' mol ⇒ V = ' + fmt(nM) + ' × 24,79 ≈ ' + fmt(vH2) + ' L.'
    });
    var mTheory = pick([40, 50, 80, 120]), eff = pick([75, 80, 85, 90]);
    var mReal = round(mTheory * eff / 100, 1);
    out.push({
      d:3, q:'Theo tính toán lí thuyết một phản ứng thu được ' + mTheory + ' g sản phẩm, nhưng hiệu suất thực tế đạt ' + eff + '%. Khối lượng sản phẩm thực tế thu được là bao nhiêu gam?',
      n:mReal, t:0.1, u:'g', w:'m_thực tế = ' + mTheory + ' × ' + eff + '% = ' + fmt(mReal) + ' g.'
    });
    var nZn = pick([0.15, 0.2, 0.3]), nHCl = pick([0.2, 0.3]);
    // Zn + 2HCl -> ZnCl2 + H2: compare nZn/1 vs nHCl/2
    var nH2Lim = Math.min(nZn, nHCl / 2);
    var vH2Lim = round(nH2Lim * 24.79, 2);
    out.push({
      d:4, q:'Cho ' + fmt(nZn) + ' mol Zn vào dung dịch chứa ' + fmt(nHCl) + ' mol HCl (Zn + 2HCl → ZnCl₂ + H₂↑). Sau khi phản ứng kết thúc, thu được bao nhiêu lít H₂ (25 °C, 1 bar; làm tròn 2 chữ số thập phân)?',
      n:vH2Lim, t:0.03, u:'L', w:'Xét tỉ lệ: n(Zn)/1 = ' + fmt(nZn) + ' và n(HCl)/2 = ' + fmt(nHCl/2) + ' ⇒ tính theo chất nhỏ hơn, n(H₂) = ' + fmt(nH2Lim) + ' mol ⇒ V ≈ ' + fmt(vH2Lim) + ' L.'
    });
    return out;
  },

  'l8-acid-base': function(){
    var out = [];
    var nAcid = pick([0.05, 0.1, 0.15, 0.2, 0.25]);
    var vNaOH = round((2 * nAcid / 1) * 1000, 0);
    out.push({
      d:3, q:'Trung hòa hoàn toàn ' + fmt(nAcid) + ' mol H₂SO₄ bằng dung dịch NaOH 1 M (H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O). Thể tích dung dịch NaOH cần dùng là bao nhiêu mL?',
      n:vNaOH, t:1, u:'mL', w:'n(NaOH) = 2 × ' + fmt(nAcid) + ' = ' + fmt(2*nAcid) + ' mol ⇒ V = ' + fmt(2*nAcid) + ' L = ' + vNaOH + ' mL.'
    });
    var ph = pick([2, 3, 7, 11, 13]);
    var env = ph < 7 ? 'Môi trường acid (làm quỳ tím hóa đỏ)' : (ph === 7 ? 'Môi trường trung tính (quỳ tím không đổi màu)' : 'Môi trường base/kiềm (làm quỳ tím hóa xanh)');
    var wrongs = [
      'Môi trường acid (làm quỳ tím hóa đỏ)',
      'Môi trường trung tính (quỳ tím không đổi màu)',
      'Môi trường base/kiềm (làm quỳ tím hóa xanh)',
      'Không dẫn điện và không xác định được'
    ].filter(function(x){ return x !== env; });
    out.push({
      d:2, q:'Một mẫu dung dịch đo được pH = ' + ph + '. Kết luận nào sau đây là ĐÚNG?',
      o:[env].concat(wrongs), w:'Với pH = ' + ph + ' → ' + env + '.'
    });
    return out;
  },

  'l8-oxide-muoi': function(){
    var out = [];
    var nCO2 = pick([0.05, 0.08, 0.12, 0.15, 0.25]);
    var vCO2 = round(nCO2 * 24.79, 3);
    var mKetTua = round(nCO2 * 100, 1);
    out.push({
      d:3, q:'Sục ' + fmt(vCO2) + ' lít khí CO₂ (ở 25 °C, 1 bar) vào dung dịch Ca(OH)₂ dư. Khối lượng kết tủa CaCO₃ (M = 100) thu được là bao nhiêu gam?',
      n:mKetTua, t:0.15, u:'g', w:'n(CO₂) = ' + fmt(nCO2) + ' mol ⇒ n(CaCO₃) = ' + fmt(nCO2) + ' mol ⇒ m = ' + fmt(mKetTua) + ' g.'
    });
    var bagKg = pick([25, 40, 50]), nPct = pick([16, 18, 20]), pPct = pick([16, 20]), kPct = pick([8, 15]);
    var mN = round(bagKg * nPct / 100, 2);
    out.push({
      d:4, q:'Một bao phân bón hỗn hợp nặng ' + bagKg + ' kg có ghi kí hiệu "NPK ' + nPct + '-' + pPct + '-' + kPct + '". Khối lượng nguyên tố dinh dưỡng N tính quy đổi trong bao phân này là bao nhiêu kg?',
      n:mN, t:0.05, u:'kg', w:'Chỉ số đầu là %N = ' + nPct + '% ⇒ m(N) = ' + bagKg + ' × ' + nPct + '% = ' + fmt(mN) + ' kg.'
    });
    return out;
  },

  'l8-khoi-luong-rieng': function(){
    var out = [];
    var mat = pick([
      {name:'nhôm', D:2.7}, {name:'sắt', D:7.8}, {name:'đồng', D:8.9}, {name:'đá hoa cương', D:2.6}
    ]);
    var Vcm = pick([50, 100, 150, 200]);
    var mg = round(mat.D * Vcm, 1);
    out.push({
      d:2, q:'Một vật đặc bằng ' + mat.name + ' có thể tích ' + Vcm + ' cm³ và khối lượng ' + fmt(mg) + ' g. Khối lượng riêng của vật là bao nhiêu g/cm³?',
      n:mat.D, t:0.02, u:'g/cm³', w:'D = m / V = ' + fmt(mg) + ' / ' + Vcm + ' = ' + fmt(mat.D) + ' g/cm³.'
    });
    var F = pick([300, 450, 600, 900, 1200]), S = pick([0.02, 0.03, 0.05, 0.06]);
    var p = round(F / S, 0);
    out.push({
      d:2, q:'Áp lực ' + F + ' N tác dụng vuông góc lên mặt sàn có diện tích tiếp xúc ' + fmt(S) + ' m². Áp suất gây ra là bao nhiêu Pa?',
      n:p, t:1, u:'Pa', w:'p = F / S = ' + F + ' / ' + fmt(S) + ' = ' + p + ' Pa.'
    });
    var H = pick([1.5, 1.8, 2.0, 2.5]), fromBot = pick([0.3, 0.4, 0.5]);
    var hReal = round(H - fromBot, 2);
    var pLiq = round(10000 * hReal, 0);
    out.push({
      d:3, q:'Một bồn cao ' + fmt(H) + ' m chứa đầy nước (d = 10 000 N/m³). Áp suất nước tại một điểm cách ĐÁY bồn ' + fmt(fromBot) + ' m bằng bao nhiêu Pa?',
      n:pLiq, t:1, u:'Pa', w:'Độ sâu từ mặt thoáng là h = ' + fmt(H) + ' − ' + fmt(fromBot) + ' = ' + fmt(hReal) + ' m ⇒ p = 10 000 × ' + fmt(hReal) + ' = ' + pLiq + ' Pa.'
    });
    return out;
  },

  'l8-archimedes': function(){
    var out = [];
    var Pair = pick([12, 15, 18, 24, 30]), Fsub = pick([7, 9, 10]);
    var FA = Pair - Fsub;
    out.push({
      d:2, q:'Treo một vật vào lực kế ngoài không khí chỉ ' + Pair + ' N. Khi nhúng chìm vật vào nước lực kế chỉ ' + Fsub + ' N. Lực đẩy Archimedes bằng bao nhiêu N?',
      n:FA, t:0.01, u:'N', w:'F_A = P − F_nhúng = ' + Pair + ' − ' + Fsub + ' = ' + FA + ' N.'
    });
    var Vcm3 = pick([200, 350, 500, 800]), dLiq = pick([8000, 10000]);
    var liqName = dLiq === 10000 ? 'nước (d = 10 000 N/m³)' : 'dầu (d = 8000 N/m³)';
    var faCalc = round(dLiq * (Vcm3 / 1000000), 2);
    out.push({
      d:3, q:'Nhúng chìm hoàn toàn một vật đặc thể tích ' + Vcm3 + ' cm³ vào ' + liqName + '. Lực đẩy Archimedes tác dụng lên vật là bao nhiêu N?',
      n:faCalc, t:0.02, u:'N', w:'Đổi V = ' + (Vcm3/1000000) + ' m³ ⇒ F_A = ' + dLiq + ' × ' + (Vcm3/1000000) + ' = ' + fmt(faCalc) + ' N.'
    });
    var Dwood = pick([400, 500, 600, 750, 800]);
    var pctAbove = round(100 - (Dwood / 1000) * 100, 1);
    out.push({
      d:4, q:'Một khối gỗ đặc có khối lượng riêng ' + Dwood + ' kg/m³ thả nổi cân bằng trên mặt nước (D = 1000 kg/m³). Phần thể tích gỗ NỔI trên mặt nước chiếm bao nhiêu % thể tích cả khối gỗ?',
      n:pctAbove, t:0.1, u:'%', w:'Phần chìm chiếm ' + Dwood + '/1000 = ' + (Dwood/10) + '% ⇒ phần nổi phía trên chiếm 100% − ' + (Dwood/10) + '% = ' + fmt(pctAbove) + '%.'
    });
    return out;
  },

  'l8-don-bay': function(){
    var out = [];
    var F = pick([25, 30, 40, 50, 80]), dCm = pick([20, 25, 30, 40, 50]);
    var M = round(F * (dCm / 100), 2);
    out.push({
      d:2, q:'Tác dụng lực ' + F + ' N có cánh tay đòn ' + dCm + ' cm đối với trục quay. Moment của lực đó bằng bao nhiêu N·m?',
      n:M, t:0.02, u:'N·m', w:'Đổi d = ' + fmt(dCm/100) + ' m ⇒ M = ' + F + ' × ' + fmt(dCm/100) + ' = ' + fmt(M) + ' N·m.'
    });
    var F1 = pick([600, 800, 1000, 1500]), d1 = 0.2, d2 = pick([1.0, 1.6, 2.0]);
    var F2 = round((F1 * d1) / d2, 1);
    out.push({
      d:3, q:'Dùng đòn bẩy nâng vật có trọng lượng F₁ = ' + F1 + ' N đặt cách điểm tựa d₁ = ' + fmt(d1) + ' m. Tay người ấn cách điểm tựa d₂ = ' + fmt(d2) + ' m thì cần lực tối thiểu bao nhiêu N?',
      n:F2, t:0.1, u:'N', w:'F₂ = (F₁ · d₁) / d₂ = (' + F1 + ' × ' + fmt(d1) + ') / ' + fmt(d2) + ' = ' + fmt(F2) + ' N.'
    });
    return out;
  },

  'l8-dien': function(){
    var out = [];
    var mA = pick([150, 350, 450, 800, 1200, 1800]);
    out.push({
      d:2, q:'Đổi giá trị cường độ dòng điện ' + mA + ' mA sang đơn vị Ampe (A).',
      n:round(mA / 1000, 3), t:0.001, u:'A', w:mA + ' : 1000 = ' + fmt(round(mA / 1000, 3)) + ' A.'
    });
    var Utot = pick([6, 9, 12, 24]), U1 = pick([2.5, 3.5, 4.2]);
    var U2 = round(Utot - U1, 2);
    out.push({
      d:3, q:'Hai đèn mắc NỐI TIẾP vào nguồn ' + Utot + ' V. Vôn kế đo hai đầu đèn 1 chỉ ' + fmt(U1) + ' V. Hiệu điện thế hai đầu đèn 2 là bao nhiêu V?',
      n:U2, t:0.02, u:'V', w:'Mạch nối tiếp: U₂ = U − U₁ = ' + Utot + ' − ' + fmt(U1) + ' = ' + fmt(U2) + ' V.'
    });
    var I1 = pick([0.2, 0.25, 0.35, 0.4]), I2 = pick([0.3, 0.45, 0.55]);
    out.push({
      d:3, q:'Hai đèn mắc SONG SONG có dòng điện qua mỗi đèn lần lượt là ' + fmt(I1) + ' A và ' + fmt(I2) + ' A. Cường độ dòng điện mạch chính là bao nhiêu A?',
      n:round(I1 + I2, 2), t:0.01, u:'A', w:'Mạch song song: I = I₁ + I₂ = ' + fmt(I1) + ' + ' + fmt(I2) + ' = ' + fmt(round(I1 + I2, 2)) + ' A.'
    });
    return out;
  },

  'l8-nhiet': function(){
    var out = [];
    var mKg = pick([0.5, 1, 1.5, 2, 3]), t0 = pick([20, 25, 30]), t1 = pick([70, 80, 100]);
    var QkJ = round(mKg * 4.2 * (t1 - t0), 1);
    out.push({
      d:3, q:'Tính nhiệt lượng cần cung cấp (theo kJ) để đun nóng ' + fmt(mKg) + ' kg nước từ ' + t0 + ' °C lên ' + t1 + ' °C (biết c_nước = 4200 J/(kg·K), 1 kJ = 1000 J).',
      n:QkJ, t:0.2, u:'kJ', w:'Q = m·c·Δt = ' + fmt(mKg) + ' × 4200 × ' + (t1 - t0) + ' = ' + (QkJ * 1000) + ' J = ' + fmt(QkJ) + ' kJ.'
    });
    return out;
  }
};

// ============================================================================
// 3. API LẤY BỘ CÂU HỎI ĐẦY ĐỦ & LẤY MẪU NGẪU NHIÊN MỖI LẦN MỞ
// ============================================================================
function getExpandedTopicPool(topic, variantRounds){
  if (!topic) return [];
  var pool = [];
  var seen = {};

  function addQ(q, staticIdx){
    if (!q || !q.q || seen[q.q]) return;
    seen[q.q] = true;
    pool.push({
      q: q,
      staticIdx: typeof staticIdx === 'number' ? staticIdx : null,
      d: (q.d === 1 || q.d === 2 || q.d === 3 || q.d === 4) ? q.d : (q.n != null ? 2 : 1)
    });
  }

  // 1. Original static questions injs/data/lop*.js
  (topic.questions || []).forEach(function(q, i){ addQ(q, i); });

  // 2. Extra static conceptual bank
  if (EXTRA_STATIC[topic.id]) {
    EXTRA_STATIC[topic.id].forEach(function(q){ addQ(q, null); });
  }

  // 3. Fresh parametric variants
  var gen = GENERATORS[topic.id];
  if (typeof gen === 'function') {
    var rounds = variantRounds || 4;
    for (var r = 0; r < rounds; r++) {
      var batch = gen() || [];
      batch.forEach(function(q){ addQ(q, null); });
    }
  }

  return pool;
}

window.KHTNBank = {
  // Total rich pool for a single lesson (static + extra + fresh parametric variants)
  getPoolForTopic: function(topic, variantRounds){
    return getExpandedTopicPool(topic, variantRounds || 5);
  },

  // Draw a fresh randomized workout for a Lesson (ordered Easy -> Hard, ~3-4 per level, max diversity)
  sampleLessonSet: function(topic, perLevel){
    var takePerLv = perLevel || 4;
    var pool = getExpandedTopicPool(topic, 2);
    var out = [];
    [1, 2, 3, 4].forEach(function(lv){
      var bucket = shuffle(pool.filter(function(item){ return item.d === lv; }));
      bucket.slice(0, takePerLv).forEach(function(item){ out.push(item); });
    });
    // Fallback for Grade 6/9 lessons that only have levels 1-2
    if (out.length < Math.min(6, pool.length)) {
      var used = {};
      out.forEach(function(x){ used[x.q.q] = true; });
      shuffle(pool).forEach(function(x){
        if (!used[x.q.q] && out.length < 8) { used[x.q.q] = true; out.push(x); }
      });
      out.sort(function(a, b){ return a.d - b.d; });
    }
    return {
      totalAvailable: pool.length,
      items: out
    };
  },

  // Count estimated total rich bank size across topics
  estimateTotalQuestions: function(topics){
    var sum = 0;
    (topics || []).forEach(function(t){
      sum += getExpandedTopicPool(t, 5).length;
    });
    return sum;
  }
};
})();
