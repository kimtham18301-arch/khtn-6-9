window.KHTN = window.KHTN || [];
KHTN.push(
{ id:'l9-nang-luong-co', grade:9, subj:'ly', title:'Năng lượng cơ học, công & công suất', prereq:['l6-nang-luong','l7-toc-do'],
  theory:['Động năng Wđ = ½·m·v² (J). Thế năng trọng trường Wt = 10·m·h (J) (g ≈ 10 m/s²). Cơ năng W = Wđ + Wt.','Khi chỉ có trọng lực, cơ năng bảo toàn: vật rơi → thế năng giảm, động năng tăng.','Công cơ học A = F·s (J) khi lực cùng phương chuyển dời. Công suất P = A / t (W); 1 kW = 1000 W.'],
  formulas:[
    'Động năng của vật chuyển động: W_đ = \\frac{1}{2} · m · v² || Trong đó: W_đ là động năng (J); m là khối lượng vật (kg); v là tốc độ của vật (m/s).',
    'Thế năng trọng trường: W_t = P · h ≈ 10 · m · h || Trong đó: W_t là thế năng (J); m là khối lượng vật (kg); h là độ cao so với mốc thế năng (m). Cơ năng W = W_đ + W_t.',
    'Công cơ học: A = F · s || Trong đó: A là công cơ học (J); F là lực tác dụng cùng hướng chuyển động (N); s là quãng đường dịch chuyển (m).',
    'Công suất (tốc độ sinh công): P = \\frac{A}{t} || Trong đó: P là công suất (W – Oát; 1 kW = 1000 W); A là công thực hiện (J); t là thời gian thực hiện công (s).'
  ],
  questions:[
    {q:'Vật 2 kg chuyển động với tốc độ 3 m/s. Động năng là bao nhiêu J?',n:9,t:0,u:'J',w:'½·2·3² = 9.'},
    {q:'Vật 2 kg ở độ cao 5 m. Thế năng (g = 10 m/s²) là bao nhiêu J?',n:100,t:0,u:'J',w:'10·2·5 = 100.'},
    {q:'Lực 50 N làm vật dịch chuyển 4 m cùng hướng lực, trong 20 s. Công suất là bao nhiêu W?',n:10,t:0,u:'W',w:'A = 200 J; P = 200/20 = 10 W.'}]},

{ id:'l9-anh-sang', grade:9, subj:'ly', title:'Khúc xạ ánh sáng & thấu kính', prereq:['l7-anh-sang'],
  theory:['Khúc xạ: tia sáng truyền xiên góc qua mặt phân cách hai môi trường trong suốt bị đổi hướng. Từ không khí vào nước: góc khúc xạ nhỏ hơn góc tới.','Phản xạ toàn phần: ánh sáng đi từ môi trường chiết quang hơn sang kém hơn, góc tới lớn hơn góc tới hạn; ứng dụng sợi quang.','Thấu kính hội tụ (giữa dày hơn rìa): vật ngoài tiêu cự → ảnh thật, ngược chiều; vật trong tiêu cự → ảnh ảo, cùng chiều, lớn hơn (kính lúp).','Ánh sáng trắng qua lăng kính bị tán sắc thành dải nhiều màu.'],
  formulas:[
    'Khúc xạ ánh sáng từ không khí vào nước/thủy tinh: r < i || Trong đó: i là góc tới (hợp bởi tia tới và pháp tuyến); r là góc khúc xạ (hợp bởi tia khúc xạ và pháp tuyến). Khi truyền ngược từ nước ra không khí thì r > i.',
    'Điều kiện tạo ảnh qua kính lúp (thấu kính hội tụ tiêu cự ngắn): d < f || Trong đó: d là khoảng cách từ vật đến kính, f là tiêu cự kính; cho ảnh ảo cùng chiều và lớn hơn vật để quan sát vật nhỏ.'
  ],
  questions:[
    {q:'Tia sáng từ không khí chiếu xiên góc vào nước thì góc khúc xạ so với góc tới như thế nào?',o:['Nhỏ hơn','Lớn hơn','Bằng nhau','Luôn bằng 0'],w:'Nước chiết quang hơn nên tia lại gần pháp tuyến.'},
    {q:'Kính lúp là thấu kính nào và vật đặt ở đâu?',o:['Hội tụ; trong khoảng tiêu cự','Phân kì; ngoài tiêu cự','Hội tụ; xa gấp đôi tiêu cự','Phân kì; trong tiêu cự'],w:'Ảnh ảo, cùng chiều, lớn hơn vật.'},
    {q:'Ứng dụng của phản xạ toàn phần là gì?',o:['Sợi quang truyền tín hiệu','Gương phẳng','Máy biến áp','Nam châm điện'],w:'Ánh sáng bị giam trong lõi sợi quang.'}]},

{ id:'l9-dien-ohm', grade:9, subj:'ly', title:'Điện trở & định luật Ohm', prereq:['l8-dien'],
  theory:['Định luật Ohm: I = U / R (R: điện trở, Ω).','Mạch nối tiếp: I bằng nhau, Rtđ = R₁ + R₂. Mạch song song: U bằng nhau, 1/Rtđ = 1/R₁ + 1/R₂.','Điện trở dây dẫn: R = ρ·l / S – tăng theo chiều dài, giảm theo tiết diện.'],
  formulas:[
    'Định luật Ohm: I = \\frac{U}{R}  ⇒  U = I · R  ;  R = \\frac{U}{I} || Trong đó: I là cường độ dòng điện (A); U là hiệu điện thế hai đầu dây dẫn (V); R là điện trở dây dẫn (Ω – Ôm).',
    'Điện trở tương đương mạch nối tiếp: R_nt = R₁ + R₂ || Trong đó: R₁, R₂ là các điện trở thành phần (Ω); mắc nối tiếp làm điện trở tương đương tăng lên.',
    'Điện trở tương đương hai điện trở song song: R_ss = \\frac{R₁ · R₂}{R₁ + R₂} || Trong đó: R_ss luôn nhỏ hơn từng điện trở thành phần R₁, R₂ (Ω), suy ra từ hệ thức \\frac{1}{R_ss} = \\frac{1}{R₁} + \\frac{1}{R₂}.',
    'Điện trở dây dẫn theo kích thước và vật liệu: R = \\frac{ρ · l}{S} || Trong đó: R là điện trở (Ω); ρ là điện trở suất của chất làm dây (Ω·m); l là chiều dài dây (m); S là tiết diện ngang của dây (m²).'
  ],
  questions:[
    {q:'U = 12 V, R = 4 Ω. Cường độ dòng điện là bao nhiêu A?',n:3,t:0,u:'A',w:'12 / 4 = 3.'},
    {q:'Hai điện trở 6 Ω và 3 Ω mắc song song. Điện trở tương đương là bao nhiêu Ω?',n:2,t:0,u:'Ω',w:'6·3/9 = 2.'},
    {q:'Chiều dài dây dẫn tăng gấp đôi (cùng chất, cùng tiết diện) thì điện trở?',o:['Tăng gấp đôi','Giảm một nửa','Không đổi','Tăng gấp bốn'],w:'R tỉ lệ thuận với l.'}]},

{ id:'l9-nang-luong-dien', grade:9, subj:'ly', title:'Công suất điện & điện năng', prereq:['l9-dien-ohm','l9-nang-luong-co'],
  theory:['Công suất điện P = U·I (W) = I²·R = U²/R.','Điện năng A = P·t. Đơn vị kW·h: 1 kW·h = 3,6·10⁶ J.','Tiết kiệm điện: dùng đèn LED, tắt thiết bị khi không dùng.'],
  formulas:[
    'Công suất điện tiêu thụ: P = U · I = I² · R = \\frac{U²}{R} || Trong đó: P là công suất điện (W); U là hiệu điện thế (V); I là cường độ dòng điện (A); R là điện trở thiết bị (Ω).',
    'Điện năng tiêu thụ của đoạn mạch: A = P · t = U · I · t || Trong đó: P tính bằng W và t bằng giây (s) thì A ra Jun (J); nếu P tính bằng kW và t bằng giờ (h) thì A ra số điện (kW·h).',
    'Quy đổi đơn vị điện năng (1 số điện): 1 kW·h = 3 600 000 J || Ý nghĩa: 1 số điện trên công tơ gia đình tương ứng công suất 1 kW hoạt động liên tục trong 1 giờ.'
  ],
  questions:[
    {q:'Đèn dùng ở 220 V, dòng 0,5 A. Công suất là bao nhiêu W?',n:110,t:0,u:'W',w:'220 × 0,5 = 110.'},
    {q:'Bếp 1000 W dùng 3 giờ tiêu thụ bao nhiêu kW·h?',n:3,t:0,u:'kW·h',w:'1 kW × 3 h = 3 kW·h.'},
    {q:'Giả sử 1 kW·h giá 2000 đồng. Dùng 3 kW·h phải trả bao nhiêu đồng?',n:6000,t:0,u:'đồng',w:'3 × 2000 = 6000.'}]},

{ id:'l9-cam-ung', grade:9, subj:'ly', title:'Cảm ứng điện từ & dòng điện xoay chiều', prereq:['l7-tu','l8-dien'],
  theory:['Khi từ thông qua cuộn dây kín biến thiên → xuất hiện dòng điện cảm ứng.','Dòng điện xoay chiều liên tục đổi chiều (điện lưới Việt Nam 220 V, 50 Hz).','Máy biến áp: U₁/U₂ = N₁/N₂. Truyền tải điện đi xa dùng điện áp cao để giảm hao phí.'],
  formulas:[
    'Hệ thức máy biến áp lí tưởng: \\frac{U₁}{U₂} = \\frac{N₁}{N₂} || Trong đó: U₁, U₂ là hiệu điện thế hiệu dụng cuộn sơ cấp và thứ cấp (V); N₁, N₂ là số vòng dây cuộn sơ cấp và thứ cấp (N₂ > N₁ là máy tăng áp; N₂ < N₁ là máy hạ áp).'
  ],
  questions:[
    {q:'Điều kiện xuất hiện dòng điện cảm ứng trong cuộn dây kín là gì?',o:['Từ thông qua cuộn dây biến thiên','Có nam châm đặt cạnh','Cuộn dây đứng yên','Có lõi sắt'],w:'Phải có sự biến thiên từ thông.'},
    {q:'Máy biến áp có N₁ = 1000 vòng, N₂ = 50 vòng, U₁ = 220 V. U₂ là bao nhiêu V?',n:11,t:0,u:'V',w:'U₂ = 220·50/1000 = 11.'},
    {q:'Vì sao truyền tải điện đi xa phải dùng điện áp cao?',o:['Để giảm hao phí điện năng','Để tăng dòng điện','Để đèn sáng hơn','Để tăng điện trở'],w:'Điện áp cao → dòng nhỏ → hao phí I²R nhỏ.'}]},

{ id:'l9-kim-loai', grade:9, subj:'hoa', title:'Kim loại & dãy hoạt động hóa học', prereq:['l8-acid-base'],
  theory:['Tính chất vật lí: dẫn điện, dẫn nhiệt, ánh kim, dẻo. Hóa học: tác dụng phi kim, acid, dung dịch muối.','Dãy hoạt động: K, Na, Ca, Mg, Al, Zn, Fe, Pb, (H), Cu, Ag, Au. Kim loại đứng trước H đẩy được H₂ khỏi acid loãng; kim loại mạnh hơn đẩy kim loại yếu hơn khỏi muối.','Gang: Fe + 2–5% C; thép: Fe + dưới 2% C. Ăn mòn kim loại: sơn, mạ, bôi dầu mỡ để bảo vệ.'],
  formulas:[
    'Kim loại mạnh đẩy kim loại yếu ra khỏi dung dịch muối: Fe + CuSO₄ → FeSO₄ + Cu↓ || Ý nghĩa: Sắt (Fe) đứng trước Đồng (Cu) trong dãy hoạt động nên đẩy Cu đỏ bám lên đinh sắt.',
    'Kim loại đứng trước H tác dụng với acid loãng: Fe + 2HCl → FeCl₂ + H₂↑ || Lưu ý: Fe tác dụng với HCl hoặc H₂SO₄ loãng chỉ tạo muối sắt(II).'
  ],
  questions:[
    {q:'Kim loại nào đẩy được đồng ra khỏi dung dịch CuSO₄?',o:['Fe','Ag','Au','Cu'],w:'Fe hoạt động mạnh hơn Cu.'},
    {q:'Kim loại nào KHÔNG tác dụng với dung dịch HCl loãng?',o:['Cu','Zn','Mg','Fe'],w:'Cu đứng sau H.'},
    {q:'Cho 11,2 g Fe (Fe = 56) tác dụng HCl dư. Thể tích H₂ (25 °C, 1 bar) là bao nhiêu lít? (làm tròn 2 chữ số thập phân)',n:4.96,t:0.03,u:'L',w:'n(Fe) = 0,2 mol → n(H₂) = 0,2 mol → 4,958 L.'}]},

{ id:'l9-phi-kim', grade:9, subj:'hoa', title:'Phi kim: carbon, chlorine & hợp chất', prereq:['l9-kim-loai'],
  theory:['Carbon có các dạng thù hình: kim cương, than chì, than hoạt tính. CO₂ làm đục nước vôi trong: CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O.','Chlorine (Cl₂) là chất khí độc, màu vàng lục; tác dụng với kim loại: 2Fe + 3Cl₂ → 2FeCl₃.','Silicon và hợp chất (cát, thủy tinh, xi măng) có nhiều ứng dụng.'],
  formulas:['CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O','2Fe + 3Cl₂ → 2FeCl₃'],
  questions:[
    {q:'Dùng chất nào để nhận biết khí CO₂?',o:['Nước vôi trong','Quỳ tím khô','Dung dịch NaCl','Que đóm còn tàn đỏ'],w:'Làm đục nước vôi trong do tạo CaCO₃.'},
    {q:'Kim cương và than chì là gì của nhau?',o:['Các dạng thù hình của carbon','Hai hợp chất khác nhau','Hỗn hợp','Hai đồng vị'],w:'Cùng là carbon với cấu trúc khác nhau.'},
    {q:'Sản phẩm khi đốt sắt trong khí Cl₂ là gì?',o:['FeCl₃','FeCl₂','FeO','Fe₂O₃'],w:'Cl₂ oxi hóa Fe lên hóa trị III.'}]},

{ id:'l9-huu-co', grade:9, subj:'hoa', title:'Hydrocarbon, ethylic alcohol & acetic acid', prereq:['l9-phi-kim'],
  theory:['Hợp chất hữu cơ là hợp chất của carbon (trừ CO, CO₂, muối carbonate…).','Methane CH₄ (khí bùn ao, khí thiên nhiên) cháy: CH₄ + 2O₂ → CO₂ + 2H₂O. Ethylene C₂H₄ có liên kết đôi, làm mất màu dung dịch bromine.','Ethylic alcohol C₂H₅OH (cồn) tan vô hạn trong nước, cháy tỏa nhiệt. Acetic acid CH₃COOH (giấm ăn) làm quỳ tím hóa đỏ nhẹ.'],
  formulas:['CH₄ + 2O₂ → CO₂ + 2H₂O','C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O'],
  questions:[
    {q:'Chất nào làm mất màu dung dịch bromine?',o:['C₂H₄ (ethylene)','CH₄ (methane)','C₂H₅OH','CH₃COOH'],w:'Ethylene có liên kết đôi C=C.'},
    {q:'Đốt cháy 1 mol CH₄ tạo ra mấy mol CO₂?',n:1,t:0,u:'mol',w:'Tỉ lệ 1 : 1.'},
    {q:'Dung dịch acetic acid làm quỳ tím chuyển màu gì?',o:['Đỏ','Xanh','Vàng','Không đổi'],w:'Có tính acid yếu.'}]},

{ id:'l9-lipid-carb', grade:9, subj:'hoa', title:'Lipid, carbohydrate, protein & polymer', prereq:['l9-huu-co'],
  theory:['Lipid (chất béo) thủy phân trong môi trường kiềm tạo glycerol và muối của acid béo (xà phòng).','Carbohydrate gồm glucose C₆H₁₂O₆, saccharose, tinh bột, cellulose. Glucose lên men tạo ethanol; phản ứng tráng bạc.','Protein bị đông tụ khi đun nóng; thủy phân tạo amino acid.','Polymer: PE (polyethylene) được trùng hợp từ ethylene; PVC, nhựa, cao su, tơ.'],
  formulas:['C₆H₁₂O₆ —(men)→ 2C₂H₅OH + 2CO₂','n CH₂=CH₂ → (–CH₂–CH₂–)ₙ'],
  questions:[
    {q:'Xà phòng được tạo từ phản ứng nào?',o:['Thủy phân chất béo trong kiềm','Đốt cháy chất béo','Cô cạn nước biển','Lên men giấm'],w:'Đây là phản ứng xà phòng hóa.'},
    {q:'Polyethylene (PE) được tạo từ monome nào?',o:['Ethylene','Methane','Glucose','Acetic acid'],w:'Trùng hợp ethylene.'},
    {q:'Khi đun nóng, lòng trắng trứng đông lại. Hiện tượng này là của chất nào?',o:['Protein','Lipid','Tinh bột','Cellulose'],w:'Protein bị biến tính, đông tụ.'}]},

{ id:'l9-di-truyen', grade:9, subj:'sinh', title:'Di truyền: gene, DNA, NST & quy luật Mendel', prereq:['l6-te-bao','l7-cam-ung-sinh-san'],
  theory:['DNA là vật chất di truyền; gene là đoạn DNA mang thông tin quy định tính trạng. Gene nằm trên nhiễm sắc thể (NST).','Người có bộ NST 2n = 46; giao tử (n) có 23 NST.','Mendel: lai Aa × Aa → kiểu gene 1 AA : 2 Aa : 1 aa; kiểu hình 3 trội : 1 lặn.','Đột biến là biến đổi trong vật chất di truyền; có thể có lợi, có hại hoặc trung tính.'],
  formulas:[
    'Phép lai 1 cặp tính trạng trội hoàn toàn (Mendel): Aa × Aa → 1AA : 2Aa : 1aa || Ý nghĩa: Tỉ lệ kiểu gene đời con là 1 : 2 : 1; tỉ lệ kiểu hình là 3 trội (AA, Aa) : 1 lặn (aa).',
    'Bộ nhiễm sắc thể (NST) ở người: 2n = 46  ⇒  n = 23 || Trong đó: 2n là bộ NST lưỡng bội trong tế bào sinh dưỡng (23 cặp); n là bộ NST đơn bội trong giao tử (trứng hoặc tinh trùng).'
  ],
  questions:[
    {q:'Phép lai Aa × Aa (A trội hoàn toàn) cho tỉ lệ kiểu hình thế nào?',o:['3 trội : 1 lặn','1 trội : 1 lặn','Toàn trội','Toàn lặn'],w:'Aa × Aa → 3 : 1.'},
    {q:'Tinh trùng của người có bao nhiêu NST?',n:23,t:0,u:'NST',w:'n = 46 : 2 = 23.'},
    {q:'Gene là gì?',o:['Một đoạn DNA mang thông tin quy định tính trạng','Một loại protein','Một loại đường','Một tế bào'],w:'Gene là đơn vị thông tin di truyền.'}]},

{ id:'l9-tien-hoa', grade:9, subj:'sinh', title:'Tiến hóa & chọn lọc tự nhiên', prereq:['l9-di-truyen'],
  theory:['Chọn lọc tự nhiên giữ lại các cá thể thích nghi hơn, làm tăng tần số đặc điểm có lợi qua các thế hệ.','Bằng chứng tiến hóa: hóa thạch, cơ quan tương đồng (chi trước thú, cánh chim, tay người), giải phẫu so sánh, sinh học phân tử.','Biến dị di truyền là nguyên liệu cho tiến hóa.'],
  formulas:['Biến dị + chọn lọc tự nhiên → thích nghi'],
  questions:[
    {q:'Chọn lọc tự nhiên là gì?',o:['Giữ lại cá thể thích nghi, đào thải cá thể kém thích nghi','Con người chọn giống','Tạo đột biến chủ ý','Tăng kích thước quần thể'],w:'Đó là chọn lọc tự nhiên.'},
    {q:'Cơ quan tương đồng là bằng chứng nào?',o:['Giải phẫu so sánh','Hóa thạch','Tế bào học','Địa lí'],w:'Cùng nguồn gốc, khác chức năng.'},
    {q:'Nguyên liệu của tiến hóa là gì?',o:['Biến dị di truyền','Thức ăn','Ánh sáng','Nước'],w:'Biến dị cung cấp sự đa dạng.'}]},

{ id:'l9-tai-nguyen', grade:9, subj:'td', title:'Tài nguyên, năng lượng & môi trường', prereq:['l6-nang-luong','l6-oxy-kk'],
  theory:['Nguyên tố nhiều nhất trong vỏ Trái Đất: oxygen, rồi silicon.','Nhiên liệu hóa thạch: than đá, dầu mỏ, khí tự nhiên; không tái tạo, khi đốt thải CO₂.','CO₂ là khí nhà kính chính gây nóng lên toàn cầu. Giảm bằng năng lượng tái tạo (gió, mặt trời, thủy điện), tiết kiệm năng lượng, trồng rừng.'],
  formulas:['Đốt nhiên liệu hóa thạch → CO₂ → hiệu ứng nhà kính'],
  questions:[
    {q:'Khí nào là khí nhà kính chủ yếu gây nóng lên toàn cầu do hoạt động của con người?',o:['CO₂','N₂','O₂','Ar'],w:'CO₂ thải ra khi đốt nhiên liệu hóa thạch.'},
    {q:'Nguồn nào KHÔNG phải năng lượng tái tạo?',o:['Than đá','Gió','Mặt trời','Thủy điện'],w:'Than đá là nhiên liệu hóa thạch.'},
    {q:'Nguyên tố nào chiếm nhiều nhất trong vỏ Trái Đất?',o:['Oxygen','Sắt','Carbon','Hydrogen'],w:'Oxygen khoảng 46% khối lượng vỏ Trái Đất.'}]}
);
