/* ============================================================
 * Pizza Demo — i18n « language selector » (EN / AR)
 * ------------------------------------------------------------
 * English is the source language of the site (FR removed by
 * design). This dictionary translates EN → AR :
 *   - every DOM text node (TreeWalker) ;
 *   - placeholder / title / aria-label attributes ;
 *   - the document <title> ;
 *   - strings composed by the JS (via window.pdT).
 * A MutationObserver (batched with rAF) re-translates any node
 * added/updated afterwards (cart, menu, live /api/content sync).
 * Admin content strings missing from the dictionary stay as-is
 * (source language). Arabic switches the page to RTL (dir=rtl
 * + CSS adjustments).
 * To add a language: extend DICT + SUPPORTED below, then add a
 * .lang-btn button in index.html.
 * ============================================================ */
(function(){
'use strict';
var LS='pd_lang';
var SRC='en';                    /* source language (identity, no dict) */
var SUPPORTED={en:1,ar:1};
var ATTRS=['placeholder','title','aria-label'];

var DICT={
ar:{

 "Veggie mode on — only vegetable pizzas":"وضع الخضار مفعّل — بيتزا خضراء فقط",
 "Veggie mode off":"وضع الخضار متوقف",
 "Your cart is empty — add a pizza first!":"سلتك فارغة — أضف بيتزا أولاً!",
 "Just now":"الآن",
 "to":"إلى",
 "The best":"أفضل بيتزا في طرابلس؟",
 "Pizza Demo — Italian Pizzeria in Tripoli | Wood-Fired":"بيتزا ديمو — مطبخ بيتزا إيطالي في طرابلس | فرن حطب",
 "Home":"الرئيسية",
 "Menu":"المنيو",
 "Builder":"صنع بيتزتك",
 "Deals":"العروض",
 "Gallery":"المعرض",
 "Reviews":"الآراء",
 "Contact":"اتصل بنا",
 "Book a table":"حجز طاولة",
 "Order":"اطلب",
 "Language":"اللغة",
 "THE REAL":"البيتزا",
 "ITALIAN PIZZA":"الإيطالية الأسطورية",
 "IN THE HEART OF":"في قلب",
 "TRIPOLI":"طرابلس",
 "Tripoli":"طرابلس",
 "View the Menu":"شاهد المنيو",
 "Build My Pizza":"اصنع بيتزتك",
 "Authentic since 2012 • Tripoli":"أصيلة منذ 2012 • طرابلس",
 "2,400+ verified reviews in Tripoli":"أكثر من 2,400 تقييم موثّق في طرابلس",
 "OPEN • until midnight":"مفتوح • حتى منتصف الليل",
 "FERMENTATION":"تخمير",
 "WOOD OVEN":"فرن الحطب",
 "DELIVERY":"توصيل",
 "FROM":"ابتداءً من",
 "Express delivery":"توصيل خاطف",
 "100% Halal!":"حلال 100%",
 "Italian Caputo flour":"دقيق إيطالي كابوتو",
 "Fresh & Halal produce":"منتجات طازجة وحلال",
 "Neapolitan Chef Enzo":"الشيف النابوليتاني إينزو",
 "Cash • Card • Mobile":"نقدًا • بطاقة • موبايل",
 "Mamma mia! 🤌":"ماميا! 🤌",
 "48H DOUGH":"عجين 48 ساعة",
 "TRIPOLI DELIVERY":"توصيل طرابلس",
 "HOMEMADE TIRAMISU":"تيراميسو بيتي",
 "MUST-TRIES":"لا تُفوَّت",
 "Best-sellers":"الأكثر مبيعًا",
 "that make Tripoli dance!":"التي تُرقص طرابلس!",
 "OUR MENU • antipasti • pizze • dolci":"منيومنا • مقبلات • بيتزا • حلويات",
 "A festival of":"احتفال بـ",
 "Italian flavors":"النكهات الإيطالية",
 "All":"الكل",
 "Veggie":"خضاري",
 "Most popular":"الأكثر رواجًا",
 "Price: low to high":"السعر: من الأقل",
 "Price: high to low":"السعر: من الأعلى",
 "Search a pizza, a dessert... (e.g. burrata, diavola)":"ابحث عن بيتزا أو حلوى... (مثال: بوراتا، ديافولا)",
 "Mamma mia, nothing found!":"ماميا، لم نجد شيئًا!",
 "Try another word or build your own pizza.":"جرّب كلمة أخرى أو اصنع بيتزتك الخاصة.",
 "orders • Tripoli":"طلب • طرابلس",
 "Add":"أضف",
 "Classics":"كلاسيكيات",
 "Specialties":"مميزاتنا",
 "Calzone":"كالزوني",
 "Desserts & Drinks":"حلويات ومشروبات",
 "Best-seller":"الأكثر مبيعًا",
 "Chef choice":"اختيار الشيف",
 "Homemade":"صناعة بيتية",
 "San Marzano, fior di latte, fresh basil, EVO olive oil.":"طماطم سان مارزانو، فيور دي لاتيه، ريحان طازج، زيت زيتون بكر ممتاز.",
 "Spicy halal pepperoni, mozzarella, hot honey, oregano.":"بيبروني حلال حار، موزاريلا، عسل حار، زعتر.",
 "Sicilian anchovies, capers, Taggiasche olives, tomato.":"أنشوفة صقلية، كبّار، زيتون تاجياسكي، طماطم.",
 "Halal ham, mushrooms, artichokes, olives, egg.":"لحم مدخّن حلال، فطر، أرضي شوكي، زيتون، بيض.",
 "Mozzarella, gorgonzola, 24-month parmesan, smoked ricotta.":"موزاريلا، غورغونزولا، بارميجانو 24 شهرًا، ريكوتا مدخّنة.",
 "Local spiced meat, creamy burrata, arugula, cherry tomatoes, secret Demo sauce.":"لحم محلي متبّل، بوراتا كريمية، جرجير، طماطم كرزية، صلصة ديمو السرّية.",
 "Black truffle cream, Puglia burrata, arugula, parmesan.":"كريمة الكمأة السوداء، بوراتا بولية، جرجير، بارميجانو.",
 "Shrimp, squid, mussels from the Libyan coast, garlic, parsley.":"روبيان، كاليماري، بلح من ساحل ليبيا، ثوم، بقدونس.",
 "Tri-color peppers, grilled zucchini, mushrooms, pesto.":"فلفل ملوّن، كوسا مشوي، فطر، بيستو.",
 "Golden turnover, ricotta, spinach, mozzarella, tomato sauce on the side.":"فطيرة ذهبية، ريكوتا، سبانخ، موزاريلا، صلصة طماطم جانبية.",
 "Pepperoni, smoked scamorza, caramelized onions, BBQ sauce.":"بيبروني، سكامورزا مدخّنة، بصل مكرمل، صلصة باربكيو.",
 "Mascarpone, arabica coffee, bitter cocoa — Nonna's recipe.":"ماسكاربوني، قهوة أرابيكا، كاكاو مرّ — وصفة الجدة.",
 "Bourbon vanilla, red fruit coulis, mint.":"فانيليا بوربون، صوص التوت الأحمر، نعناع.",
 "Crispy shells, sweet ricotta, pistachios, chocolate.":"عجين مقرمش، ريكوتا حلوة، فستق، شوكولاتة.",
 "Italian lemonade — Limone / Aranciata / Chinotto.":"ليمونادة إيطالية — ليمون / برتقال / تشينوتو.",
 "Avocado, fresh milk, honey, almonds — Tripoli's favorite.":"أفوكادو، حليب طازج، عسل، لوز — المفضلة في طرابلس.",
 "Fresh mint, lime, crushed ice, soda.":"نعناع طازج، ليمون أخضر، ثلج مجروش، صودا.",
 "2 large pizzas of your choice + 4 drinks + family tiramisu.":"بيتزتان كبيرتان على اختيارك + 4 مشروبات + تيراميسو عائلي.",
 "PIZZA STUDIO • 100% CUSTOM":"استوديو البيتزا • تخصيص 100%",
 "Become the":"كن",
 "Pizzaiolo!":"بيتزايولو!",
 "Build your pizza, watch it come together live, and add it to your cart.":"ركّب بيتزتك، شاهدها تُبنى مباشرةً، وأضفها إلى السلة.",
 "Size":"الحجم",
 "Dough":"العجين",
 "Sauce":"الصلصة",
 "Cheeses & Toppings":"الأجبان والإضافات",
 "(multi-select)":"(اختيار متعدد)",
 "Your creation, live...":"إبداعك مباشرةً...",
 "Extras":"الإضافات",
 "Est. calories":"سعرات تقريبية",
 "TOTAL PRICE":"السعر الإجمالي",
 "Name your pizza (e.g. Tripoli Inferno)":"سمِّ بيتزتك (مثال: جحيم طرابلس)",
 "Add to cart":"أضف إلى السلة",
 "Surprise me!":"فاجئني!",
 "Chef Enzo's tip":"حيلة الشيف إينزو",
 "Burrata + arugula + cherry tomatoes = the Tripoli favorite. Try the cheese-stuffed crust — it's heavenly!":"بوراتا + جرجير + طماطم كرزية = التشكيلة المفضلة في طرابلس. جرّب العجين المحشو بالجبن — تحفة!",
 "Add some toppings...":"أضف بعض الإضافات...",
 "Demo Creation Pizza":"بيتزا إبداع ديمو",
 "Small 26cm":"صغيرة 26سم",
 "Medium 32cm":"متوسطة 32سم",
 "Large 40cm":"كبيرة 40سم",
 "XXL 50cm":"XXL 50سم",
 "Classic":"كلاسيكي",
 "48h fermented":"متخمّر 48 ساعة",
 "Thin & Crispy":"رقيقة ومقرمشة",
 "Roman style":"على الطريقة الرومانية",
 "Thick & Soft":"سميكة وطرية",
 "Cheese-Stuffed":"محشوة بالجبن",
 "Mozzarella edges":"حواف موزاريلا",
 "San Marzano Tomato":"طماطم سان مارزانو",
 "White Cream":"بيضاء بالكريمة",
 "Basil Pesto":"بيستو الريحان",
 "Smoky BBQ":"باربكيو مدخّن",
 "Mozzarella":"موزاريلا",
 "Burrata":"بوراتا",
 "24-month Parmesan":"بارميجانو 24 شهرًا",
 "Gorgonzola":"غورغونزولا",
 "Smoked Ricotta":"ريكوتا مدخّنة",
 "Scamorza":"سكامورزا",
 "Pepperoni":"بيبروني",
 "Jalapeños":"هالبينو",
 "Mushrooms":"فطر",
 "Peppers":"فلفل",
 "Black Olives":"زيتون أسود",
 "Red Onions":"بصل أحمر",
 "Halal Ham":"لحم حلال",
 "Tuna":"تونة",
 "Shrimp":"روبيان",
 "Arugula":"جرجير",
 "Corn":"ذرة",
 "Truffle":"كمأة",
 "Keep at least one cheese!":"أبقِ جبنًا واحدًا على الأقل!",
 "Max 8 toppings, chef!":"8 إضافات كحد أقصى!",
 "Destiny has chosen for you!":"القدر اختار لك!",
 "EXPLOSIVE DEALS • Tripoli only":"عروض مدوّية • طرابلس فقط",
 "that pop!":"لا تُقاوم!",
 "FAMIGLIA WEEKEND":"نهاية أسبوع فاميليا",
 "2 LARGE PIZZAS":"بيتزتان كبيرتان",
 "+ 4 DRINKS + TIRAMISU":"+ 4 مشروبات + تيراميسو",
 "Valid Friday → Sunday • Dine-in, takeaway & delivery.":"سارية الجمعة → الأحد • محلي، سفري وتوصيل.",
 "DAYS":"أيام",
 "HOURS":"ساعات",
 "MIN":"دقيقة",
 "SEC":"ثانية",
 "Grab it!":"اغتنمها!",
 "Code: ":"الرمز: ",
 "STUDENTS -15%":"‎-15% للطلاب",
 "Show your ID, we handle the rest!":"أظهر بطاقتك الجامعية، ونحن نتكفّل بالباقي!",
 "Tripoli universities • Dine-in.":"جامعات طرابلس • محليًا.",
 "LUNCH EXPRESS 29 LYD":"غداء سريع 29 ل.د",
 "Margherita + drink in 15 min":"مارغريتا + مشروب في 15 دقيقة",
 "Mon–Thu • 12pm–3pm • Takeaway.":"الإثنين–الخميس • 12م–3م • سفري.",
 "LOYALTY":"ولاء",
 "8 pizzas = the 9th FREE":"8 بيتزا = التاسعة مجانًا",
 "Stamp card at the till & online.":"بطاقة أختام في الصندوق وعبر الإنترنت.",
 "WHEEL OF FORTUNA":"عجلة الحظ",
 "Spin & win up to -20%!":"أدر العجلة واربح حتى -20%!",
 "SPIN THE WHEEL":"أدر العجلة",
 "1 spin per visit • Prize applies at checkout":"دورة واحدة لكل زيارة • الجائزة تُطبّق عند الطلب",
 "WON: ":"ربحت: ",
 " — code ":" — رمز ",
 " applied!":" مُفعّل!",
 "gift":"هدية",
 "well done":"أحسنت",
 " FREE added to your cart!":" مجانًا أُضيف إلى السلة!",
 "Delivery":"التوصيل",
 "Drink":"مشروب",
 "-10% applied!":"تم تطبيق خصم 10%!",
 "Pack Famiglia: -15 LYD!":"باقة فاميليا: ‎-15 ل.د!",
 "Welcome! 15% off":"أهلًا بك! خصم 15%",
 "Wheel jackpot: -20%!":"جائزة العجلة: ‎-20%!",
 "Wheel: -10%!":"العجلة: ‎-10%!",
 "Free delivery!":"توصيل مجاني!",
 "✓ -10% applied!":"✓ تم تطبيق خصم 10%!",
 "✓ Pack Famiglia: -15 LYD!":"✓ باقة فاميليا: ‎-15 ل.د!",
 "✓ Welcome! 15% off":"✓ أهلًا بك! خصم 15%",
 "✓ Wheel jackpot: -20%!":"✓ جائزة العجلة: ‎-20%!",
 "✓ Wheel: -10%!":"✓ العجلة: ‎-10%!",
 "✓ Free delivery!":"✓ توصيل مجاني!",
 "✕ Invalid code. Try DEMO10":"✕ رمز غير صالح. جرّب DEMO10",
 "Promo code (e.g. DEMO10)":"رمز الخصم (مثال: DEMO10)",
 "You already spun! Come back tomorrow.":"لقد درت من قبل! عُد غدًا.",
 "GALLERY • dal forno":"المعرض • من الفرن",
 "It smells great from here":"رائحة تصل إلى هنا",
 "buonissimo!":"شهي جدًا!",
 "Our wood oven":"فرن الحطب لدينا",
 "Diavola signature":"ديافولا التوقيع",
 "In the kitchen":"في المطبخ",
 "Slice of happiness":"شريحة سعادة",
 "The Famiglia dining room":"قاعة فاميليا",
 "Homemade dolci":"حلويات بيتية",
 "Evening terrace":"تراس المساء",
 "@pizzademo.tripoli • 48k followers":"@pizzademo.tripoli • 48k متابع",
 "THEY LOVE US • 4.9/5":"يعشقوننا • 4.9/5",
 "tells it better than we do":"تتحدث عنا أفضل منا",
 "Leave your review!":"اترك رأيك!",
 "Your feedback helps the famiglia grow.":"رأيك يُنمّي العائلة.",
 "Your first name (e.g. Sara from Tajoura)":"اسمك (مثال: سارة من تاجوراء)",
 "Tell us about your experience...":"حدّثنا عن تجربتك...",
 "Post my review":"انشر رأيي",
 "✓ Verified visit":"✓ زيارة موثّقة",
 "Just now":"الآن",
 "Add your name and a few words":"أضف اسمك وبضع كلمات",
 "Thanks! Your review is published.":"شكرًا! تم نشر رأيك.",
 "The best pizza in Tripoli, period! The Demo Special with burrata... I thought I was in Naples. Delivered in 22 minutes flat.":"أفضل بيتزا في طرابلس بلا جدال! الديمو سبيشيال مع البوراتا... ظننت نفسي في نابولي. التوصيل في 22 دقيقة بالضبط.",
 "Gorgeous setting, perfect terrace for families. The pizza builder is great — my kids loved making theirs. Incredible tiramisu.":"مكان رائع وتراس مثالي للعائلة. صانع البيتزا عبقري، أحب أطفالي تركيب بيتزتهم. التيراميسو خرافي.",
 "Huge, loaded calzone, thin crust the way I like it. Fast service even on a Friday night. The famiglia pack is recommended.":"كالزوني ضخمة وغنية، عجين رفيع كما أحب. خدمة سريعة حتى ليلة الجمعة. أنصح بباقة فاميليا.",
 "2 days ago":"قبل يومين",
 "5 days ago":"قبل 5 أيام",
 "1 week ago":"قبل أسبوع",
 "2 weeks ago":"قبل أسبوعين",
 "RESERVATION • stress-free":"حجز • بلا تعقيد",
 "Your table is waiting":"طاولتك تنتظرك",
 "already!":"بالفعل!",
 "Pick your table":"اختر طاولتك",
 "(green = free)":"(الأخضر = متاحة)",
 "Free":"متاحة",
 "Selected":"محددة",
 "Taken":"محجوزة",
 "Kids friendly":"مناسب للأطفال",
 "120 seats":"120 مقعدًا",
 "Terrace + dining room":"التراس والقاعة",
 "Playground":"منطقة ألعاب",
 "Live nights":"سهريات مباشرة",
 "Thu & Fri":"الخميس والجمعة",
 "Book in 30 seconds":"احجز في 30 ثانية",
 "Full name *":"الاسم الكامل *",
 "Phone * (+218...)":"الهاتف * (+218...)",
 "Time *":"الوقت *",
 "Guests *":"عدد الضيوف *",
 "1-2 people":"شخص إلى 2",
 "3-4 people":"3 إلى 4",
 "5-8 people":"5 إلى 8",
 "9+ (group / party)":"9+ (مجموعة / حفلة)",
 "Sea-view terrace":"تراس بإطلالة بحرية",
 "Family room":"قاعة عائلية",
 "Romantic corner":"زاوية رومانسية",
 "By the wood oven":"بجانب فرن الحطب",
 "Kids area":"منطقة الأطفال",
 "Special occasion? Birthday, proposal...":"مناسبة خاصة؟ عيد ميلاد، خطوبة...",
 "Confirm my reservation":"تأكيد حجزي",
 "Instant confirmation by SMS & WhatsApp • No deposit":"تأكيد فوري عبر الرسائل والواتساب • دون عربون",
 "2 ppl":"شخصان",
 "4 ppl":"4 أشخاص",
 "6 ppl":"6 أشخاص",
 "selected":"تم اختيارها",
 "Table T":"طاولة T",
 "Enter your name":"أدخل اسمك",
 "Invalid phone":"رقم هاتف غير صالح",
 "Pick a date":"اختر تاريخًا",
 "Time & guests required":"الوقت وعدد الضيوف مطلوبان",
 "Table booked":"تم حجز الطاولة",
 "Show this code at the door • Hay Al Andalus":"أظهر هذا الرمز عند المدخل • حي الأندلس",
 "FIND US • Tripoli طرابلس":"زورنا • طرابلس",
 "Steps away from":"على بعد خطوات من",
 "the sea!":"من البحر!",
 "Sidi Issa St, 200m from the corniche":"شارع سيدي عيسى، على بعد 200م من الكورنيش",
 "Tripoli, Libya":"طرابلس، ليبيا",
 "Directions →":"الاتجاهات ←",
 "Opening hours":"مواعيد العمل",
 "Mon — Thu":"الإثنين — الخميس",
 "Friday":"الجمعة",
 "Sat — Sun":"السبت — الأحد",
 "Delivery calculator":"حاسبة التوصيل",
 "— Your district —":"— اختر حيّك —",
 "Pick your district in Tripoli.":"اختر حيك في طرابلس.",
 "Pizza Demo — Tripoli on the map":"بيتزا ديمو — طرابلس على الخريطة",
 "WhatsApp direct":"واتساب مباشر",
 "Order now":"اطلب الآن",
 "— Delivery district * —":"— حي التوصيل * —",
 "Fast!":"سريع!",
 "Tripoli map":"خريطة طرابلس",
 "Tripoli's favorite Italian pizzeria since 2012. Forno a legna, amore e gioia — in every slice.":"المطبخ الإيطالي المفضل في طرابلس منذ 2012. فرن حطب، حب وفرحة — في كل شريحة.",
 "QUICK LINKS":"روابط سريعة",
 "Full menu":"المنيو الكامل",
 "Pizza builder":"صانع البيتزا",
 "Deals & Wheel":"العروض والعجلة",
 "Customer reviews":"آراء العملاء",
 "CONTACT":"تواصل",
 "Open 7/7 until midnight":"مفتوح يوميًا حتى منتصف الليل",
 "FAMIGLIA NEWSLETTER":"نشرة فاميليا",
 "-10% on your first online order.":"خصم 10% على أول طلب لك عبر الإنترنت.",
 "Invalid email":"بريد إلكتروني غير صالح",
 "✓ Welcome! Code BENVENUTO (-15%) sent.":"✓ أهلًا بك! تم إرسال رمز BENVENUTO (خصم 15%).",
 "BENVENUTO code ready in your cart!":"رمز BENVENUTO جاهز في سلتك!",
 "Payment: Cash • Local card • Sadad • Moamalat":"الدفع: نقدًا • بطاقة محلية • سداد • معاملات",
 "© 2026 Pizza Demo Tripoli • Fatto con amore in Libia 🇱🇾🇮🇹":"© 2026 بيتزا ديمو طرابلس • صُنعت بحب في ليبيا 🇱🇾🇮🇹",
 "Admin area":"لوحة الإدارة",
 "Your Cart":"سلتك",
 "X item • Tripoli delivery":"عنصر • توصيل طرابلس",
 "X items • Tripoli delivery":"عناصر • توصيل طرابلس",
 "0 items • Tripoli delivery":"0 عناصر • توصيل طرابلس",
 "Cart is empty...":"سلتك فارغة...",
 "A little Diavola to cheer you up?":"ديافولا صغيرة تُبهجك؟",
 "Browse the menu":"تصفّح المنيو",
 "Subtotal":"المجموع الفرعي",
 "Discount":"الخصم",
 "Total":"الإجمالي",
 "Order • ":"اطلب • ",
 "Delivery (":"التوصيل (",
 "(free from X LYD)":"(مجاني ابتداءً من X ل.د)",
 "(free from 80 LYD)":"(مجاني ابتداءً من 80 ل.د)",
 "+ Add more delights":"+ أضف المزيد من اللذات",
 "FREE 🎉":"مجاني 🎉",
 "added to cart!":"أُضيف إلى السلة!",
 "activated!":"تم التفعيل!",
 "Your cart is empty, add a pizza first!":"سلتك فارغة، أضف بيتزا أولًا!",
 "Complete your order":"إتمام الطلب",
 "Hot delivery in 25-40 min across Tripoli":"توصيل ساخن خلال 25-40 دقيقة في طرابلس",
 "Phone * 09X XXX XXXX":"الهاتف * 09X XXX XXXX",
 "Exact address * (street, building...)":"العنوان بالتفصيل * (شارع، مبنى...)",
 "Payment method":"طريقة الدفع",
 "Cash":"نقدًا",
 "on delivery":"عند التسليم",
 "Card":"بطاقة",
 "Mobile":"موبايل",
 "Instructions (floor, no onions, ring twice...)":"تعليمات (الطابق، بدون بصل، اقرع الجرس مرتين...)",
 "Total due":"المبلغ المستحق",
 "Confirm • ":"تأكيد • ",
 "Enter your full name":"أدخل اسمك الكامل",
 "Invalid Libyan number (e.g. 091 234 5678)":"رقم ليبي غير صالح (مثال: 091 234 5678)",
 "Pick your delivery district":"اختر حي التوصيل",
 "Add your address (street, landmark...)":"حدّد عنوانك (شارع، معلم قريب...)",
 "confirmed.":"مؤكّد.",
 "Our oven is already firing up for you.":"فرننا يشتعل من أجلك الآن.",
 "Order received":"تم استلام الطلب",
 "We're prepping your dough...":"نُحضّر عجينك...",
 "In the 450°C wood oven":"في فرن الحطب 450°م",
 "90 seconds of magic":"90 ثانية من السحر",
 "Rider on the way":"المندوب في الطريق",
 "ETA: ":"الوصول المتوقع: ",
 "ETA: 30 min":"الوصول المتوقع: 30 دقيقة",
 "Buon appetito !":"بالعافية!",
 "Tell us everything in a review":"أخبرنا كل شيء في تقييم",
 "Perfect, I'm hungry!":"ممتاز، أنا جائع!",
 "FREE DELIVERY from 80 LYD in Tripoli":"توصيل مجاني ابتداءً من 80 ل.د في طرابلس",
 "Free delivery from 80 LYD":"توصيل مجاني ابتداءً من 80 ل.د",
 "48h fermented dough, San Marzano tomatoes, fior di latte & a 450°C wood oven. Delivered hot in 25 minutes anywhere in Tripoli — from Gargaresh to Tajoura.":"عجين متخمّر 48 ساعة، طماطم سان مارزانو، فيور دي لاتيه وفرن حطب بحرارة 450°م. تصل ساخنة في 25 دقيقة إلى كل أحياء طرابلس — من غرغور إلى تاجوراء.",
 "Wood-fired in Tripoli":"من فرن الحطب في طرابلس",
 "The Neapolitan craft, in Libya.":"حرفة نابولية أصيلة، في ليبيا.",
 "From":"ابتداءً من",
 "Slow dough. Fast oven. Honest pizza.":"عجين بطيء. فرن سريع. بيتزا صادقة.",
 "48 hours of fermentation, 90 seconds at 450°C — the way it's done in Naples. And now, in Tripoli.":"48 ساعة من التخمير، 90 ثانية على حرارة 450°م — كما تُصنع في نابولي. والآن، في طرابلس.",
 "★★★★★":"★★★★★",
}
};

/* ---- key normalization (apostrophes / whitespace) ---- */
function norm(s){return String(s==null?'':s).replace(/[\u2019\u02bc\u02b9']/g,"'").replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();}
var IDX={};
for(var LL in DICT){IDX[LL]={};for(var K in DICT[LL]){IDX[LL][norm(K)]=DICT[LL][K];}}

var lang='en';try{var sv=localStorage.getItem(LS);if(sv&&SUPPORTED[sv])lang=sv;}catch(e){}
window.pdGetLang=function(){return lang;};

/* Immediate translation of a string (used by the JS for composed
   messages). In the source language : identity. */
window.pdT=function(s){
  if(lang===SRC)return s;
  var m=IDX[lang];if(!m)return s;
  var t=m[norm(s)];
  return t===undefined?s:t;
};
function lookup(s){if(lang===SRC)return undefined;var m=IDX[lang];if(!m)return undefined;var t=m[norm(s)];return t===undefined?undefined:t;}

/* ---- translate text nodes ---- */
var TXT=new WeakMap();
function skipNode(n){
  var p=n.parentElement;if(!p)return true;
  var tg=p.tagName;
  if(tg==='SCRIPT'||tg==='STYLE'||tg==='NOSCRIPT'||tg==='TEXTAREA'||tg==='TITLE')return true;
  if(p.closest('[data-no-i18n]'))return true;
  return false;
}
function translateNode(n){
  var rec=TXT.get(n),cur=n.nodeValue;
  if(cur==null||cur==='')return;
  if(lang===SRC){if(rec){if(n.nodeValue!==rec.src)n.nodeValue=rec.src;TXT.delete(n);}return;}
  var srcTxt=cur;
  if(rec){
    if(rec.lang===lang){if(rec.out===cur)return;} /* already translated */
    else srcTxt=rec.src;                            /* language switch: start from source */
  }
  var t=lookup(srcTxt);
  if(t===undefined){if(rec&&rec.out!==cur)n.nodeValue=srcTxt;TXT.delete(n);return;}
  var lead=(srcTxt.match(/^\s*/)||[''])[0],trail=(srcTxt.match(/\s*$/)||[''])[0];
  var out=lead+t+trail;
  if(out!==cur)n.nodeValue=out;
  TXT.set(n,{src:(rec&&rec.lang!==lang)?rec.src:srcTxt,out:out,lang:lang});
}

/* ---- translate attributes (placeholder / title / aria-label) ---- */
var ATTRM=new WeakMap();
function translateAttr(el){
  var rec=ATTRM.get(el);
  for(var i=0;i<ATTRS.length;i++){
    var a=ATTRS[i],cur=el.getAttribute(a);
    if(cur==null){if(rec&&rec[a]){el.setAttribute(a,rec[a].src);delete rec[a];}continue;}
    if(lang===SRC){if(rec&&rec[a]){if(cur!==rec[a].src)el.setAttribute(a,rec[a].src);delete rec[a];}continue;}
    var r=rec&&rec[a],srcTxt=cur;
    if(r){
      if(r.lang===lang){if(r.out===cur)continue;}
      else srcTxt=r.src;
    }
    var t=lookup(srcTxt);
    if(t===undefined){if(r&&r.out!==cur)el.setAttribute(a,srcTxt);continue;}
    if(t!==cur)el.setAttribute(a,t);
    if(!ATTRM.has(el))ATTRM.set(el,{});
    ATTRM.get(el)[a]={src:(r&&r.lang!==lang)?r.src:srcTxt,out:t,lang:lang};
  }
}

/* ---- full pass ---- */
var walker=null;
function walkAll(){
  if(!walker)walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return skipNode(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
  walker.currentNode=document.body;
  var n;while((n=walker.nextNode()))translateNode(n);
  var els=document.querySelectorAll('['+ATTRS.join('],[')+']');
  for(var i=0;i<els.length;i++)translateAttr(els[i]);
}

/* ---- observer: re-translate nodes added/updated (auto-render, cart…) ---- */
var scheduled=false,observing=false;
function schedule(){
  if(scheduled||!observing)return;
  scheduled=true;
  requestAnimationFrame(function(){scheduled=false;walkAll();});
}
function startObserver(){
  if(observing||!document.body)return;
  observing=true;
  new MutationObserver(schedule).observe(document.body,{
    childList:true,subtree:true,characterData:true,
    attributes:true,attributeFilter:ATTRS
  });
}

/* ---- UI : selector buttons ---- */
function updateUI(){
  var bs=document.querySelectorAll('.lang-btn');
  for(var i=0;i<bs.length;i++){
    var on=bs[i].getAttribute('data-lang')===lang;
    bs[i].classList.toggle('lg-on',on);
    bs[i].setAttribute('aria-pressed',on?'true':'false');
  }
}

/* ---- tab title ---- */
var titleOrig=null;
function updateTitle(){
  if(titleOrig==null)return;
  var t=lookup(titleOrig);
  document.title=t===undefined?titleOrig:t;
}

/* ---- global API ---- */
window.pdApplyLang=function(l){
  if(!SUPPORTED[l])return;
  lang=l;
  try{localStorage.setItem(LS,l);}catch(e){}
  var de=document.documentElement;
  de.setAttribute('lang',l);
  de.setAttribute('dir',l==='ar'?'rtl':'ltr');
  updateTitle();
  updateUI();
  walkAll();
  /* re-renders that recompose translated strings (cart, reviews) */
  if(window.refreshTotals){try{window.refreshTotals();}catch(e){}}
  if(window.renderReviews){try{window.renderReviews();}catch(e){}}
};

/* ---- boot ---- */
function init(){
  if(!document.body){setTimeout(init,50);return;}
  if(lang!==SRC){
    var de=document.documentElement;
    de.setAttribute('lang',lang);
    if(lang==='ar')de.setAttribute('dir','rtl');
  }
  titleOrig=document.title;
  updateUI();
  updateTitle();
  walkAll();
  startObserver();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
