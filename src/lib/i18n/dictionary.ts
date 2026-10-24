// UI strings. Tamil strings are first drafts: have a native Tamil speaker review them before launch.
export const en = {
  nav: { home: "Home", shop: "Shop", cart: "Cart", search: "Search", searchPlaceholder: "Search rice, grains, millets…", menu: "Menu", close: "Close", language: "Language", skip: "Skip to content" },
  common: {
    loading: "Loading…", retry: "Try again", viewDetails: "View details", addToCart: "Add to cart", added: "Added to cart",
    inStock: "In stock", limited: "Limited stock", outOfStock: "Out of stock", tamilPending: "Tamil translation pending",
    from: "From", each: "each", back: "Back", next: "Next", previous: "Previous", page: "Page", of: "of", placeholderImage: "Placeholder image",
    somethingWrong: "Something went wrong", somethingWrongHint: "Please check your connection and try again.",
  },
  home: {
    heroLead: "Traditional rice varieties, grains and millets, ordered straight on WhatsApp.",
    shopNow: "Shop now", browseCategories: "Browse categories",
    categoriesTitle: "Shop by category", featuredTitle: "Featured products", viewAll: "View all products",
    howTitle: "How ordering works",
    steps: [
      { title: "Browse", text: "Pick products from the catalogue." },
      { title: "Add to cart", text: "Add as many items as you like." },
      { title: "Continue to WhatsApp", text: "Your full order opens as a ready-to-send message." },
      { title: "We confirm", text: "We confirm availability and delivery charges with you." },
    ],
    aboutTitle: "About us", qualityTitle: "Our products",
    contactTitle: "Questions? Message us on WhatsApp", contactText: "Ask about products, availability or delivery.", chatNow: "Chat on WhatsApp",
    noCategories: "Categories will appear here once they are added.", noProducts: "Products will appear here soon.",
  },
  shop: {
    title: "All products", searchResults: "Results for", allCategories: "All categories", category: "Category", sort: "Sort by",
    sortDefault: "Featured order", sortPriceAsc: "Price: low to high", sortPriceDesc: "Price: high to low",
    results: "products", noResults: "No products match your search", noResultsHint: "Try another spelling or clear the filters.",
    clearFilters: "Clear filters", noProductsYet: "No products yet", noProductsYetHint: "Please check back soon.", filters: "Filters",
  },
  product: {
    breadcrumbHome: "Home", quantity: "Quantity", packageSize: "Package size", availability: "Availability", ingredients: "Ingredients", storage: "Storage",
    description: "Description", related: "You may also like", per: "per", total: "Total", chooseSize: "Choose a package size", notFound: "Product not found",
    increase: "Increase quantity", decrease: "Decrease quantity", gallery: "Product images", priceOnRequest: "Price on request", pack: "pack",
  },
  cart: {
    title: "Your cart", open: "Open cart", empty: "Your cart is empty", emptyHint: "Add products to build your order.", continueShopping: "Continue shopping",
    remove: "Remove", clear: "Clear cart", clearConfirm: "Remove all items from your cart?", cancel: "Cancel", confirmClear: "Yes, clear cart",
    unitPrice: "Unit price", lineTotal: "Line total", subtotal: "Subtotal", continueToWhatsApp: "Continue to WhatsApp",
    note: "Final order, stock availability, delivery charges and fulfilment will be confirmed by the business. Opening WhatsApp does not place the order: you must press Send in WhatsApp.",
    fixIssues: "Remove or fix the highlighted items to continue.", updating: "Updating prices…",
    notConfigured: "WhatsApp ordering isn't available right now. Please try again later.",
    issue: {
      unavailable: "No longer available", variant_unavailable: "This package size is no longer available", no_price: "Price not available",
      out_of_stock: "Out of stock", invalid_quantity: "Quantity not valid for this product",
    },
    items: "items", item: "item",
  },
  footer: { quickLinks: "Quick links", contact: "Contact", followUs: "Follow us", developedBy: "Developed by", rights: "All rights reserved." },
  errors: { notFoundTitle: "Page not found", notFoundText: "The page you are looking for does not exist.", goHome: "Go to homepage" },
};

