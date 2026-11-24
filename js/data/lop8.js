window.KHTN = window.KHTN || [];
// Điều kiện chuẩn dùng trong bài: 25 °C, 1 bar → 1 mol khí chiếm 24,79 L.
KHTN.push(
{ id:'l8-phan-ung', grade:8, subj:'hoa', title:'Phản ứng hóa học & bảo toàn khối lượng', prereq:['l7-hoa-tri'],
  theory:['Biến đổi vật lí: không tạo chất mới (nước đá tan). Biến đổi hóa học (phản ứng hóa học): tạo chất mới (sắt gỉ, đốt cháy).','Phản ứng: chất phản ứng (chất đầu) → sản phẩm. Dấu hiệu: đổi màu, tạo kết tủa, sủi bọt khí, tỏa/thu nhiệt, phát sáng.','Định luật bảo toàn khối lượng: tổng khối lượng chất phản ứng = tổng khối lượng sản phẩm.','Cân bằng PTHH: số nguyên tử mỗi nguyên tố hai vế bằng nhau. Phân biệt hệ số (2H₂O: hai phân tử) và chỉ số (H₂O: hai nguyên tử H trong một phân tử).'],
  formulas:['m(chất đầu) = m(sản phẩm)','3Fe + 2O₂ → Fe₃O₄'],
  questions:[
    {q:'Hiện tượng nào là biến đổi hóa học?',o:['Sắt bị gỉ','Nước đá tan','Đường tan trong nước','Dây tóc bóng đèn nóng sáng rồi nguội'],w:'Gỉ sắt tạo chất mới.'},
    {q:'Cân bằng Fe + O₂ → Fe₃O₄. Tổng các hệ số nguyên tối giản là bao nhiêu?',n:6,t:0,u:'',w:'3Fe + 2O₂ → 1Fe₃O₄: 3+2+1 = 6.'},
    {q:'Fe + S → FeS. Cho 5,6 g Fe phản ứng vừa đủ với 3,2 g S. Khối lượng FeS tạo thành là bao nhiêu gam?',n:8.8,t:0.01,u:'g',w:'Bảo toàn khối lượng: 5,6 + 3,2 = 8,8 g.'}]},

{ id:'l8-mol', grade:8, subj:'hoa', title:'Mol & tỉ khối chất khí', prereq:['l8-phan-ung'],
  theory:['1 mol chứa 6,022·10²³ hạt. Khối lượng mol M (g/mol) bằng số trị với nguyên tử khối/phân tử khối.','Ở 25 °C, 1 bar, 1 mol khí bất kì chiếm 24,79 L.','Tỉ khối khí A so với khí B: d = MA / MB. So với không khí (M ≈ 29): d = MA / 29.'],
  formulas:['n = m / M','V = n · 24,79 (L, ở 25 °C, 1 bar)','dA/B = MA / MB'],
  questions:[
    {q:'Có bao nhiêu mol trong 11 g CO₂? (M = 44 g/mol)',n:0.25,t:0.005,u:'mol',w:'n = 11 : 44 = 0,25.'},
    {q:'0,5 mol khí ở 25 °C, 1 bar có thể tích bao nhiêu lít? (làm tròn 1 chữ số thập phân)',n:12.4,t:0.1,u:'L',w:'0,5 × 24,79 ≈ 12,4 L.'},
    {q:'Tỉ khối của CO₂ so với H₂ bằng bao nhiêu?',n:22,t:0,u:'',w:'44 : 2 = 22.'}]},

{ id:'l8-dung-dich', grade:8, subj:'hoa', title:'Dung dịch, nồng độ & tính theo PTHH', prereq:['l8-mol'],
  theory:['Nồng độ phần trăm: C% = mct / mdd × 100%, với mdd = mct + mdung môi.','Nồng độ mol: CM = n / V (V tính bằng lít).','Tính theo PTHH: đổi về mol → dùng tỉ lệ hệ số → đổi ra khối lượng/thể tích. Hiệu suất H = lượng thực tế / lượng lí thuyết × 100%.','Tốc độ phản ứng tăng khi tăng nhiệt độ, nồng độ, diện tích tiếp xúc (nghiền nhỏ) hoặc dùng chất xúc tác.'],
  formulas:['C% = mct/mdd × 100%','CM = n / V','H = m thực tế / m lí thuyết × 100%'],
  questions:[
    {q:'Hòa tan 20 g muối vào 180 g nước. Nồng độ phần trăm của dung dịch là bao nhiêu?',n:10,t:0,u:'%',w:'mdd = 200 g; 20/200 = 10%.'},
    {q:'0,5 mol NaCl trong 250 mL dung dịch. Nồng độ mol là bao nhiêu M?',n:2,t:0,u:'M',w:'V = 0,25 L; 0,5/0,25 = 2 M.'},
    {q:'Zn + 2HCl → ZnCl₂ + H₂. Cho 0,1 mol Zn, thể tích H₂ (25 °C, 1 bar) là bao nhiêu lít? (làm tròn 2 chữ số thập phân)',n:2.48,t:0.02,u:'L',w:'n(H₂) = 0,1 mol → 2,479 L.'}]},

{ id:'l8-acid-base', grade:8, subj:'hoa', title:'Acid, base, pH, oxide, muối', prereq:['l8-dung-dich'],
  theory:['Acid làm quỳ tím hóa đỏ (HCl, H₂SO₄); base tan (kiềm) làm quỳ tím hóa xanh (NaOH, Ca(OH)₂).','Thang pH: pH < 7 acid; pH = 7 trung tính; pH > 7 base.','Phản ứng trung hòa: acid + base → muối + nước. VD: NaOH + HCl → NaCl + H₂O.','Oxide base (CaO, Na₂O) tác dụng acid; oxide acid (CO₂, SO₂) tác dụng base. Muối: gồm cation kim loại (hoặc NH₄⁺) và anion gốc acid.','Phân bón: đạm (N), lân (P), kali (K), NPK. Dùng đúng liều để tránh ô nhiễm.'],
  formulas:['Acid + base → muối + nước','CaO + H₂O → Ca(OH)₂'],
  questions:[
    {q:'Dung dịch có pH = 9 có tính chất gì?',o:['Base (kiềm)','Acid','Trung tính','Không xác định'],w:'pH > 7 là base.'},
    {q:'Quỳ tím gặp dung dịch NaOH chuyển sang màu nào?',o:['Xanh','Đỏ','Vàng','Không đổi màu'],w:'Base làm quỳ tím hóa xanh.'},
    {q:'Phân đạm cung cấp nguyên tố dinh dưỡng chính nào cho cây?',o:['Nitrogen (N)','Phosphorus (P)','Potassium (K)','Calcium (Ca)'],w:'Đạm cung cấp N.'}]},

{ id:'l8-khoi-luong-rieng', grade:8, subj:'ly', title:'Khối lượng riêng & áp suất', prereq:['l6-luc'],
  theory:['Khối lượng riêng D = m / V (kg/m³ hoặc g/cm³). 1 g/cm³ = 1000 kg/m³; nước 1 g/cm³.','Áp suất p = F / S (Pa = N/m²). Cùng áp lực, diện tích tiếp xúc càng nhỏ áp suất càng lớn.','Áp suất chất lỏng gây ra tại độ sâu h: p = d·h (d: trọng lượng riêng; nước ≈ 10 000 N/m³). Tăng theo độ sâu.','Áp suất khí quyển tác dụng theo mọi phương.'],
  formulas:['D = m / V','p = F / S','p = d·h = 10·D·h'],
  questions:[
    {q:'Khối đá 270 g có thể tích 100 cm³. Khối lượng riêng là bao nhiêu g/cm³?',n:2.7,t:0.01,u:'g/cm³',w:'270 : 100 = 2,7.'},
    {q:'Áp lực 600 N tác dụng lên diện tích 0,03 m². Áp suất bằng bao nhiêu Pa?',n:20000,t:0,u:'Pa',w:'600 : 0,03 = 20 000.'},
    {q:'Tại độ sâu 2 m trong nước (d = 10 000 N/m³), áp suất chất lỏng gây ra là bao nhiêu Pa?',n:20000,t:0,u:'Pa',w:'p = 10 000 × 2 = 20 000.'}]},

{ id:'l8-archimedes', grade:8, subj:'ly', title:'Lực đẩy Archimedes', prereq:['l8-khoi-luong-rieng'],
  theory:['Vật nhúng trong chất lỏng (hoặc khí) chịu lực đẩy hướng lên: FA = d·V (V là thể tích phần chất lỏng bị vật chiếm chỗ).','Vật chìm khi FA < P; lơ lửng khi FA = P; nổi khi FA > P (lúc đó phần chìm có FA = P).','Vật đặc nổi trên chất lỏng khi khối lượng riêng của vật nhỏ hơn của chất lỏng.'],
  formulas:['FA = d · V','FA = 10 · D · V'],
  questions:[
    {q:'Vật chiếm chỗ 0,002 m³ nước (d = 10 000 N/m³). Lực đẩy Archimedes bằng bao nhiêu N?',n:20,t:0,u:'N',w:'10 000 × 0,002 = 20 N.'},
    {q:'Vật đặc nổi trên mặt nước khi nào?',o:['Khối lượng riêng của vật nhỏ hơn của nước','Khối lượng riêng của vật lớn hơn của nước','Vật rất nặng','Vật có hình cầu'],w:'D vật < D nước thì nổi.'},
    {q:'Vật lơ lửng trong chất lỏng thì lực đẩy FA so với trọng lượng P như thế nào?',o:['FA = P','FA > P','FA < P','FA = 0'],w:'Cân bằng lực.'}]},

{ id:'l8-don-bay', grade:8, subj:'ly', title:'Tác dụng làm quay của lực – đòn bẩy', prereq:['l6-luc'],
  theory:['Moment lực M = F·d (N·m), d là khoảng cách từ trục quay đến giá của lực.','Điều kiện cân bằng đòn bẩy: F₁·d₁ = F₂·d₂.','Đòn bẩy lợi về lực khi tay đòn của lực tác dụng dài hơn tay đòn của lực cản (kìm, xà beng, kéo).'],
  formulas:['M = F·d','F₁·d₁ = F₂·d₂'],
  questions:[
    {q:'Lực 20 N có tay đòn 0,5 m. Moment lực bằng bao nhiêu N·m?',n:10,t:0,u:'N·m',w:'20 × 0,5 = 10.'},
    {q:'Đòn bẩy cân bằng: F₁ = 20 N, d₁ = 0,3 m, d₂ = 0,1 m. Lực F₂ là bao nhiêu N?',n:60,t:0,u:'N',w:'F₂ = 20·0,3 / 0,1 = 60.'},
    {q:'Để nâng vật nặng bằng đòn bẩy cho lợi lực, ta nên làm gì?',o:['Tăng tay đòn của lực tác dụng','Giảm tay đòn của lực tác dụng','Đặt vật gần tay hơn trục','Dùng đòn ngắn'],w:'Tay đòn của lực càng dài, lực cần càng nhỏ.'}]},

{ id:'l8-dien', grade:8, subj:'ly', title:'Điện: dòng điện, cường độ & hiệu điện thế', prereq:['l7-tu'],
  theory:['Vật nhiễm điện do cọ xát: cùng loại điện tích đẩy nhau, khác loại hút nhau.','Dòng điện là dòng các điện tích dịch chuyển có hướng. Nguồn điện duy trì dòng điện trong mạch.','Cường độ dòng điện I (A) đo bằng ampe kế mắc nối tiếp; hiệu điện thế U (V) đo bằng vôn kế mắc song song.','Đổi: 1 A = 1000 mA; 1 kV = 1000 V.'],
  formulas:['1 A = 1000 mA','Ampe kế nối tiếp; vôn kế song song'],
  questions:[
    {q:'Ampe kế được mắc như thế nào vào mạch cần đo?',o:['Nối tiếp','Song song','Tùy ý','Mắc vào hai cực nguồn'],w:'Ampe kế có điện trở rất nhỏ nên mắc nối tiếp.'},
    {q:'Hai vật nhiễm điện cùng loại khi đặt gần nhau sẽ như thế nào?',o:['Đẩy nhau','Hút nhau','Không tương tác','Hút rồi đẩy'],w:'Cùng dấu thì đẩy.'},
    {q:'Đổi 2500 mA sang A.',n:2.5,t:0,u:'A',w:'2500 : 1000 = 2,5.'}]},

{ id:'l8-nhiet', grade:8, subj:'ly', title:'Nhiệt: nhiệt dung riêng & truyền nhiệt', prereq:['l6-nang-luong'],
  theory:['Nhiệt lượng vật thu vào: Q = m·c·Δt (c: nhiệt dung riêng, nước c ≈ 4200 J/kg·K).','Truyền nhiệt: dẫn nhiệt (chủ yếu ở chất rắn), đối lưu (chất lỏng, khí), bức xạ nhiệt (truyền cả trong chân không).','Khi nhiệt độ tăng, chất thường nở ra (thể tích tăng); nước là trường hợp đặc biệt trong khoảng 0 °C – 4 °C.'],
  formulas:['Q = m · c · Δt'],
  questions:[
    {q:'Cần bao nhiêu J để làm 2 kg nước nóng thêm 10 °C? (c = 4200 J/kg·K)',n:84000,t:0,u:'J',w:'2 × 4200 × 10 = 84 000.'},
    {q:'Nhiệt từ Mặt Trời đến Trái Đất chủ yếu bằng hình thức nào?',o:['Bức xạ nhiệt','Dẫn nhiệt','Đối lưu','Cả ba như nhau'],w:'Giữa Mặt Trời và Trái Đất là chân không.'},
    {q:'Đối lưu xảy ra chủ yếu ở đâu?',o:['Chất lỏng và chất khí','Chất rắn','Chân không','Kim loại'],w:'Dòng chất nóng đi lên, lạnh đi xuống.'}]},

{ id:'l8-co-the-nguoi', grade:8, subj:'sinh', title:'Cơ thể người: tuần hoàn, hô hấp, tiêu hóa', prereq:['l7-trao-doi-chat'],
  theory:['Máu gồm huyết tương và tế bào máu: hồng cầu (vận chuyển O₂ nhờ hemoglobin), bạch cầu (bảo vệ), tiểu cầu (đông máu).','Tim có 4 ngăn; vòng tuần hoàn lớn đưa máu giàu O₂ tới cơ thể, vòng nhỏ đưa máu tới phổi.','Trao đổi khí diễn ra ở phế nang. Tiêu hóa: enzyme amylase (nước bọt) biến đổi tinh bột; ruột non hấp thụ chất dinh dưỡng.','Hệ bài tiết (thận), hệ thần kinh (phản xạ), hệ nội tiết (hormone như insulin), sinh sản và miễn dịch (vaccine tạo miễn dịch chủ động).'],
  formulas:['Cung phản xạ: thụ quan → nơron cảm giác → trung ương → nơron vận động → cơ quan phản ứng'],
  questions:[
    {q:'Tế bào máu nào vận chuyển oxygen?',o:['Hồng cầu','Bạch cầu','Tiểu cầu','Huyết tương'],w:'Hồng cầu chứa hemoglobin.'},
    {q:'Cơ quan nào hấp thụ chủ yếu chất dinh dưỡng?',o:['Ruột non','Dạ dày','Ruột già','Thực quản'],w:'Ruột non có nhiều nếp gấp, lông ruột.'},
    {q:'Hormone insulin do cơ quan nào tiết ra và có tác dụng gì?',o:['Tuyến tụy; hạ đường huyết','Tuyến giáp; hạ đường huyết','Gan; tăng đường huyết','Thận; tăng đường huyết'],w:'Insulin từ tuyến tụy giúp giảm đường huyết.'}]},

{ id:'l8-he-sinh-thai', grade:8, subj:'sinh', title:'Quần thể, quần xã & hệ sinh thái', prereq:['l6-phan-loai'],
  theory:['Quần thể: các cá thể cùng loài, sống trong một khu vực, cùng thời gian, có thể sinh sản với nhau.','Quần xã: các quần thể khác loài cùng sống trong một khu vực. Hệ sinh thái = quần xã + môi trường sống.','Chuỗi thức ăn: sinh vật sản xuất → tiêu thụ bậc 1 → bậc 2 → phân giải. Dòng năng lượng giảm dần qua các bậc dinh dưỡng.','Bảo vệ môi trường: giảm rác thải, bảo vệ rừng, bảo tồn đa dạng sinh học.'],
  formulas:['Cỏ → châu chấu → ếch → rắn'],
  questions:[
    {q:'Trong chuỗi cỏ → châu chấu → ếch → rắn, sinh vật sản xuất là gì?',o:['Cỏ','Châu chấu','Ếch','Rắn'],w:'Cỏ tự tổng hợp chất hữu cơ.'},
    {q:'Tập hợp các cá thể cùng loài sống trong một khu vực gọi là gì?',o:['Quần thể','Quần xã','Hệ sinh thái','Sinh quyển'],w:'Đó là quần thể.'},
    {q:'Hệ sinh thái gồm những thành phần nào?',o:['Quần xã và môi trường sống','Chỉ động vật','Chỉ thực vật','Chỉ sinh vật phân giải'],w:'Hệ sinh thái = quần xã + sinh cảnh.'}]}
);
