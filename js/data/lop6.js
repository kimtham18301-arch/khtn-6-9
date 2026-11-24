// Lớp 6 – theo Chương trình GDPT 2018 môn Khoa học tự nhiên. Đáp án đúng luôn là o[0]; web sẽ xáo trộn khi hiển thị.
window.KHTN = window.KHTN || [];
KHTN.push(
{ id:'l6-mo-dau', grade:6, subj:'td', title:'Mở đầu: an toàn & phép đo', prereq:[],
  theory:[
    'Khoa học tự nhiên nghiên cứu các sự vật, hiện tượng tự nhiên, tính chất, quy luật của chúng (vật lí, hóa học, sinh học, khoa học Trái Đất).',
    'Quy tắc an toàn trong phòng thực hành: đeo kính, găng tay khi cần; không nếm, không ngửi trực tiếp hóa chất; báo ngay giáo viên khi có sự cố.',
    'Đo chiều dài: thước; đo khối lượng: cân; đo thể tích chất lỏng: ống đong; đo thời gian: đồng hồ; đo nhiệt độ: nhiệt kế. Đặt mắt nhìn vuông góc với vạch chia, đọc kết quả theo độ chia nhỏ nhất.',
    'Kính lúp phóng to ảnh của vật nhỏ; kính hiển vi quang học dùng quan sát vật rất nhỏ như tế bào.'],
  formulas:['1 m = 10 dm = 100 cm = 1000 mm','1 kg = 1000 g; 1 tấn = 1000 kg','1 h = 60 min = 3600 s','°F = °C × 1,8 + 32'],
  questions:[
    {q:'Dụng cụ nào dùng để đo thể tích chất lỏng?',o:['Ống đong','Cân đồng hồ','Thước dây','Nhiệt kế'],w:'Ống đong có vạch chia thể tích (mL).'},
    {q:'Khi hóa chất dính vào da, việc đầu tiên cần làm là gì?',o:['Rửa ngay bằng nhiều nước sạch và báo giáo viên','Lau khô bằng khăn rồi tiếp tục làm','Bôi dầu ăn','Chờ hết tiết học mới xử lí'],w:'Rửa nhiều nước để loại hóa chất, sau đó báo giáo viên.'},
    {q:'Đổi 1,5 m sang cm.',n:150,t:0,u:'cm',w:'1,5 × 100 = 150 cm.'}]},

{ id:'l6-the-chat', grade:6, subj:'hoa', title:'Các thể của chất & sự chuyển thể', prereq:['l6-mo-dau'],
  theory:[
    'Chất có ba thể: rắn, lỏng, khí. Thể rắn có hình dạng và thể tích xác định; thể lỏng có thể tích xác định, hình dạng theo bình chứa; thể khí không có hình dạng, thể tích xác định và dễ nén.',
    'Sự nóng chảy (rắn → lỏng), đông đặc (lỏng → rắn), bay hơi/sôi (lỏng → khí), ngưng tụ (khí → lỏng).',
    'Nước đá nóng chảy ở 0 °C, nước sôi ở 100 °C (áp suất thường). Trong lúc chuyển thể nhiệt độ của chất không đổi.',
    'Chất có tính chất vật lí (màu, mùi, thể, nhiệt độ sôi, khối lượng riêng…) và tính chất hóa học (khả năng biến đổi thành chất khác).'],
  formulas:['Rắn ⇄ Lỏng: nóng chảy / đông đặc','Lỏng ⇄ Khí: bay hơi / ngưng tụ'],
  questions:[
    {q:'Quá trình chuyển từ thể lỏng sang thể khí gọi là gì?',o:['Sự bay hơi','Sự đông đặc','Sự nóng chảy','Sự ngưng tụ'],w:'Lỏng → khí là bay hơi.'},
    {q:'Chất ở thể rắn có đặc điểm nào sau đây?',o:['Có hình dạng và thể tích xác định','Không có hình dạng xác định','Rất dễ nén','Chảy được'],w:'Thể rắn: hình dạng và thể tích xác định.'},
    {q:'Nước đá nóng chảy ở nhiệt độ bao nhiêu độ C (áp suất thường)?',n:0,t:0,u:'°C',w:'Nhiệt độ nóng chảy của nước đá là 0 °C.'}]},

{ id:'l6-oxy-kk', grade:6, subj:'hoa', title:'Oxygen và không khí', prereq:['l6-the-chat'],
  theory:[
    'Không khí là hỗn hợp khí: khoảng 78% nitrogen (N₂), 21% oxygen (O₂), 1% khí khác (hơi nước, CO₂, khí hiếm…).',
    'Oxygen cần cho hô hấp và sự cháy. Que đóm còn tàn đỏ bùng cháy khi đưa vào lọ khí oxygen.',
    'Ô nhiễm không khí do khói bụi, khí thải công nghiệp, giao thông. Biện pháp: trồng cây xanh, dùng năng lượng sạch, xử lí khí thải.',
    'Sự cháy cần: chất cháy, oxygen và nhiệt độ đủ cao. Dập lửa bằng cách ngăn oxygen hoặc hạ nhiệt độ.'],
  formulas:['Không khí ≈ 78% N₂ + 21% O₂ + 1% khác (theo thể tích)'],
  questions:[
    {q:'Khí nào chiếm khoảng 78% thể tích không khí?',o:['Nitrogen','Oxygen','Carbon dioxide','Hơi nước'],w:'N₂ chiếm khoảng 78%.'},
    {q:'Cách nhận biết khí oxygen là gì?',o:['Que đóm còn tàn đỏ bùng cháy','Làm đục nước vôi trong','Làm quỳ tím hóa đỏ','Dập tắt que đóm đang cháy'],w:'O₂ duy trì sự cháy, làm tàn đóm bùng cháy.'},
    {q:'Biện pháp nào giúp giảm ô nhiễm không khí?',o:['Trồng nhiều cây xanh','Đốt rác thải ngoài trời','Xả khói không qua xử lí','Dùng nhiều xe máy cũ'],w:'Cây xanh hấp thụ bụi, CO₂ và thải O₂.'}]},

{ id:'l6-hon-hop', grade:6, subj:'hoa', title:'Hỗn hợp & tách chất', prereq:['l6-the-chat'],
  theory:[
    'Chất tinh khiết chỉ gồm một chất; hỗn hợp gồm hai hay nhiều chất trộn lẫn.',
    'Hỗn hợp đồng nhất (dung dịch: nước muối, nước đường) không phân biệt được các thành phần; hỗn hợp không đồng nhất (nước + cát, dầu + nước) phân biệt được.',
    'Tách chất: lọc (tách chất rắn không tan khỏi chất lỏng), cô cạn/ chưng cất (tách chất tan khỏi dung môi), chiết (tách hai chất lỏng không hòa tan), dùng nam châm (tách sắt).',
    'Dung dịch gồm chất tan và dung môi. Huyền phù là hỗn hợp chất rắn lơ lửng trong chất lỏng; nhũ tương là hỗn hợp hai chất lỏng không tan vào nhau.'],
  formulas:['Dung dịch = chất tan + dung môi'],
  questions:[
    {q:'Hỗn hợp nào sau đây là hỗn hợp đồng nhất?',o:['Nước muối','Nước và dầu ăn','Nước và cát','Đất đá'],w:'Muối tan hoàn toàn trong nước tạo dung dịch đồng nhất.'},
    {q:'Tách cát ra khỏi nước đục bằng phương pháp nào?',o:['Lọc','Cô cạn','Dùng nam châm','Chưng cất'],w:'Cát là chất rắn không tan nên dùng lọc.'},
    {q:'Muốn thu muối ăn từ nước biển người ta dùng cách nào?',o:['Cho nước bay hơi (phơi nắng, cô cạn)','Lọc bằng giấy lọc','Dùng nam châm','Chiết'],w:'Muối tan trong nước, cho nước bay hơi sẽ còn muối.'}]},

{ id:'l6-te-bao', grade:6, subj:'sinh', title:'Tế bào – đơn vị của sự sống', prereq:['l6-mo-dau'],
  theory:[
    'Tế bào là đơn vị cấu trúc và chức năng cơ bản của sự sống. Mọi sinh vật đều được cấu tạo từ tế bào.',
    'Cấu tạo chung: màng tế bào, tế bào chất, nhân (hoặc vùng nhân). Tế bào thực vật còn có thành tế bào, lục lạp và không bào lớn.',
    'Tế bào lớn lên rồi phân chia: 1 tế bào → 2 → 4 → 8… (sau k lần phân chia có 2ᵏ tế bào).',
    'Cơ thể đơn bào (vi khuẩn, trùng roi) chỉ gồm một tế bào; cơ thể đa bào gồm nhiều tế bào → mô → cơ quan → hệ cơ quan → cơ thể.'],
  formulas:['Số tế bào sau k lần phân chia: 2ᵏ'],
  questions:[
    {q:'Đơn vị cấu trúc và chức năng cơ bản của sự sống là gì?',o:['Tế bào','Mô','Cơ quan','Hệ cơ quan'],w:'Tế bào là đơn vị cơ bản.'},
    {q:'Bào quan nào thực hiện quang hợp trong tế bào thực vật?',o:['Lục lạp','Nhân','Màng tế bào','Không bào'],w:'Lục lạp chứa diệp lục.'},
    {q:'Một tế bào phân chia liên tiếp 3 lần tạo ra bao nhiêu tế bào?',n:8,t:0,u:'tế bào',w:'2³ = 8.'}]},

{ id:'l6-phan-loai', grade:6, subj:'sinh', title:'Đa dạng thế giới sống', prereq:['l6-te-bao'],
  theory:[
    'Các bậc phân loại từ lớn đến nhỏ: Giới → Ngành → Lớp → Bộ → Họ → Chi → Loài. Loài là bậc cơ bản.',
    'Tên khoa học gọi theo cách đặt tên kép (chi + loài), ví dụ Homo sapiens.',
    'Năm giới: Khởi sinh, Nguyên sinh, Nấm, Thực vật, Động vật. Virus không có cấu tạo tế bào, chỉ nhân lên khi sống kí sinh trong tế bào vật chủ.',
    'Động vật có xương sống: cá, lưỡng cư (ếch), bò sát, chim, thú. Thực vật: rêu, dương xỉ, hạt trần, hạt kín.'],
  formulas:['Giới > Ngành > Lớp > Bộ > Họ > Chi > Loài'],
  questions:[
    {q:'Bậc phân loại nhỏ nhất (cơ bản nhất) là gì?',o:['Loài','Chi','Họ','Giới'],w:'Loài là bậc nhỏ nhất.'},
    {q:'Virus có đặc điểm nào sau đây?',o:['Không có cấu tạo tế bào','Có nhân hoàn chỉnh','Tự quang hợp','Có thành tế bào'],w:'Virus chỉ gồm vỏ protein và vật chất di truyền.'},
    {q:'Ếch thuộc lớp động vật nào?',o:['Lưỡng cư','Bò sát','Chim','Cá'],w:'Ếch sống cả dưới nước và trên cạn: lưỡng cư.'}]},

{ id:'l6-luc', grade:6, subj:'ly', title:'Lực & ma sát', prereq:['l6-mo-dau'],
  theory:[
    'Lực là tác dụng đẩy hoặc kéo của vật này lên vật khác. Đơn vị lực: niutơn (N). Lực làm vật biến dạng hoặc thay đổi chuyển động.',
    'Trọng lượng là độ lớn lực hút của Trái Đất lên vật. Vật có khối lượng m (kg) có trọng lượng P ≈ 10m (N).',
    'Lực ma sát xuất hiện ở bề mặt tiếp xúc, cản trở chuyển động. Ma sát có lợi (phanh xe, đi lại) và có hại (mòn máy).',
    'Lực cản của nước, không khí cản trở chuyển động của vật trong chất lỏng, chất khí.'],
  formulas:['P = 10 · m (P: N, m: kg)'],
  questions:[
    {q:'Đơn vị của lực là gì?',o:['Niutơn (N)','Kilôgam (kg)','Mét (m)','Giây (s)'],w:'Lực đo bằng niutơn.'},
    {q:'Một vật có khối lượng 5 kg. Trọng lượng của vật khoảng bao nhiêu N?',n:50,t:0,u:'N',w:'P = 10 × 5 = 50 N.'},
    {q:'Trường hợp nào sau đây lực ma sát có lợi?',o:['Phanh giúp xe dừng lại','Xích xe đạp bị mòn','Bánh xe quay trong ổ trục','Đẩy thùng nặng trên sàn'],w:'Ma sát giữa má phanh và vành bánh giúp xe dừng.'}]},

{ id:'l6-nang-luong', grade:6, subj:'ly', title:'Năng lượng', prereq:['l6-luc'],
  theory:[
    'Năng lượng là khả năng thực hiện công, đơn vị jun (J). Các dạng: cơ năng, nhiệt năng, điện năng, quang năng, hóa năng, năng lượng âm.',
    'Định luật bảo toàn năng lượng: năng lượng không tự sinh ra cũng không tự mất đi, chỉ chuyển hóa từ dạng này sang dạng khác hoặc truyền từ vật này sang vật khác.',
    'Năng lượng tái tạo: gió, mặt trời, nước chảy. Năng lượng không tái tạo: than đá, dầu mỏ, khí tự nhiên.',
    'Nên sử dụng tiết kiệm năng lượng để bảo vệ môi trường.'],
  formulas:['Đơn vị năng lượng: J (1 kJ = 1000 J)'],
  questions:[
    {q:'Đơn vị của năng lượng trong hệ SI là gì?',o:['Jun (J)','Niutơn (N)','Oát (W)','Pascal (Pa)'],w:'Năng lượng đo bằng jun.'},
    {q:'Phát biểu nào đúng với định luật bảo toàn năng lượng?',o:['Năng lượng chỉ chuyển hóa hoặc truyền đi, không tự mất','Năng lượng có thể tự sinh ra','Năng lượng có thể biến mất hoàn toàn','Năng lượng không thể chuyển hóa'],w:'Tổng năng lượng được bảo toàn.'},
    {q:'Nguồn năng lượng nào là năng lượng tái tạo?',o:['Năng lượng gió','Than đá','Dầu mỏ','Khí tự nhiên'],w:'Gió, mặt trời, nước chảy là tái tạo được.'}]},

{ id:'l6-trai-dat', grade:6, subj:'td', title:'Trái Đất và bầu trời', prereq:[],
  theory:[
    'Trái Đất tự quay quanh trục một vòng hết khoảng 24 giờ → ngày và đêm; quay quanh Mặt Trời một vòng khoảng 365 ngày.',
    'Mặt Trăng quay quanh Trái Đất khoảng 27,3 ngày. Các pha của Mặt Trăng (trăng tròn, trăng khuyết…) do ta nhìn thấy phần được chiếu sáng khác nhau.',
    'Nhật thực: Mặt Trăng nằm giữa Mặt Trời và Trái Đất. Nguyệt thực: Trái Đất nằm giữa Mặt Trời và Mặt Trăng.',
    'Hệ Mặt Trời gồm Mặt Trời và 8 hành tinh: Thủy, Kim, Trái Đất, Hỏa, Mộc, Thổ, Thiên Vương, Hải Vương. Ngân Hà là thiên hà chứa Hệ Mặt Trời.'],
  formulas:['8 hành tinh: Thủy – Kim – Trái Đất – Hỏa – Mộc – Thổ – Thiên Vương – Hải Vương'],
  questions:[
    {q:'Hệ Mặt Trời có bao nhiêu hành tinh?',n:8,t:0,u:'hành tinh',w:'Có 8 hành tinh.'},
    {q:'Nhật thực xảy ra khi nào?',o:['Mặt Trăng nằm giữa Mặt Trời và Trái Đất','Trái Đất nằm giữa Mặt Trời và Mặt Trăng','Mặt Trời nằm giữa Trái Đất và Mặt Trăng','Mặt Trăng ở xa Trái Đất nhất'],w:'Mặt Trăng che Mặt Trời.'},
    {q:'Hiện tượng ngày và đêm do đâu?',o:['Trái Đất tự quay quanh trục','Trái Đất quay quanh Mặt Trời','Mặt Trăng quay quanh Trái Đất','Mặt Trời quay quanh Trái Đất'],w:'Do Trái Đất tự quay nên một nửa được chiếu sáng luân phiên.'}]}
);
