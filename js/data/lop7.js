window.KHTN = window.KHTN || [];
KHTN.push(
{ id:'l7-nguyen-tu', grade:7, subj:'hoa', title:'Nguyên tử', prereq:['l6-hon-hop'],
  theory:['Nguyên tử gồm hạt nhân (proton mang điện dương, neutron không mang điện) và vỏ là các electron mang điện âm.','Nguyên tử trung hòa về điện: số proton = số electron.','Khối lượng nguyên tử tập trung ở hạt nhân; electron chuyển động quanh hạt nhân theo từng lớp.','Khối lượng nguyên tử tính bằng amu (1 amu ≈ 1,66·10⁻²⁷ kg).'],
  formulas:['Số p = số e (nguyên tử trung hòa)','Số khối A = số p + số n'],
  questions:[
    {q:'Hạt nào không mang điện trong nguyên tử?',o:['Neutron','Proton','Electron','Ion'],w:'Neutron trung hòa về điện.'},
    {q:'Nguyên tử có 11 proton và 12 neutron. Số electron là bao nhiêu?',n:11,t:0,u:'electron',w:'Số e = số p = 11.'},
    {q:'Phần nào chiếm gần như toàn bộ khối lượng nguyên tử?',o:['Hạt nhân','Lớp vỏ electron','Khoảng trống','Đều nhau'],w:'Electron rất nhẹ, khối lượng tập trung ở hạt nhân.'}]},

{ id:'l7-bang-tuan-hoan', grade:7, subj:'hoa', title:'Nguyên tố hóa học & bảng tuần hoàn', prereq:['l7-nguyen-tu'],
  theory:['Nguyên tố hóa học là tập hợp các nguyên tử cùng loại, có cùng số proton trong hạt nhân.','Kí hiệu hóa học: H, O, C, N, Na, Mg, Al, Ca, Fe, Cu, Zn…','Bảng tuần hoàn sắp xếp theo điện tích hạt nhân tăng dần. Số thứ tự ô = số proton = số electron.','Chu kì (hàng ngang) = số lớp electron. Nhóm (cột dọc) có tính chất tương tự; nhóm A cho biết số electron lớp ngoài cùng.','Kim loại ở bên trái, phi kim ở bên phải, nhóm VIIIA là khí hiếm.'],
  formulas:['Số hiệu nguyên tử Z = số p = số e','Số lớp electron = số thứ tự chu kì'],
  questions:[
    {q:'Kí hiệu hóa học của nguyên tố sắt là gì?',o:['Fe','S','F','Si'],w:'Fe từ tiếng La-tinh Ferrum.'},
    {q:'Nguyên tố ở ô số 8 trong bảng tuần hoàn có bao nhiêu proton?',n:8,t:0,u:'proton',w:'Số thứ tự ô = số proton.'},
    {q:'Nguyên tử có 3 lớp electron thì nằm ở chu kì mấy?',o:['Chu kì 3','Chu kì 1','Chu kì 2','Chu kì 4'],w:'Số lớp electron = số chu kì.'}]},

{ id:'l7-phan-tu', grade:7, subj:'hoa', title:'Phân tử & liên kết hóa học', prereq:['l7-bang-tuan-hoan'],
  theory:['Phân tử là hạt đại diện cho chất, gồm hai hay nhiều nguyên tử liên kết. Đơn chất do một nguyên tố tạo nên (O₂, Fe); hợp chất do hai nguyên tố trở lên (H₂O, NaCl).','Liên kết ion: giữa kim loại điển hình và phi kim điển hình (NaCl), do cho – nhận electron.','Liên kết cộng hóa trị: giữa các phi kim, do dùng chung electron (H₂O, CO₂).','Phân tử khối = tổng khối lượng nguyên tử các nguyên tử trong phân tử (amu).'],
  formulas:['Phân tử khối H₂O = 2·1 + 16 = 18','Nguyên tử khối: H = 1, C = 12, N = 14, O = 16, Na = 23, Mg = 24, Al = 27, S = 32, Cl = 35,5, K = 39, Ca = 40, Fe = 56, Cu = 64, Zn = 65'],
  questions:[
    {q:'Chất nào sau đây là đơn chất?',o:['O₂','H₂O','CO₂','NaCl'],w:'O₂ chỉ gồm nguyên tố oxygen.'},
    {q:'Phân tử khối của nước (H₂O) là bao nhiêu?',n:18,t:0,u:'amu',w:'2×1 + 16 = 18.'},
    {q:'Liên kết trong phân tử NaCl là liên kết gì?',o:['Liên kết ion','Liên kết cộng hóa trị','Liên kết kim loại','Liên kết hydrogen'],w:'Na nhường electron cho Cl tạo ion Na⁺ và Cl⁻.'}]},

{ id:'l7-hoa-tri', grade:7, subj:'hoa', title:'Hóa trị & công thức hóa học', prereq:['l7-phan-tu'],
  theory:['Hóa trị là khả năng liên kết của nguyên tử nguyên tố này với nguyên tử nguyên tố khác. H hóa trị I, O hóa trị II.','Quy tắc hóa trị: với AₓBᵧ, a·x = b·y (a, b là hóa trị của A, B).','Lập công thức: ghi kí hiệu, hóa trị rồi chéo hóa trị thành chỉ số (rút gọn nếu được). Ví dụ Al(III), O(II) → Al₂O₃.','Phần trăm khối lượng nguyên tố: %X = (n·MX / Mhợp chất) × 100%.'],
  formulas:['a·x = b·y','%X = n·MX / M × 100%'],
  questions:[
    {q:'Hóa trị của Fe trong Fe₂O₃ là bao nhiêu?',o:['III','II','I','IV'],w:'2·x = 3·2 → x = III.'},
    {q:'Công thức hóa học đúng của hợp chất tạo bởi Al (III) và O (II)?',o:['Al₂O₃','AlO','Al₃O₂','Al₂O'],w:'Chéo hóa trị: Al₂O₃.'},
    {q:'Phân tử khối của CaCO₃ là bao nhiêu? (Ca = 40, C = 12, O = 16)',n:100,t:0,u:'amu',w:'40 + 12 + 3·16 = 100.'}]},

{ id:'l7-toc-do', grade:7, subj:'ly', title:'Tốc độ chuyển động', prereq:['l6-luc'],
  theory:['Tốc độ cho biết mức độ nhanh chậm của chuyển động: v = s/t. Đơn vị m/s, km/h.','Đổi đơn vị: 1 m/s = 3,6 km/h.','Đồ thị quãng đường – thời gian: đường thẳng dốc lên là chuyển động đều (dốc hơn = nhanh hơn); đường nằm ngang là vật đứng yên.','An toàn giao thông: giữ khoảng cách an toàn, đội mũ bảo hiểm, không vượt quá tốc độ quy định.'],
  formulas:['v = s / t','s = v·t;  t = s / v','1 m/s = 3,6 km/h'],
  questions:[
    {q:'Một xe đi 90 km trong 1,5 giờ. Tốc độ trung bình là bao nhiêu km/h?',n:60,t:0,u:'km/h',w:'90 : 1,5 = 60.'},
    {q:'Đổi 36 km/h sang m/s.',n:10,t:0,u:'m/s',w:'36 : 3,6 = 10.'},
    {q:'Trên đồ thị quãng đường – thời gian, đường nằm ngang cho biết điều gì?',o:['Vật đứng yên','Vật chuyển động đều','Vật chuyển động nhanh dần','Vật quay lại'],w:'Quãng đường không đổi theo thời gian.'}]},

{ id:'l7-am-thanh', grade:7, subj:'ly', title:'Âm thanh', prereq:['l7-toc-do'],
  theory:['Âm thanh do vật dao động phát ra, truyền qua chất rắn, lỏng, khí; không truyền trong chân không.','Tần số (Hz) là số dao động trong 1 giây. Tần số lớn → âm cao (bổng); tần số nhỏ → âm thấp (trầm).','Biên độ dao động lớn → âm to. Độ to đo bằng đề-xi-ben (dB).','Phản xạ âm: tiếng vang khi âm phản xạ đến tai chậm hơn âm trực tiếp ít nhất 1/15 s. Chống ô nhiễm tiếng ồn: cách âm, trồng cây, giảm nguồn ồn.'],
  formulas:['Tần số f = số dao động / thời gian (Hz)','Tai người nghe được 20 Hz – 20 000 Hz'],
  questions:[
    {q:'Âm thanh KHÔNG truyền được trong môi trường nào?',o:['Chân không','Nước','Không khí','Thép'],w:'Âm cần môi trường vật chất để truyền.'},
    {q:'Âm càng cao khi vật dao động có đặc điểm nào?',o:['Tần số càng lớn','Biên độ càng lớn','Khối lượng càng lớn','Tần số càng nhỏ'],w:'Tần số lớn → âm cao.'},
    {q:'Độ to của âm phụ thuộc vào đại lượng nào?',o:['Biên độ dao động','Tần số','Nhiệt độ','Tốc độ truyền'],w:'Biên độ lớn thì âm to.'}]},

{ id:'l7-anh-sang', grade:7, subj:'ly', title:'Ánh sáng & gương phẳng', prereq:['l7-toc-do'],
  theory:['Ánh sáng truyền theo đường thẳng. Ta nhìn thấy vật khi có ánh sáng từ vật truyền vào mắt.','Định luật phản xạ: tia phản xạ nằm trong mặt phẳng tới; góc phản xạ bằng góc tới.','Ảnh của vật qua gương phẳng là ảnh ảo, cùng kích thước với vật và cách gương một khoảng bằng khoảng cách từ vật đến gương.','Góc tới, góc phản xạ đo từ tia sáng tới đường pháp tuyến (không phải tới mặt gương).'],
  formulas:['i = i′','Khoảng cách vật – gương = khoảng cách ảnh – gương'],
  questions:[
    {q:'Tia tới hợp pháp tuyến góc 30°. Góc phản xạ bằng bao nhiêu độ?',n:30,t:0,u:'°',w:'Góc phản xạ = góc tới.'},
    {q:'Ảnh của vật qua gương phẳng có tính chất nào?',o:['Ảnh ảo, bằng vật','Ảnh thật, bằng vật','Ảnh ảo, nhỏ hơn vật','Ảnh thật, lớn hơn vật'],w:'Ảnh ảo, cùng kích thước.'},
    {q:'Vật cách gương phẳng 2 m. Ảnh cách vật bao nhiêu mét?',n:4,t:0,u:'m',w:'Ảnh cách gương 2 m nên cách vật 4 m.'}]},

{ id:'l7-tu', grade:7, subj:'ly', title:'Từ trường & nam châm', prereq:['l6-luc'],
  theory:['Nam châm hút sắt, coban, niken. Mỗi nam châm có hai cực: Bắc (N) và Nam (S). Hai cực cùng tên đẩy nhau, khác tên hút nhau.','Xung quanh nam châm có từ trường. Đường sức từ là các đường cong khép kín đi ra từ cực Bắc, đi vào cực Nam (bên ngoài nam châm).','Kim nam châm tự do chỉ hướng Bắc – Nam vì Trái Đất là một nam châm khổng lồ.','Nam châm điện: cuộn dây có dòng điện quấn quanh lõi sắt non. Mạnh hơn khi tăng dòng điện hoặc số vòng dây.'],
  formulas:['Cùng cực: đẩy; khác cực: hút'],
  questions:[
    {q:'Hai cực cùng tên của hai nam châm khi đặt gần nhau sẽ như thế nào?',o:['Đẩy nhau','Hút nhau','Không tương tác','Hút rồi đẩy'],w:'Cùng tên đẩy nhau.'},
    {q:'Vì sao kim nam châm đặt tự do luôn chỉ hướng Bắc – Nam?',o:['Vì Trái Đất là một nam châm lớn','Vì Mặt Trời hút','Vì gió thổi','Vì trọng lực'],w:'Từ trường Trái Đất tác dụng lên kim nam châm.'},
    {q:'Cấu tạo cơ bản của nam châm điện gồm gì?',o:['Cuộn dây có dòng điện quấn quanh lõi sắt non','Thanh đồng và pin','Hai thanh nhôm','Dây đồng và gỗ'],w:'Lõi sắt non bị từ hóa khi có dòng điện.'}]},

{ id:'l7-trao-doi-chat', grade:7, subj:'sinh', title:'Trao đổi chất, quang hợp & hô hấp', prereq:['l6-te-bao'],
  theory:['Trao đổi chất là quá trình cơ thể lấy chất từ môi trường, biến đổi và thải chất thừa; kèm theo chuyển hóa năng lượng.','Quang hợp: cây xanh dùng nước, CO₂ và ánh sáng, nhờ diệp lục, tạo chất hữu cơ (glucose) và giải phóng O₂. Xảy ra ở lục lạp.','Hô hấp tế bào: phân giải chất hữu cơ với O₂, giải phóng năng lượng, tạo CO₂ và H₂O. Chủ yếu ở ti thể.','Rễ hút nước và muối khoáng; nước vận chuyển lên lá qua mạch gỗ; thoát hơi nước qua khí khổng.'],
  formulas:['Quang hợp: CO₂ + H₂O —(ánh sáng, diệp lục)→ C₆H₁₂O₆ + O₂','Hô hấp: C₆H₁₂O₆ + O₂ → CO₂ + H₂O + năng lượng'],
  questions:[
    {q:'Sản phẩm của quang hợp gồm gì?',o:['Chất hữu cơ (glucose) và oxygen','CO₂ và nước','Chỉ nước','Nitrogen và hơi nước'],w:'Quang hợp tạo glucose và O₂.'},
    {q:'Hô hấp tế bào chủ yếu xảy ra ở bào quan nào?',o:['Ti thể','Lục lạp','Nhân','Màng tế bào'],w:'Ti thể là “nhà máy năng lượng”.'},
    {q:'Cây thoát hơi nước chủ yếu qua cấu trúc nào?',o:['Khí khổng','Rễ','Thân gỗ','Hoa'],w:'Khí khổng ở biểu bì lá.'}]},

{ id:'l7-cam-ung-sinh-san', grade:7, subj:'sinh', title:'Cảm ứng, sinh trưởng & sinh sản', prereq:['l7-trao-doi-chat'],
  theory:['Cảm ứng là khả năng sinh vật tiếp nhận và phản ứng với kích thích. Ở thực vật: hướng sáng, hướng nước, hướng trọng lực.','Sinh trưởng là tăng kích thước và khối lượng; phát triển là biến đổi về hình thái, cấu trúc, chức năng.','Sinh sản vô tính: một cơ thể tạo con giống mình (giâm cành, phân đôi). Sinh sản hữu tính: có sự kết hợp giao tử đực và cái tạo hợp tử.','Ở thực vật có hoa: hoa → thụ phấn → thụ tinh → quả và hạt.'],
  formulas:['Giao tử đực + giao tử cái → hợp tử (thụ tinh)'],
  questions:[
    {q:'Ngọn cây mọc cong về phía ánh sáng là hiện tượng gì?',o:['Hướng sáng','Hướng nước','Hướng đất','Hướng hóa'],w:'Cây phản ứng với kích thích ánh sáng.'},
    {q:'Hình thức nào là sinh sản vô tính?',o:['Giâm cành','Thụ phấn cho hoa','Ấp trứng gà','Gieo hạt do hoa thụ tinh'],w:'Giâm cành không có sự kết hợp giao tử.'},
    {q:'Thụ tinh là gì?',o:['Sự kết hợp giao tử đực và giao tử cái tạo hợp tử','Sự rụng của hoa','Sự chuyển hạt phấn lên nhụy','Sự nảy mầm của hạt'],w:'Thụ tinh tạo hợp tử.'}]}
);
