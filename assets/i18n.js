/* ============================================================
 * Pizza Demo — i18n « sélecteur de langues » (FR / EN / AR)
 * ------------------------------------------------------------
 * Le français est la langue source du site et du contenu admin.
 * Ce dictionnaire traduit FR → EN / AR :
 *   - chaque nœud texte du DOM (marche TreeWalker) ;
 *   - les attributs placeholder / title / aria-label ;
 *   - le <title> de l'onglet ;
 *   - les chaînes composées par le JS (via window.pdT).
 * Un MutationObserver (batché en rAF) retraduit automatiquement
 * tout nœud ajouté/modifié (panier, menu, rendu auto /api/content).
 * Les chaînes personnalisées par l'admin et absentes du
 * dictionnaire restent telles quelles (langue source).
 * L'arabe passe la page en RTL (dir=rtl + ajustements CSS).
 * ============================================================ */
(function(){
'use strict';
var LS='pd_lang';
var SUPPORTED={fr:1,en:1,ar:1};
var ATTRS=['placeholder','title','aria-label'];

/* ---- Dictionnaires : clé = texte FR d'origine (espaces/apostrophes
        normalisés à l'indexation), valeur = traduction ---- */
var DICT={
en:{
 /* <title> */
 "Pizza Demo — Pizzeria Italienne à Tripoli | Forno a Legna":"Pizza Demo — Italian Pizzeria in Tripoli | Wood-Fired",
 /* nav + topbar */
 "Accueil":"Home","Créateur":"Builder","Offres":"Deals","Galerie":"Gallery","Avis":"Reviews",
 "Réserver":"Book a table","Commander":"Order","Langue":"Language",
 /* hero */
 "LA VRAIE":"THE REAL","PIZZA ITALIENNE":"ITALIAN PIZZA","AU CŒUR DE":"IN THE HEART OF",
 "Voir le Menu":"View the Menu","Créer ma Pizza":"Build My Pizza",
 "Authentique depuis 2012 • Tripoli":"Authentic since 2012 • Tripoli",
 "2 400+ avis vérifiés à Tripoli":"2,400+ verified reviews in Tripoli",
 "OUVERT • jusqu'à 00:00":"OPEN • until midnight",
 "FERMENTATION":"FERMENTATION","FOUR À BOIS":"WOOD OVEN","LIVRAISON":"DELIVERY",
 "DÈS":"FROM","Livraison éclair":"Express delivery",
 "Farine italienne Caputo":"Italian Caputo flour","Produits frais & Halal":"Fresh & Halal produce",
 "Chef Napolitain Enzo":"Neapolitan Chef Enzo","Cash • Carte • Mobile":"Cash • Card • Mobile",
 /* marquee */
 "PÂTE 48H":"48H DOUGH","LIVRAISON TRIPOLI":"TRIPOLI DELIVERY","TIRAMISU MAISON":"HOMEMADE TIRAMISU",
 /* best-sellers */
 "LES INCONTOURNABLES":"MUST-TRIES","Best-sellers":"Best-sellers","qui font danser Tripoli !":"that make Tripoli dance!",
 /* menu */
 "NOTRE MENU • antipasti • pizze • dolci":"OUR MENU • antipasti • pizze • dolci",
 "Un festival de":"A festival of","saveurs italiennes":"Italian flavors",
 "Toutes":"All","Plus populaires":"Most popular","Prix croissant":"Price: low to high","Prix décroissant":"Price: high to low",
 "Rechercher une pizza, un dessert... (ex: burrata, diavola)":"Search a pizza, a dessert... (e.g. burrata, diavola)",
 "Mamma mia, rien trouvé !":"Mamma mia, nothing found!","Essaie un autre mot ou crée ta propre pizza.":"Try another word or build your own pizza.",
 "commandes • Tripoli":"orders • Tripoli","Ajouter":"Add",
 "Classiques":"Classics","Spécialités":"Specialties","Desserts & Boissons":"Desserts & Drinks",
 /* menu items — badges & descriptions */
 "Chef choice":"Chef choice","Fait maison":"Homemade",
 "San Marzano, fior di latte, basilic frais, huile d'olive EVO.":"San Marzano, fior di latte, fresh basil, EVO olive oil.",
 "Pepperoni halal épicé, mozzarella, miel piquant, origan.":"Spicy halal pepperoni, mozzarella, hot honey, oregano.",
 "Anchois de Sicile, câpres, olives Taggiasche, tomate.":"Sicilian anchovies, capers, Taggiasche olives, tomato.",
 "Jambon halal, champignons, artichauts, olives, œuf.":"Halal ham, mushrooms, artichokes, olives, egg.",
 "Mozzarella, gorgonzola, parmesan 24 mois, ricotta fumée.":"Mozzarella, gorgonzola, 24-month parmesan, smoked ricotta.",
 "Viande épicée locale, burrata crémeuse, roquette, tomates cerises, sauce Demo secrète.":"Local spiced meat, creamy burrata, arugula, cherry tomatoes, secret Demo sauce.",
 "Crème de truffe noire, burrata di Puglia, roquette, parmesan.":"Black truffle cream, Puglia burrata, arugula, parmesan.",
 "Crevettes, calamars, moules de la côte libyenne, ail, persil.":"Shrimp, squid, mussels from the Libyan coast, garlic, parsley.",
 "Poivrons tricolores, courgettes grillées, champignons, pesto.":"Tri-color peppers, grilled zucchini, mushrooms, pesto.",
 "Chausson doré, ricotta, épinards, mozzarella, sauce tomate à part.":"Golden turnover, ricotta, spinach, mozzarella, tomato sauce on the side.",
 "Pepperoni, scamorza fumée, oignons caramélisés, sauce BBQ.":"Pepperoni, smoked scamorza, caramelized onions, BBQ sauce.",
 "Mascarpone, café arabica, cacao amer — recette de Nonna.":"Mascarpone, arabica coffee, bitter cocoa — Nonna's recipe.",
 "Vanille Bourbon, coulis de fruits rouges, menthe.":"Bourbon vanilla, red fruit coulis, mint.",
 "Coques croustillantes, ricotta sucrée, pistaches, chocolat.":"Crispy shells, sweet ricotta, pistachios, chocolate.",
 "Limonade italienne — Limone / Aranciata / Chinotto.":"Italian lemonade — Limone / Aranciata / Chinotto.",
 "Avocat, lait frais, miel, amandes — le préféré de Tripoli.":"Avocado, fresh milk, honey, almonds — Tripoli's favorite.",
 "Menthe fraîche, citron vert, glace pilée, soda.":"Fresh mint, lime, crushed ice, soda.",
 "2 grandes pizzas au choix + 4 boissons + tiramisu familial.":"2 large pizzas of your choice + 4 drinks + family tiramisu.",
 /* builder */
 "PIZZA STUDIO • 100% PERSONNALISÉ":"PIZZA STUDIO • 100% CUSTOM",
 "Deviens le":"Become the","Pizzaiolo !":"Pizzaiolo!",
 "Compose ta pizza, vois-la se construire en direct, et ajoute-la au panier.":"Build your pizza, watch it come together live, and add it to your cart.",
 "Taille":"Size","Pâte":"Dough","Sauce":"Sauce","Fromages & Garnitures":"Cheeses & Toppings","(multi-choix)":"(multi-select)",
 "Ta création en direct...":"Your creation, live...","Suppléments":"Extras","Calories estimées":"Est. calories",
 "PRIX TOTAL":"TOTAL PRICE","Nom de ta pizza (ex: Tripoli Inferno)":"Name your pizza (e.g. Tripoli Inferno)",
 "Ajouter au panier":"Add to cart","Surprends-moi !":"Surprise me!",
 "Astuce du Chef Enzo":"Chef Enzo's tip",
 "Burrata + roquette + tomates cerises = la combinaison préférée des Tripolitains. Essaie la pâte farcie au fromage, c'est une tuerie !":"Burrata + arugula + cherry tomatoes = the Tripoli favorite. Try the cheese-stuffed crust — it's heavenly!",
 "Ajoute des garnitures...":"Add some toppings...",
 "Pizza Création Demo":"Demo Creation Pizza",
 "Petite 26cm":"Small 26cm","Moyenne 32cm":"Medium 32cm","Grande 40cm":"Large 40cm",
 "Classique":"Classic","Fermentée 48h":"48h fermented","Fine Croustillante":"Thin & Crispy","Style romana":"Roman style",
 "Épaisse Moelleuse":"Thick & Soft","Farcie Fromage":"Cheese-Stuffed","Bords mozzarella":"Mozzarella edges",
 "Tomate San Marzano":"San Marzano Tomato","Blanche Crème":"White Cream","Pesto Basilic":"Basil Pesto","BBQ Fumée":"Smoky BBQ",
 "Parmesan 24 mois":"24-month Parmesan","Ricotta fumée":"Smoked Ricotta",
 "Champignons":"Mushrooms","Poivrons":"Peppers","Olives noires":"Black Olives","Oignons rouges":"Red Onions",
 "Jambon halal":"Halal Ham","Thon":"Tuna","Crevettes":"Shrimp","Roquette":"Arugula","Maïs":"Corn","Truffe":"Truffle",
 "Garde au moins un fromage !":"Keep at least one cheese!","Max 8 garnitures, chef !":"Max 8 toppings, chef!",
 "Le destin a choisi pour toi !":"Destiny has chosen for you!",
 /* offers */
 "OFFRES EXPLOSIVES • Tripoli only":"EXPLOSIVE DEALS • Tripoli only","Des promos":"Deals","qui claquent !":"that pop!",
 "WEEK-END FAMIGLIA":"FAMIGLIA WEEKEND","2 PIZZAS GRANDES":"2 LARGE PIZZAS","+ 4 BOISSONS + TIRAMISU":"+ 4 DRINKS + TIRAMISU",
 "Valable vendredi → dimanche • Sur place, à emporter & livraison.":"Valid Friday → Sunday • Dine-in, takeaway & delivery.",
 "JOURS":"DAYS","HEURES":"HOURS","MIN":"MIN","SEC":"SEC",
 "J'en profite !":"Grab it!","Code: ":"Code: ",
 "ÉTUDIANTS -15%":"STUDENTS -15%","Show ta carte, on s'occupe du reste !":"Show your ID, we handle the rest!",
 "Universités de Tripoli • Sur place.":"Tripoli universities • Dine-in.",
 "MIDI EXPRESS 29 LYD":"LUNCH EXPRESS 29 LYD","Margherita + boisson en 15 min":"Margherita + drink in 15 min",
 "Lun-Jeu • 12h-15h • À emporter.":"Mon–Thu • 12pm–3pm • Takeaway.",
 "FIDÉLITÉ":"LOYALTY","8 pizzas = la 9ème OFFERTE":"8 pizzas = the 9th FREE","Carte tamponnée en caisse & en ligne.":"Stamp card at the till & online.",
 "ROUE DE LA FORTUNA":"WHEEL OF FORTUNA","Tourne & gagne jusqu'à -20% !":"Spin & win up to -20%!",
 "TOURNER LA ROUE":"SPIN THE WHEEL","1 tour par visite • Gain applicable au panier":"1 spin per visit • Prize applies at checkout",
 "GAGNÉ : ":"WON: "," — code ":" — code "," appliqué !":" applied!","cadeau":"gift","bravo":"well done",
 " OFFERT ajouté au panier !":" FREE added to your cart!",
 "Livraison":"Delivery","Boisson":"Drink",
 "-10% appliqués !":"-10% applied!","Pack Famiglia : -15 LYD !":"Pack Famiglia: -15 LYD!","Bienvenue ! -15% offerts":"Welcome! 15% off",
 "Jackpot roue : -20% !":"Wheel jackpot: -20%!","Roue : -10% !":"Wheel: -10%!","Livraison offerte !":"Free delivery!",
 "✓ -10% appliqués !":"✓ -10% applied!","✓ Pack Famiglia : -15 LYD !":"✓ Pack Famiglia: -15 LYD!",
 "✓ Bienvenue ! -15% offerts":"✓ Welcome! 15% off","✓ Jackpot roue : -20% !":"✓ Wheel jackpot: -20%!",
 "✓ Roue : -10% !":"✓ Wheel: -10%!","✓ Livraison offerte !":"✓ Free delivery!",
 "✕ Code invalide. Essaie DEMO10":"✕ Invalid code. Try DEMO10",
 "Code promo (ex: DEMO10)":"Promo code (e.g. DEMO10)",
 "Tu as déjà tourné ! Reviens demain.":"You already spun! Come back tomorrow.",
 /* gallery */
 "GALERIE • dal forno":"GALLERY • dal forno","Ça sent bon jusqu'ici":"It smells great from here","buonissimo !":"buonissimo!",
 "Notre four à bois":"Our wood oven","Diavola signature":"Diavola signature","En cuisine":"In the kitchen","Part de bonheur":"Slice of happiness",
 "La salle Famiglia":"The Famiglia dining room","Dolci maison":"Homemade dolci","Terrasse du soir":"Evening terrace",
 "@pizzademo.tripoli • 48k abonnés":"@pizzademo.tripoli • 48k followers",
 /* reviews */
 "ILS NOUS ADORENT • 4.9/5":"THEY LOVE US • 4.9/5","en parle mieux que nous":"tells it better than we do",
 "Laisse ton avis !":"Leave your review!","Ton retour fait grandir la famiglia.":"Your feedback helps the famiglia grow.",
 "Ton prénom (ex: Sara de Tajoura)":"Your first name (e.g. Sara from Tajoura)","Raconte ton expérience...":"Tell us about your experience...",
 "Publier mon avis":"Post my review","✓ Achat vérifié":"✓ Verified visit","À l'instant":"Just now",
 "Ajoute ton prénom et un petit mot":"Add your name and a few words","Merci ! Ton avis est publié.":"Thanks! Your review is published.",
 "Meilleure pizza de Tripoli, sans débat ! La Demo Special avec la burrata... j'ai cru être à Naples. Livraison en 22 minutes chrono.":"The best pizza in Tripoli, period! The Demo Special with burrata... I thought I was in Naples. Delivered in 22 minutes flat.",
 "Cadre magnifique, terrasse parfaite en famille. Le créateur de pizza est génial, mes enfants ont adoré composer la leur. Tiramisu incroyable.":"Gorgeous setting, perfect terrace for families. The pizza builder is great — my kids loved making theirs. Incredible tiramisu.",
 "Calzone énorme et bien garni, pâte fine comme j'aime. Service rapide même un vendredi soir. Je recommande le pack famiglia.":"Huge, loaded calzone, thin crust the way I like it. Fast service even on a Friday night. The famiglia pack is recommended.",
 "Il y a 2 jours":"2 days ago","Il y a 5 jours":"5 days ago","Il y a 1 semaine":"1 week ago","Il y a 2 semaines":"2 weeks ago",
 /* reservation */
 "RÉSERVATION • sans stress":"RESERVATION • stress-free","Ta table t'attend":"Your table is waiting","déjà !":"already!","Choisis ta table":"Pick your table","(vert = libre)":"(green = free)",
 "Libre":"Free","Sélectionnée":"Selected","Occupée":"Taken","Kids friendly":"Kids friendly",
 "120 places":"120 seats","Terrasse + salle":"Terrace + dining room","Aire de jeux":"Playground","Soirées live":"Live nights","Jeu & Ven":"Thu & Fri",
 "Réserver en 30 secondes":"Book in 30 seconds","Nom complet *":"Full name *","Téléphone * (+218...)":"Phone * (+218...)",
 "Heure *":"Time *","Convives *":"Guests *","1-2 personnes":"1-2 people","3-4 personnes":"3-4 people","5-8 personnes":"5-8 people","9+ (groupe / fête)":"9+ (group / party)",
 "Terrasse vue mer":"Sea-view terrace","Salle familiale":"Family room","Coin romantique":"Romantic corner","Près du four à bois":"By the wood oven","Espace enfants":"Kids area",
 "Occasion spéciale ? Anniversaire, demande...":"Special occasion? Birthday, proposal...",
 "Confirmer ma réservation":"Confirm my reservation","Confirmation immédiate par SMS & WhatsApp • Sans acompte":"Instant confirmation by SMS & WhatsApp • No deposit",
 "2 pers":"2 ppl","4 pers":"4 ppl","6 pers":"6 ppl","sélectionnée":"selected","Table T":"Table T",
 "Indique ton nom":"Enter your name","Téléphone invalide":"Invalid phone","Choisis une date":"Pick a date","Heure et convives requis":"Time & guests required",
 "Table réservée":"Table booked","Présente ce code à l'entrée • Hay Al Andalus":"Show this code at the door • Hay Al Andalus",
 /* contact */
 "NOUS TROUVER • Tripoli طرابلس":"FIND US • Tripoli طرابلس","À deux pas de":"Steps away from","la mer !":"the sea!",
 "Rue Sidi Issa, à 200m du front de mer":"Sidi Issa St, 200m from the corniche","Tripoli, Libye":"Tripoli, Libya",
 "Itinéraire →":"Directions →","Horaires":"Opening hours","Lun — Jeu":"Mon — Thu","Vendredi":"Friday","Sam — Dim":"Sat — Sun",
 "Calculateur de livraison":"Delivery calculator","— Ton quartier —":"— Your district —","Choisis ton quartier à Tripoli.":"Pick your district in Tripoli.",
 "Pizza Demo — Tripoli sur la carte":"Pizza Demo — Tripoli on the map","WhatsApp direct":"WhatsApp direct","Commander now":"Order now",
 "— Quartier de livraison * —":"— Delivery district * —","Rapide !":"Fast!","Carte Tripoli":"Tripoli map",
 /* footer */
 "La pizzeria italienne préférée de Tripoli depuis 2012. Forno a legna, amore e gioia — dans chaque part.":"Tripoli's favorite Italian pizzeria since 2012. Forno a legna, amore e gioia — in every slice.",
 "LIENS RAPIDES":"QUICK LINKS","Menu complet":"Full menu","Créateur de pizza":"Pizza builder","Offres & Roue":"Deals & Wheel","Réserver une table":"Book a table","Avis clients":"Customer reviews",
 "Ouvert 7j/7 jusqu'à minuit":"Open 7/7 until midnight",
 "NEWSLETTER FAMIGLIA":"FAMIGLIA NEWSLETTER","-10% sur ta première commande en ligne.":"-10% on your first online order.",
 "Email invalide":"Invalid email","✓ Bienvenue ! Code BENVENUTO (-15%) envoyé.":"✓ Welcome! Code BENVENUTO (-15%) sent.",
 "Code BENVENUTO prêt dans ton panier !":"BENVENUTO code ready in your cart!",
 "Paiement: Cash • Carte locale • Sadad • Moamalat":"Payment: Cash • Local card • Sadad • Moamalat",
 "Espace admin":"Admin area",
 /* cart */
 "Ton Panier":"Your Cart","X article • Livraison Tripoli":"X item • Tripoli delivery","X articles • Livraison Tripoli":"X items • Tripoli delivery",
 "0 article • Livraison Tripoli":"0 items • Tripoli delivery",
 "Panier vide...":"Cart is empty...","Une petite Diavola pour te consoler ?":"A little Diavola to cheer you up?","Découvrir le menu":"Browse the menu",
 "Sous-total":"Subtotal","Remise":"Discount","Total":"Total","Commander • ":"Order • ","Livraison (":"Delivery (",
 "(offerte dès X LYD)":"(free from X LYD)","(offerte dès 80 LYD)":"(free from 80 LYD)","+ Ajouter d'autres délices":"+ Add more delights",
 "GRATUITE 🎉":"FREE 🎉","ajouté au panier !":"added to cart!","activé !":"activated!",
 "Ton panier est vide, ajoute une pizza d'abord !":"Your cart is empty, add a pizza first!",
 /* checkout */
 "Finaliser la commande":"Complete your order","Livraison chaude en 25-40 min à Tripoli":"Hot delivery in 25-40 min across Tripoli",
 "Téléphone * 09X XXX XXXX":"Phone * 09X XXX XXXX","Adresse précise * (rue, immeuble...)":"Exact address * (street, building...)",
 "Mode de paiement":"Payment method","à la livraison":"on delivery","Carte":"Card",
 "Instructions (étage, sans oignons, sonnez 2x...)":"Instructions (floor, no onions, ring twice...)",
 "Total à payer":"Total due","Confirmer • ":"Confirm • ",
 "Indique ton nom complet":"Enter your full name","Numéro libyen invalide (ex: 091 234 5678)":"Invalid Libyan number (e.g. 091 234 5678)",
 "Choisis ton quartier de livraison":"Pick your delivery district","Précise ton adresse (rue, repère...)":"Add your address (street, landmark...)",
 /* tracking */
 "Commande":"Order","confirmée.":"confirmed.","Notre four s'allume déjà pour toi.":"Our oven is already firing up for you.",
 "Commande reçue":"Order received","On prépare ta pâte...":"We're prepping your dough...","Au four à bois 450°C":"In the 450°C wood oven",
 "90 secondes de magie":"90 seconds of magic","Livreur en route":"Rider on the way","Arrivée estimée: ":"ETA: ","Arrivée estimée: 30 min":"ETA: 30 min",
 "Dis-nous tout en avis":"Tell us everything in a review","Parfait, j'ai faim !":"Perfect, I'm hungry!",
 /* content settings (topbar / hero) */
 "LIVRAISON GRATUITE dès 80 LYD à Tripoli":"FREE DELIVERY from 80 LYD in Tripoli","Livraison gratuite dès 80 LYD":"Free delivery from 80 LYD",
 "Pâte fermentée 48h, tomates San Marzano, fior di latte & four à bois à 450°C. Livrée chaude en 25 minutes partout à Tripoli — de Gargaresh à Tajoura.":"48h fermented dough, San Marzano tomatoes, fior di latte & a 450°C wood oven. Delivered hot in 25 minutes anywhere in Tripoli — from Gargaresh to Tajoura."
},
ar:{
 /* <title> */
 "Pizza Demo — Pizzeria Italienne à Tripoli | Forno a Legna":"بيتزا ديمو — مطبخ بيتزا إيطالي في طرابلس | فرن حطب",
 /* nav + topbar */
 "Accueil":"الرئيسية","Menu":"المنيو","Créateur":"صنع بيتزتك","Offres":"العروض","Galerie":"المعرض","Avis":"الآراء","Contact":"اتصل بنا",
 "Réserver":"حجز طاولة","Commander":"اطلب","Langue":"اللغة",
 /* hero */
 "LA VRAIE":"البيتزا","PIZZA ITALIENNE":"الإيطالية الأسطورية","AU CŒUR DE":"في قلب","TRIPOLI":"طرابلس","Tripoli":"طرابلس",
 "Voir le Menu":"شاهد المنيو","Créer ma Pizza":"اصنع بيتزتك",
 "Authentique depuis 2012 • Tripoli":"أصيلة منذ 2012 • طرابلس",
 "2 400+ avis vérifiés à Tripoli":"أكثر من 2,400 تقييم موثّق في طرابلس",
 "OUVERT • jusqu'à 00:00":"مفتوح • حتى منتصف الليل",
 "FERMENTATION":"تخمير","FOUR À BOIS":"فرن الحطب","LIVRAISON":"توصيل",
 "DÈS":"ابتداءً من","Livraison éclair":"توصيل خاطف","100% Halal!":"حلال 100%",
 "Farine italienne Caputo":"دقيق إيطالي كابوتو","Produits frais & Halal":"منتجات طازجة وحلال",
 "Chef Napolitain Enzo":"الشيف النابوليتاني إينزو","Cash • Carte • Mobile":"نقدًا • بطاقة • موبايل",
 "Mamma mia! 🤌":"ماميا! 🤌",
 /* marquee */
 "PÂTE 48H":"عجين 48 ساعة","LIVRAISON TRIPOLI":"توصيل طرابلس","TIRAMISU MAISON":"تيراميسو بيتي",
 /* best-sellers */
 "LES INCONTOURNABLES":"لا تُفوَّت","Best-sellers":"الأكثر مبيعًا","qui font danser Tripoli !":"التي تُرقص طرابلس!",
 /* menu */
 "NOTRE MENU • antipasti • pizze • dolci":"منيومنا • مقبلات • بيتزا • حلويات",
 "Un festival de":"احتفال بـ","saveurs italiennes":"النكهات الإيطالية",
 "Toutes":"الكل","Veggie":"خضاري","Plus populaires":"الأكثر رواجًا","Prix croissant":"السعر: من الأقل","Prix décroissant":"السعر: من الأعلى",
 "Rechercher une pizza, un dessert... (ex: burrata, diavola)":"ابحث عن بيتزا أو حلوى... (مثال: بوراتا، ديافولا)",
 "Mamma mia, rien trouvé !":"ماميا، لم نجد شيئًا!","Essaie un autre mot ou crée ta propre pizza.":"جرّب كلمة أخرى أو اصنع بيتزتك الخاصة.",
 "commandes • Tripoli":"طلب • طرابلس","Ajouter":"أضف",
 "Classiques":"كلاسيكيات","Spécialités":"مميزاتنا","Calzone":"كالزوني","Desserts & Boissons":"حلويات ومشروبات",
 /* menu items */
 "Best-seller":"الأكثر مبيعًا","Chef choice":"اختيار الشيف","Fait maison":"صناعة بيتية",
 "San Marzano, fior di latte, basilic frais, huile d'olive EVO.":"طماطم سان مارزانو، فيور دي لاتيه، ريحان طازج، زيت زيتون بكر ممتاز.",
 "Pepperoni halal épicé, mozzarella, miel piquant, origan.":"بيبروني حلال حار، موزاريلا، عسل حار، زعتر.",
 "Anchois de Sicile, câpres, olives Taggiasche, tomate.":"أنشوفة صقلية، كبّار، زيتون تاجياسكي، طماطم.",
 "Jambon halal, champignons, artichauts, olives, œuf.":"لحم مدخّن حلال، فطر، أرضي شوكي، زيتون، بيض.",
 "Mozzarella, gorgonzola, parmesan 24 mois, ricotta fumée.":"موزاريلا، غورغونزولا، بارميجانو 24 شهرًا، ريكوتا مدخّنة.",
 "Viande épicée locale, burrata crémeuse, roquette, tomates cerises, sauce Demo secrète.":"لحم محلي متبّل، بوراتا كريمية، جرجير، طماطم كرزية، صلصة ديمو السرّية.",
 "Crème de truffe noire, burrata di Puglia, roquette, parmesan.":"كريمة الكمأة السوداء، بوراتا بولية، جرجير، بارميجانو.",
 "Crevettes, calamars, moules de la côte libyenne, ail, persil.":"روبيان، كاليماري، بلح من ساحل ليبيا، ثوم، بقدونس.",
 "Poivrons tricolores, courgettes grillées, champignons, pesto.":"فلفل ملوّن، كوسا مشوي، فطر، بيستو.",
 "Chausson doré, ricotta, épinards, mozzarella, sauce tomate à part.":"فطيرة ذهبية، ريكوتا، سبانخ، موزاريلا، صلصة طماطم جانبية.",
 "Pepperoni, scamorza fumée, oignons caramélisés, sauce BBQ.":"بيبروني، سكامورزا مدخّنة، بصل مكرمل، صلصة باربكيو.",
 "Mascarpone, café arabica, cacao amer — recette de Nonna.":"ماسكاربوني، قهوة أرابيكا، كاكاو مرّ — وصفة الجدة.",
 "Vanille Bourbon, coulis de fruits rouges, menthe.":"فانيليا بوربون، صوص التوت الأحمر، نعناع.",
 "Coques croustillantes, ricotta sucrée, pistaches, chocolat.":"عجين مقرمش، ريكوتا حلوة، فستق، شوكولاتة.",
 "Limonade italienne — Limone / Aranciata / Chinotto.":"ليمونادة إيطالية — ليمون / برتقال / تشينوتو.",
 "Avocat, lait frais, miel, amandes — le préféré de Tripoli.":"أفوكادو، حليب طازج، عسل، لوز — المفضلة في طرابلس.",
 "Menthe fraîche, citron vert, glace pilée, soda.":"نعناع طازج، ليمون أخضر، ثلج مجروش، صودا.",
 "2 grandes pizzas au choix + 4 boissons + tiramisu familial.":"بيتزتان كبيرتان على اختيارك + 4 مشروبات + تيراميسو عائلي.",
 /* builder */
 "PIZZA STUDIO • 100% PERSONNALISÉ":"استوديو البيتزا • تخصيص 100%",
 "Deviens le":"كن","Pizzaiolo !":"بيتزايولو!",
 "Compose ta pizza, vois-la se construire en direct, et ajoute-la au panier.":"ركّب بيتزتك، شاهدها تُبنى مباشرةً، وأضفها إلى السلة.",
 "Taille":"الحجم","Pâte":"العجين","Sauce":"الصلصة","Fromages & Garnitures":"الأجبان والإضافات","(multi-choix)":"(اختيار متعدد)",
 "Ta création en direct...":"إبداعك مباشرةً...","Suppléments":"الإضافات","Calories estimées":"سعرات تقريبية",
 "PRIX TOTAL":"السعر الإجمالي","Nom de ta pizza (ex: Tripoli Inferno)":"سمِّ بيتزتك (مثال: جحيم طرابلس)",
 "Ajouter au panier":"أضف إلى السلة","Surprends-moi !":"فاجئني!",
 "Astuce du Chef Enzo":"حيلة الشيف إينزو",
 "Burrata + roquette + tomates cerises = la combinaison préférée des Tripolitains. Essaie la pâte farcie au fromage, c'est une tuerie !":"بوراتا + جرجير + طماطم كرزية = التشكيلة المفضلة في طرابلس. جرّب العجين المحشو بالجبن — تحفة!",
 "Ajoute des garnitures...":"أضف بعض الإضافات...",
 "Pizza Création Demo":"بيتزا إبداع ديمو",
 "Petite 26cm":"صغيرة 26سم","Moyenne 32cm":"متوسطة 32سم","Grande 40cm":"كبيرة 40سم","XXL 50cm":"XXL 50سم",
 "Classique":"كلاسيكي","Fermentée 48h":"متخمّر 48 ساعة","Fine Croustillante":"رقيقة ومقرمشة","Style romana":"على الطريقة الرومانية",
 "Épaisse Moelleuse":"سميكة وطرية","Farcie Fromage":"محشوة بالجبن","Bords mozzarella":"حواف موزاريلا",
 "Tomate San Marzano":"طماطم سان مارزانو","Blanche Crème":"بيضاء بالكريمة","Pesto Basilic":"بيستو الريحان","BBQ Fumée":"باربكيو مدخّن",
 "Mozzarella":"موزاريلا","Burrata":"بوراتا","Parmesan 24 mois":"بارميجانو 24 شهرًا","Gorgonzola":"غورغونزولا","Ricotta fumée":"ريكوتا مدخّنة","Scamorza":"سكامورزا",
 "Pepperoni":"بيبروني","Jalapeños":"هالبينو","Champignons":"فطر","Poivrons":"فلفل","Olives noires":"زيتون أسود","Oignons rouges":"بصل أحمر",
 "Jambon halal":"لحم حلال","Thon":"تونة","Crevettes":"روبيان","Roquette":"جرجير","Maïs":"ذرة","Truffe":"كمأة",
 "Garde au moins un fromage !":"أبقِ جبنًا واحدًا على الأقل!","Max 8 garnitures, chef !":"8 إضافات كحد أقصى!",
 "Le destin a choisi pour toi !":"القدر اختار لك!",
 /* offers */
 "OFFRES EXPLOSIVES • Tripoli only":"عروض مدوّية • طرابلس فقط","Des promos":"عروض","qui claquent !":"لا تُقاوم!",
 "WEEK-END FAMIGLIA":"نهاية أسبوع فاميليا","2 PIZZAS GRANDES":"بيتزتان كبيرتان","+ 4 BOISSONS + TIRAMISU":"+ 4 مشروبات + تيراميسو",
 "Valable vendredi → dimanche • Sur place, à emporter & livraison.":"سارية الجمعة → الأحد • محلي، سفري وتوصيل.",
 "JOURS":"أيام","HEURES":"ساعات","MIN":"دقيقة","SEC":"ثانية",
 "J'en profite !":"اغتنمها!","Code: ":"الرمز: ",
 "ÉTUDIANTS -15%":"‎-15% للطلاب","Show ta carte, on s'occupe du reste !":"أظهر بطاقتك الجامعية، ونحن نتكفّل بالباقي!",
 "Universités de Tripoli • Sur place.":"جامعات طرابلس • محليًا.",
 "MIDI EXPRESS 29 LYD":"غداء سريع 29 ل.د","Margherita + boisson en 15 min":"مارغريتا + مشروب في 15 دقيقة",
 "Lun-Jeu • 12h-15h • À emporter.":"الإثنين–الخميس • 12م–3م • سفري.",
 "FIDÉLITÉ":"ولاء","8 pizzas = la 9ème OFFERTE":"8 بيتزا = التاسعة مجانًا","Carte tamponnée en caisse & en ligne.":"بطاقة أختام في الصندوق وعبر الإنترنت.",
 "ROUE DE LA FORTUNA":"عجلة الحظ","Tourne & gagne jusqu'à -20% !":"أدر العجلة واربح حتى -20%!",
 "TOURNER LA ROUE":"أدر العجلة","1 tour par visite • Gain applicable au panier":"دورة واحدة لكل زيارة • الجائزة تُطبّق عند الطلب",
 "GAGNÉ : ":"ربحت: "," — code ":" — رمز "," appliqué !":" مُفعّل!","cadeau":"هدية","bravo":"أحسنت",
 " OFFERT ajouté au panier !":" مجانًا أُضيف إلى السلة!",
 "Livraison":"توصيل","Boisson":"مشروب",
 "-10% appliqués !":"تم تطبيق خصم 10%!","Pack Famiglia : -15 LYD !":"باقة فاميليا: ‎-15 ل.د!","Bienvenue ! -15% offerts":"أهلًا بك! خصم 15%",
 "Jackpot roue : -20% !":"جائزة العجلة: ‎-20%!","Roue : -10% !":"العجلة: ‎-10%!","Livraison offerte !":"توصيل مجاني!",
 "✓ -10% appliqués !":"✓ تم تطبيق خصم 10%!","✓ Pack Famiglia : -15 LYD !":"✓ باقة فاميليا: ‎-15 ل.د!",
 "✓ Bienvenue ! -15% offerts":"✓ أهلًا بك! خصم 15%","✓ Jackpot roue : -20% !":"✓ جائزة العجلة: ‎-20%!",
 "✓ Roue : -10% !":"✓ العجلة: ‎-10%!","✓ Livraison offerte !":"✓ توصيل مجاني!",
 "✕ Code invalide. Essaie DEMO10":"✕ رمز غير صالح. جرّب DEMO10",
 "Code promo (ex: DEMO10)":"رمز الخصم (مثال: DEMO10)",
 "Tu as déjà tourné ! Reviens demain.":"لقد درت من قبل! عُد غدًا.",
 /* gallery */
 "GALERIE • dal forno":"المعرض • من الفرن","Ça sent bon jusqu'ici":"رائحة تصل إلى هنا","buonissimo !":"شهي جدًا!",
 "Notre four à bois":"فرن الحطب لدينا","Diavola signature":"ديافولا التوقيع","En cuisine":"في المطبخ","Part de bonheur":"شريحة سعادة",
 "La salle Famiglia":"قاعة فاميليا","Dolci maison":"حلويات بيتية","Terrasse du soir":"تراس المساء",
 "@pizzademo.tripoli • 48k abonnés":"@pizzademo.tripoli • 48k متابع",
 /* reviews */
 "ILS NOUS ADORENT • 4.9/5":"يعشقوننا • 4.9/5","en parle mieux que nous":"تتحدث عنا أفضل منا",
 "Laisse ton avis !":"اترك رأيك!","Ton retour fait grandir la famiglia.":"رأيك يُنمّي العائلة.",
 "Ton prénom (ex: Sara de Tajoura)":"اسمك (مثال: سارة من تاجوراء)","Raconte ton expérience...":"حدّثنا عن تجربتك...",
 "Publier mon avis":"انشر رأيي","✓ Achat vérifié":"✓ زيارة موثّقة","À l'instant":"الآن",
 "Ajoute ton prénom et un petit mot":"أضف اسمك وبضع كلمات","Merci ! Ton avis est publié.":"شكرًا! تم نشر رأيك.",
 "Meilleure pizza de Tripoli, sans débat ! La Demo Special avec la burrata... j'ai cru être à Naples. Livraison en 22 minutes chrono.":"أفضل بيتزا في طرابلس بلا جدال! الديمو سبيشيال مع البوراتا... ظننت نفسي في نابولي. التوصيل في 22 دقيقة بالضبط.",
 "Cadre magnifique, terrasse parfaite en famille. Le créateur de pizza est génial, mes enfants ont adoré composer la leur. Tiramisu incroyable.":"مكان رائع وتراس مثالي للعائلة. صانع البيتزا عبقري، أحب أطفالي تركيب بيتزتهم. التيراميسو خرافي.",
 "Calzone énorme et bien garni, pâte fine comme j'aime. Service rapide même un vendredi soir. Je recommande le pack famiglia.":"كالزوني ضخمة وغنية، عجين رفيع كما أحب. خدمة سريعة حتى ليلة الجمعة. أنصح بباقة فاميليا.",
 "Il y a 2 jours":"قبل يومين","Il y a 5 jours":"قبل 5 أيام","Il y a 1 semaine":"قبل أسبوع","Il y a 2 semaines":"قبل أسبوعين",
 /* reservation */
 "RÉSERVATION • sans stress":"حجز • بلا تعقيد","Ta table t'attend":"طاولتك تنتظرك","déjà !":"بالفعل!","Choisis ta table":"اختر طاولتك","(vert = libre)":"(الأخضر = متاحة)",
 "Libre":"متاحة","Sélectionnée":"محددة","Occupée":"محجوزة","Kids friendly":"مناسب للأطفال",
 "120 places":"120 مقعدًا","Terrasse + salle":"التراس والقاعة","Aire de jeux":"منطقة ألعاب","Soirées live":"سهريات مباشرة","Jeu & Ven":"الخميس والجمعة",
 "Réserver en 30 secondes":"احجز في 30 ثانية","Nom complet *":"الاسم الكامل *","Téléphone * (+218...)":"الهاتف * (+218...)",
 "Heure *":"الوقت *","Convives *":"عدد الضيوف *","1-2 personnes":"شخص إلى 2","3-4 personnes":"3 إلى 4","5-8 personnes":"5 إلى 8","9+ (groupe / fête)":"9+ (مجموعة / حفلة)",
 "Terrasse vue mer":"تراس بإطلالة بحرية","Salle familiale":"قاعة عائلية","Coin romantique":"زاوية رومانسية","Près du four à bois":"بجانب فرن الحطب","Espace enfants":"منطقة الأطفال",
 "Occasion spéciale ? Anniversaire, demande...":"مناسبة خاصة؟ عيد ميلاد، خطوبة...",
 "Confirmer ma réservation":"تأكيد حجزي","Confirmation immédiate par SMS & WhatsApp • Sans acompte":"تأكيد فوري عبر الرسائل والواتساب • دون عربون",
 "2 pers":"شخصان","4 pers":"4 أشخاص","6 pers":"6 أشخاص","sélectionnée":"تم اختيارها","Table T":"طاولة T",
 "Indique ton nom":"أدخل اسمك","Téléphone invalide":"رقم هاتف غير صالح","Choisis une date":"اختر تاريخًا","Heure et convives requis":"الوقت وعدد الضيوف مطلوبان",
 "Table réservée":"تم حجز الطاولة","Présente ce code à l'entrée • Hay Al Andalus":"أظهر هذا الرمز عند المدخل • حي الأندلس",
 /* contact */
 "NOUS TROUVER • Tripoli طرابلس":"زورنا • طرابلس","À deux pas de":"على بعد خطوات من","la mer !":"من البحر!",
 "Rue Sidi Issa, à 200m du front de mer":"شارع سيدي عيسى، على بعد 200م من الكورنيش","Tripoli, Libye":"طرابلس، ليبيا",
 "Itinéraire →":"الاتجاهات ←","Horaires":"مواعيد العمل","Lun — Jeu":"الإثنين — الخميس","Vendredi":"الجمعة","Sam — Dim":"السبت — الأحد",
 "Calculateur de livraison":"حاسبة التوصيل","— Ton quartier —":"— اختر حيّك —","Choisis ton quartier à Tripoli.":"اختر حيك في طرابلس.",
 "Pizza Demo — Tripoli sur la carte":"بيتزا ديمو — طرابلس على الخريطة","WhatsApp direct":"واتساب مباشر","Commander now":"اطلب الآن",
 "— Quartier de livraison * —":"— حي التوصيل * —","Rapide !":"سريع!","Carte Tripoli":"خريطة طرابلس",
 /* footer */
 "La pizzeria italienne préférée de Tripoli depuis 2012. Forno a legna, amore e gioia — dans chaque part.":"المطبخ الإيطالي المفضل في طرابلس منذ 2012. فرن حطب، حب وفرحة — في كل شريحة.",
 "LIENS RAPIDES":"روابط سريعة","Menu complet":"المنيو الكامل","Créateur de pizza":"صانع البيتزا","Offres & Roue":"العروض والعجلة","Réserver une table":"حجز طاولة","Avis clients":"آراء العملاء",
 "CONTACT":"تواصل","Ouvert 7j/7 jusqu'à minuit":"مفتوح يوميًا حتى منتصف الليل",
 "NEWSLETTER FAMIGLIA":"نشرة فاميليا","-10% sur ta première commande en ligne.":"خصم 10% على أول طلب لك عبر الإنترنت.",
 "Email invalide":"بريد إلكتروني غير صالح","✓ Bienvenue ! Code BENVENUTO (-15%) envoyé.":"✓ أهلًا بك! تم إرسال رمز BENVENUTO (خصم 15%).",
 "Code BENVENUTO prêt dans ton panier !":"رمز BENVENUTO جاهز في سلتك!",
 "Paiement: Cash • Carte locale • Sadad • Moamalat":"الدفع: نقدًا • بطاقة محلية • سداد • معاملات",
 "© 2026 Pizza Demo Tripoli • Fatto con amore in Libia 🇱🇾🇮🇹":"© 2026 بيتزا ديمو طرابلس • صُنعت بحب في ليبيا 🇱🇾🇮🇹",
 "Espace admin":"لوحة الإدارة",
 /* cart */
 "Ton Panier":"سلتك","X article • Livraison Tripoli":"عنصر • توصيل طرابلس","X articles • Livraison Tripoli":"عناصر • توصيل طرابلس",
 "0 article • Livraison Tripoli":"0 عناصر • توصيل طرابلس",
 "Panier vide...":"سلتك فارغة...","Une petite Diavola pour te consoler ?":"ديافولا صغيرة تُبهجك؟","Découvrir le menu":"تصفّح المنيو",
 "Sous-total":"المجموع الفرعي","Remise":"الخصم","Total":"الإجمالي","Commander • ":"اطلب • ","Livraison (":"التوصيل (","Livraison":"التوصيل",
 "(offerte dès X LYD)":"(مجاني ابتداءً من X ل.د)","(offerte dès 80 LYD)":"(مجاني ابتداءً من 80 ل.د)","+ Ajouter d'autres délices":"+ أضف المزيد من اللذات",
 "GRATUITE 🎉":"مجاني 🎉","ajouté au panier !":"أُضيف إلى السلة!","activé !":"تم التفعيل!",
 "Ton panier est vide, ajoute une pizza d'abord !":"سلتك فارغة، أضف بيتزا أولًا!",
 /* checkout */
 "Finaliser la commande":"إتمام الطلب","Livraison chaude en 25-40 min à Tripoli":"توصيل ساخن خلال 25-40 دقيقة في طرابلس",
 "Téléphone * 09X XXX XXXX":"الهاتف * 09X XXX XXXX","Adresse précise * (rue, immeuble...)":"العنوان بالتفصيل * (شارع، مبنى...)",
 "Mode de paiement":"طريقة الدفع","Cash":"نقدًا","à la livraison":"عند التسليم","Carte":"بطاقة","Mobile":"موبايل",
 "Instructions (étage, sans oignons, sonnez 2x...)":"تعليمات (الطابق، بدون بصل، اقرع الجرس مرتين...)",
 "Total à payer":"المبلغ المستحق","Confirmer • ":"تأكيد • ",
 "Indique ton nom complet":"أدخل اسمك الكامل","Numéro libyen invalide (ex: 091 234 5678)":"رقم ليبي غير صالح (مثال: 091 234 5678)",
 "Choisis ton quartier de livraison":"اختر حي التوصيل","Précise ton adresse (rue, repère...)":"حدّد عنوانك (شارع، معلم قريب...)",
 /* tracking */
 "Commande":"الطلب","confirmée.":"مؤكّد.","Notre four s'allume déjà pour toi.":"فرننا يشتعل من أجلك الآن.",
 "Commande reçue":"تم استلام الطلب","On prépare ta pâte...":"نُحضّر عجينك...","Au four à bois 450°C":"في فرن الحطب 450°م",
 "90 secondes de magie":"90 ثانية من السحر","Livreur en route":"المندوب في الطريق","Arrivée estimée: ":"الوصول المتوقع: ","Arrivée estimée: 30 min":"الوصول المتوقع: 30 دقيقة",
 "Buon appetito !":"بالعافية!","Dis-nous tout en avis":"أخبرنا كل شيء في تقييم","Parfait, j'ai faim !":"ممتاز، أنا جائع!",
 /* content settings (topbar / hero) */
 "LIVRAISON GRATUITE dès 80 LYD à Tripoli":"توصيل مجاني ابتداءً من 80 ل.د في طرابلس","Livraison gratuite dès 80 LYD":"توصيل مجاني ابتداءً من 80 ل.د",
 "Pâte fermentée 48h, tomates San Marzano, fior di latte & four à bois à 450°C. Livrée chaude en 25 minutes partout à Tripoli — de Gargaresh à Tajoura.":"عجين متخمّر 48 ساعة، طماطم سان مارزانو، فيور دي لاتيه وفرن حطب بحرارة 450°م. تصل ساخنة في 25 دقيقة إلى كل أحياء طرابلس — من غرغور إلى تاجوراء."
}
};

/* ---- normalisation des clés (apostrophes, espaces) ---- */
function norm(s){return String(s==null?'':s).replace(/[\u2019\u02bc\u02b9']/g,"'").replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();}
var IDX={en:{},ar:{}};
for(var LL in DICT){var map=IDX[LL];for(var K in DICT[LL]){map[norm(K)]=DICT[LL][K];}}

var lang='fr';try{var sv=localStorage.getItem(LS);if(sv&&SUPPORTED[sv])lang=sv;}catch(e){}
window.pdGetLang=function(){return lang;};

/* Traduction immédiate d'une chaîne (utilisée par le JS pour les
   messages composés). En français : identité. */
window.pdT=function(s){
  if(lang==='fr')return s;
  var t=IDX[lang][norm(s)];
  return t===undefined?s:t;
};
function lookup(s){if(lang==='fr')return undefined;var t=IDX[lang][norm(s)];return t===undefined?undefined:t;}

/* ---- traduction des nœuds texte ---- */
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
  if(lang==='fr'){if(rec){if(n.nodeValue!==rec.fr)n.nodeValue=rec.fr;TXT.delete(n);}return;}
  var src=cur;
  if(rec){
    if(rec.lang===lang){if(rec.out===cur)return;} /* déjà à jour */
    else src=rec.fr;                              /* changement de langue : repartir du français */
  }
  var t=lookup(src);
  if(t===undefined){if(rec&&rec.out!==cur)n.nodeValue=src;TXT.delete(n);return;}
  var lead=(src.match(/^\s*/)||[''])[0],trail=(src.match(/\s*$/)||[''])[0];
  var out=lead+t+trail;
  if(out!==cur)n.nodeValue=out;
  TXT.set(n,{fr:(rec&&rec.lang!==lang)?rec.fr:src,out:out,lang:lang});
}

/* ---- traduction des attributs (placeholder / title / aria-label) ---- */
var ATTRM=new WeakMap();
function translateAttr(el){
  var rec=ATTRM.get(el);
  for(var i=0;i<ATTRS.length;i++){
    var a=ATTRS[i],cur=el.getAttribute(a);
    if(cur==null){if(rec&&rec[a]){el.setAttribute(a,rec[a].fr);delete rec[a];}continue;}
    if(lang==='fr'){if(rec&&rec[a]){if(cur!==rec[a].fr)el.setAttribute(a,rec[a].fr);delete rec[a];}continue;}
    var r=rec&&rec[a],src=cur;
    if(r){
      if(r.lang===lang){if(r.out===cur)continue;}
      else src=r.fr;
    }
    var t=lookup(src);
    if(t===undefined){if(r&&r.out!==cur)el.setAttribute(a,src);continue;}
    if(t!==cur)el.setAttribute(a,t);
    if(!ATTRM.has(el))ATTRM.set(el,{});
    ATTRM.get(el)[a]={fr:(r&&r.lang!==lang)?r.fr:src,out:t,lang:lang};
  }
}

/* ---- parcours complet ---- */
var walker=null;
function walkAll(){
  if(!walker)walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return skipNode(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
  walker.currentNode=document.body;
  var n;while((n=walker.nextNode()))translateNode(n);
  var els=document.querySelectorAll('['+ATTRS.join('],[')+']');
  for(var i=0;i<els.length;i++)translateAttr(els[i]);
}

/* ---- observateur : retraduit les nœuds ajoutés/modifiés (rendu auto, panier…) ---- */
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

/* ---- interface : boutons du sélecteur FR / EN / AR ---- */
function updateUI(){
  var bs=document.querySelectorAll('.lang-btn');
  for(var i=0;i<bs.length;i++){
    var on=bs[i].getAttribute('data-lang')===lang;
    bs[i].classList.toggle('lg-on',on);
    bs[i].setAttribute('aria-pressed',on?'true':'false');
  }
}

/* ---- titre de l'onglet ---- */
var titleOrig=null;
function updateTitle(){
  if(titleOrig==null)return;
  var t=lookup(titleOrig);
  document.title=t===undefined?titleOrig:t;
}

/* ---- API globale ---- */
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
  /* re-rendus qui recomposent des chaînes traduites (panier, avis) */
  if(window.refreshTotals){try{window.refreshTotals();}catch(e){}}
  if(window.renderReviews){try{window.renderReviews();}catch(e){}}
};

/* ---- démarrage ---- */
function init(){
  if(!document.body){setTimeout(init,50);return;}
  if(lang!=='fr'){
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