export type Dict = typeof en;

export const ta: Dict = {
  nav: { home: "முகப்பு", shop: "கடை", cart: "கூடை", search: "தேடல்", searchPlaceholder: "அரிசி, தானியங்கள், சிறுதானியங்கள் தேடுங்கள்…", menu: "மெனு", close: "மூடு", language: "மொழி", skip: "உள்ளடக்கத்திற்குச் செல்" },
  common: {
    loading: "ஏற்றுகிறது…", retry: "மீண்டும் முயற்சிக்கவும்", viewDetails: "விவரம் பார்க்க", addToCart: "கூடையில் சேர்", added: "சேர்க்கப்பட்டது",
    inStock: "இருப்பு உள்ளது", limited: "குறைந்த இருப்பு", outOfStock: "இருப்பு இல்லை", tamilPending: "தமிழ் மொழிபெயர்ப்பு நிலுவையில் உள்ளது",
    from: "தொடக்க விலை", each: "ஒன்றுக்கு", back: "பின்செல்", next: "அடுத்து", previous: "முந்தையது", page: "பக்கம்", of: "/", placeholderImage: "மாதிரிப் படம்",
    somethingWrong: "ஏதோ தவறு நடந்துவிட்டது", somethingWrongHint: "இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  },
  home: {
    heroLead: "பாரம்பரிய அரிசி வகைகள், தானியங்கள், சிறுதானியங்கள் — நேரடியாக வாட்ஸ்அப்பில் ஆர்டர் செய்யுங்கள்.",
    shopNow: "இப்போதே வாங்க", browseCategories: "வகைகளைப் பார்க்க",
    categoriesTitle: "வகை வாரியாக வாங்குங்கள்", featuredTitle: "சிறப்புப் பொருட்கள்", viewAll: "அனைத்தும் பார்க்க",
    howTitle: "ஆர்டர் செய்வது எப்படி",
    steps: [
      { title: "தேர்ந்தெடுங்கள்", text: "பட்டியலில் இருந்து பொருட்களைத் தேர்ந்தெடுங்கள்." },
      { title: "கூடையில் சேருங்கள்", text: "விரும்பிய அளவு பொருட்களைச் சேர்க்கலாம்." },
      { title: "வாட்ஸ்அப்பில் தொடருங்கள்", text: "உங்கள் முழு ஆர்டரும் அனுப்பத் தயாரான செய்தியாகத் திறக்கும்." },
      { title: "நாங்கள் உறுதிசெய்வோம்", text: "இருப்பு மற்றும் டெலிவரி கட்டணத்தை உங்களிடம் உறுதிசெய்வோம்." },
    ],
    aboutTitle: "எங்களைப் பற்றி", qualityTitle: "எங்கள் பொருட்கள்",
    contactTitle: "கேள்விகள் உள்ளதா? வாட்ஸ்அப்பில் தொடர்பு கொள்ளுங்கள்", contactText: "பொருட்கள், இருப்பு, டெலிவரி பற்றிக் கேளுங்கள்.", chatNow: "வாட்ஸ்அப்பில் பேச",
    noCategories: "வகைகள் சேர்க்கப்பட்டவுடன் இங்கே தோன்றும்.", noProducts: "பொருட்கள் விரைவில் இங்கே தோன்றும்.",
  },
  shop: {
    title: "அனைத்துப் பொருட்கள்", searchResults: "தேடல் முடிவுகள்:", allCategories: "அனைத்து வகைகள்", category: "வகை", sort: "வரிசைப்படுத்து",
    sortDefault: "சிறப்பு வரிசை", sortPriceAsc: "விலை: குறைவு முதல் அதிகம்", sortPriceDesc: "விலை: அதிகம் முதல் குறைவு",
    results: "பொருட்கள்", noResults: "உங்கள் தேடலுக்குப் பொருந்தும் பொருட்கள் இல்லை", noResultsHint: "வேறு சொல்லில் தேடுங்கள் அல்லது வடிகட்டிகளை நீக்குங்கள்.",
    clearFilters: "வடிகட்டிகளை நீக்கு", noProductsYet: "இன்னும் பொருட்கள் இல்லை", noProductsYetHint: "விரைவில் மீண்டும் வாருங்கள்.", filters: "வடிகட்டிகள்",
  },
  product: {
    breadcrumbHome: "முகப்பு", quantity: "அளவு", packageSize: "பொட்டல அளவு", availability: "இருப்பு நிலை", ingredients: "மூலப்பொருட்கள்", storage: "சேமிக்கும் முறை",
    description: "விளக்கம்", related: "இவையும் பிடிக்கலாம்", per: "ஒன்றுக்கு", total: "மொத்தம்", chooseSize: "பொட்டல அளவைத் தேர்ந்தெடுங்கள்", notFound: "பொருள் கிடைக்கவில்லை",
    increase: "அளவை அதிகரி", decrease: "அளவைக் குறை", gallery: "பொருள் படங்கள்", priceOnRequest: "விலை கேட்டால் தெரிவிக்கப்படும்", pack: "பொட்டலம்",
  },
  cart: {
    title: "உங்கள் கூடை", open: "கூடையைத் திற", empty: "உங்கள் கூடை காலியாக உள்ளது", emptyHint: "ஆர்டருக்கான பொருட்களைச் சேருங்கள்.", continueShopping: "தொடர்ந்து வாங்க",
    remove: "நீக்கு", clear: "கூடையை காலி செய்", clearConfirm: "கூடையில் உள்ள அனைத்துப் பொருட்களையும் நீக்கவா?", cancel: "ரத்து செய்", confirmClear: "ஆம், காலி செய்",
    unitPrice: "ஒரு அலகு விலை", lineTotal: "மொத்தம்", subtotal: "கூடுதல் தொகை", continueToWhatsApp: "வாட்ஸ்அப்பில் தொடர",
    note: "இறுதி ஆர்டர், இருப்பு, டெலிவரி கட்டணம் மற்றும் விநியோகம் ஆகியவற்றை நிறுவனம் உறுதிசெய்யும். வாட்ஸ்அப் திறப்பதால் ஆர்டர் பதிவாகாது; வாட்ஸ்அப்பில் நீங்கள் அனுப்பு (Send) அழுத்த வேண்டும்.",
    fixIssues: "தொடர, குறிக்கப்பட்ட பொருட்களை நீக்கவும் அல்லது சரிசெய்யவும்.", updating: "விலைகளைப் புதுப்பிக்கிறது…",
    notConfigured: "வாட்ஸ்அப் ஆர்டர் இப்போது கிடைக்கவில்லை. பின்னர் முயற்சிக்கவும்.",
    issue: {
      unavailable: "இனி கிடைக்கவில்லை", variant_unavailable: "இந்த பொட்டல அளவு இனி கிடைக்கவில்லை", no_price: "விலை கிடைக்கவில்லை",
      out_of_stock: "இருப்பு இல்லை", invalid_quantity: "இந்தப் பொருளுக்கு இந்த அளவு சரியல்ல",
    },
    items: "பொருட்கள்", item: "பொருள்",
  },
  footer: { quickLinks: "விரைவு இணைப்புகள்", contact: "தொடர்புக்கு", followUs: "எங்களைப் பின்தொடருங்கள்", developedBy: "உருவாக்கியவர்", rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை." },
  errors: { notFoundTitle: "பக்கம் கிடைக்கவில்லை", notFoundText: "நீங்கள் தேடும் பக்கம் இல்லை.", goHome: "முகப்புப் பக்கத்திற்குச் செல்" },
};

export const dictionaries = { en, ta } as const;
