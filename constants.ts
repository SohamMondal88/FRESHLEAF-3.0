
import { Product, BlogPost, Testimonial, Order } from './types';

// Helper to create products with 3 images
const createProduct = (
  id: string, 
  en: string, 
  hi: string, 
  bn: string, 
  cat: string, 
  price: number, 
  imgMain: string, 
  desc: string = 'Fresh and high quality produce sourced directly from farmers.',
  baseUnit: string = 'kg',
  flags: { isNew?: boolean; isOrganic?: boolean; isLocal?: boolean } = {}
): Product => {
  // Generate 2 extra variation images by appending random query params to Unsplash URLs 
  // or using generic food fallbacks if the main img isn't Unsplash.
  // For this demo, we assume Unsplash URLs and tweak params for variety.
  const gallery = [
    imgMain,
    `${imgMain}&fp-x=0.5&fp-y=0.5&fit=crop&crop=focalpoint&w=800&h=800&q=80`, // Zoomed/Cropped variation
    `${imgMain}&sat=-20&con=10&w=800&q=80` // Different lighting variation
  ];

  return {
    id,
    name: { en, hi, bn },
    price,
    oldPrice: Math.round(price * 1.25),
    category: cat,
    image: imgMain,
    gallery: gallery,
    description: desc,
    inStock: true,
    rating: 4.5 + (Math.random() * 0.5),
    reviews: Math.floor(Math.random() * 500) + 50,
    baseUnit,
    ...flags
  };
};

export const PRODUCTS: Product[] = [
// --- FRUITS ---
createProduct(
  'f-1', 'Apple Washington', 'वाशिंगटन सेब', 'ওয়াশিংটন আপেল',
  'Imported Fruit', 135,
  './images/apple.png',
  'Crisp and sweet Washington apples.', 'kg'
),

createProduct(
  'f-2', 'Apple Shimla', 'शिमला सेब', 'শিমলা আপেল',
  'Apple', 115,
  './images/apple.png',
  'Fresh apples from Shimla orchards.', 'kg', { isLocal: true }
),

createProduct(
  'f-3', 'Apple Green', 'हरा सेब', 'সবুজ আপেল',
  'Apple', 165,
  './images/apple.png',
  'Tangy and crunchy green apples.', 'kg'
),

createProduct(
  'f-4', 'Apricot', 'खुबानी', 'এপ্রিকট',
  'Stone Fruit', 175,
  './images/apricot.png',
  'Sweet and velvety apricots.', 'kg'
),

createProduct(
  'f-5', 'Avocado', 'एवोकाडो', 'অ্যাভোকাডো',
  'Exotic', 205,
  './images/avocado.png',
  'Creamy butter fruit.', 'pc', { isNew: true }
),

createProduct(
  'f-6', 'Banana Morris', 'मॉरिस केला', 'মরিস কলা',
  'Banana', 31,
  './images/Banana-Morris.png',
  'Sweet Morris bananas.', 'kg'
),

createProduct(
  'f-7', 'Banana', 'केला', 'কলা',
  'Banana', 63,
  './images/banana.png',
  'Regular Cavendish bananas.', 'kg'
),

createProduct(
  'f-8', 'Banana Poovam', 'पूवन केला', 'পুভাম কলা',
  'Banana', 63,
  './images/Banana-Poovam.png',
  'Small sweet Poovam bananas.', 'kg'
),

createProduct(
  'f-9', 'Cantaloupe', 'खरबूजा', 'খরমুজ',
  'Melon', 31,
  './images/Cantaloupe.png',
  'Sweet muskmelon.', 'kg'
),

createProduct(
  'f-10', 'Custard Apple', 'सीताफल', 'আতা',
  'Tropical', 57,
  './images/Custard-Apple.png',
  'Creamy custard apples.', 'kg', { isLocal: true }
),

createProduct(
  'f-11', 'Gooseberry', 'आंवला', 'আমলকী',
  'Berry', 115,
  './images/Gooseberry.png',
  'Vitamin C rich Amla.', 'kg'
),

createProduct(
  'f-12', 'Grapes Black', 'काले अंगूर', 'কালো আঙ্গুর',
  'Grapes', 85,
  './images/grapesblack.png',
  'Seedless black grapes.', 'kg'
),

createProduct(
  'f-13', 'Grapes Green', 'हरे अंगूर', 'সবুজ আঙ্গুর',
  'Grapes', 95,
  './images/grapesgreen.png',
  'Sweet green grapes.', 'kg'
),

createProduct(
  'f-14', 'Guava', 'अमरूद', 'পেয়ারা',
  'Tropical', 56,
  './images/guava.png',
  'Fresh Indian guava.', 'kg'
),

createProduct(
  'f-15', 'Jackfruit', 'कटहल', 'কাঁঠাল',
  'Tropical', 85,
  './images/jackfruit.png',
  'Raw or ripe jackfruit.', 'kg'
),

createProduct(
  'f-16', 'Lychee', 'लीची', 'লিচু',
  'Exotic', 215,
  './images/lychee.png',
  'Sweet juicy lychees.', 'kg'
),

createProduct(
  'f-17', 'Mango', 'आम', 'আম',
  'Mango', 102,
  './images/mango.png',
  'King of fruits.', 'kg'
),

createProduct(
  'f-18', 'Orange', 'संतरा', 'কমলা',
  'Citrus', 70,
  './images/orange.png',
  'Fresh Nagpur oranges.', 'kg'
),

createProduct(
  'f-19', 'Papaya', 'पपीता', 'পেঁপে',
  'Tropical', 38,
  './images/papaya.png',
  'Ripe sweet papaya.', 'pc'
),

createProduct(
  'f-20', 'Pears', 'नाशपाती', 'নাশপাতি',
  'Imported Fruit', 97,
  './images/pear.png',
  'Imported pears.', 'kg'
),

createProduct(
  'f-21', 'Pineapple', 'अननास', 'আনারস',
  'Tropical', 35,
  './images/pineapple.png',
  'Fresh pineapple.', 'pc'
),

createProduct(
  'f-22', 'Pomegranate Kabul', 'काबुली अनार', 'কাবুলি বেদানা',
  'Exotic', 125,
  './images/Pomegranate-Kabul.png',
  'Deep red pomegranate.', 'kg'
),

createProduct(
  'f-23', 'Sapota', 'चीकू', 'সবেদা',
  'Tropical', 55,
  './images/Sapota.png',
  'Sweet sapota (Chiku).', 'kg'
),

createProduct(
  'f-24', 'Sugar Cane', 'गन्ना', 'আঁখ',
  'Other', 30,
  './images/sugarcane.png',
  'Fresh sugar cane stalks.', 'pc'
),

createProduct(
  'f-25', 'Sweet Lime (Mosambi)', 'मौसम्बी', 'মৌসাম্বি',
  'Citrus', 50,
  './images/mosambi.png',
  'Juicy sweet lime.', 'kg'
),

createProduct(
  'f-26', 'Watermelon', 'तरबूज', 'তরমুজ',
  'Melon', 28,
  './images/watermelon.png',
  'Dark green watermelon.', 'pc'
),

  // --- VEGETABLES ---
  createProduct('v-1', 'Onion Big', 'बड़ा प्याज', 'বড় পেঁয়াজ', 'Bulb', 34, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80', 'Large red onions.', 'kg'),
  createProduct('v-2', 'Onion Small', 'छोटा प्याज', 'ছোট পেঁয়াজ', 'Bulb', 53, 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=800&q=80', 'Small sambar onions.', 'kg'),
  createProduct('v-3', 'Tomato', 'टमाटर', 'টমেটো', 'Fruit Veg', 51, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', 'Ripe red tomatoes.', 'kg'),
  createProduct('v-4', 'Green Chilli', 'हरी मिर्च', 'কাঁচা লঙ্কা', 'Fruit Veg', 45, 'https://images.unsplash.com/photo-1560163353-93630f9a244b?auto=format&fit=crop&w=800&q=80', 'Spicy green chillies.', 'kg'),
  createProduct('v-5', 'Beetroot', 'चुकंदर', 'বিট', 'Root Veg', 35, 'https://images.unsplash.com/photo-1596489853965-7467ba605663?auto=format&fit=crop&w=800&q=80', 'Fresh beetroot.', 'kg'),
  createProduct('v-6', 'Potato', 'आलू', 'আলু', 'Root Veg', 41, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80', 'Standard potatoes.', 'kg'),
  createProduct('v-7', 'Raw Banana (Plantain)', 'कच्चा केला', 'কাঁচ কলা', 'Other Veg', 17, 'https://images.unsplash.com/photo-1588613309228-3e4b3017a782?auto=format&fit=crop&w=800&q=80', 'Green plantains for cooking.', 'pc'),
  createProduct('v-8', 'Amaranth Leaves', 'चौलाई', 'নটে শাক', 'Leafy', 21, 'https://images.unsplash.com/photo-1550411294-b3b1bd5fce1b?auto=format&fit=crop&w=800&q=80', 'Fresh red/green amaranth.', 'bunch'),
  createProduct('v-9', 'Amla', 'आंवला', 'আমলকী', 'Other Veg', 90, 'https://images.unsplash.com/photo-1603208761073-2b2207908d07?auto=format&fit=crop&w=800&q=80', 'Indian gooseberry.', 'kg'),
  createProduct('v-10', 'Ash Gourd', 'पेठा', 'চাল কুমড়া', 'Other Veg', 22, 'https://images.unsplash.com/photo-1469324707621-3e0e7195d45d?auto=format&fit=crop&w=800&q=80', 'Winter melon.', 'kg'),
  createProduct('v-11', 'Baby Corn', 'बेबी कॉर्न', 'বেবি কর্ন', 'Other Veg', 57, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', 'Tender corn cobs.', 'kg'),
  createProduct('v-12', 'Banana Flower', 'केले का फूल', 'মোচা', 'Other Veg', 23, 'https://images.unsplash.com/photo-1602497864303-34e8ce978749?auto=format&fit=crop&w=800&q=80', 'Fresh banana flower.', 'pc'),
  createProduct('v-13', 'Capsicum', 'शिमला मिर्च', 'क্যাপসিকাম', 'Fruit Veg', 45, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80', 'Green bell pepper.', 'kg'),
  createProduct('v-14', 'Bitter Gourd', 'करेला', 'করলা', 'Fruit Veg', 41, 'https://images.unsplash.com/photo-1598025362874-49480e041cce?auto=format&fit=crop&w=800&q=80', 'Karela.', 'kg'),
  createProduct('v-15', 'Bottle Gourd', 'लौकी', 'लाউ', 'Fruit Veg', 41, 'https://plus.unsplash.com/premium_photo-1675237625683-1c39d8920199?auto=format&fit=crop&w=800&q=80', 'Lauki.', 'pc'),
  createProduct('v-16', 'Butter Beans', 'मक्खन सेम', 'শিম', 'Beans/Legumes', 52, 'https://images.unsplash.com/photo-1622206151226-18ca0c960306?auto=format&fit=crop&w=800&q=80', 'Large lima beans.', 'kg'),
  createProduct('v-17', 'Broad Beans', 'बड़ी सेम', 'শিম', 'Beans/Legumes', 43, 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&w=800&q=80', 'Fresh broad beans.', 'kg'),
  createProduct('v-18', 'Cabbage', 'पत्ता गोभी', 'বাঁধাকপি', 'Leafy', 34, 'https://images.unsplash.com/photo-1551154881-30d0d8299281?auto=format&fit=crop&w=800&q=80', 'Green cabbage.', 'pc'),
  createProduct('v-19', 'Carrot', 'गाजर', 'গাজর', 'Root Veg', 43, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', 'Orange carrots.', 'kg'),
  createProduct('v-20', 'Cauliflower', 'फूलगोभी', 'ফুলকপি', 'Flower Veg', 31, 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80', 'Fresh cauliflower.', 'pc'),
  createProduct('v-21', 'Cluster Beans', 'ग्वार फली', 'গওয়ার ফলি', 'Beans/Legumes', 50, 'https://images.unsplash.com/photo-1592394533824-9436d7d25407?auto=format&fit=crop&w=800&q=80', 'Guar beans.', 'kg'),
  createProduct('v-22', 'Coconut', 'नारियल', 'নারকেল', 'Other Veg', 70, 'https://images.unsplash.com/photo-1596434441559-99e535c3453b?auto=format&fit=crop&w=800&q=80', 'Coconut with husk.', 'pc'),
  createProduct('v-23', 'Colocasia Leaves', 'अरबी के पत्ते', 'কচু শাক', 'Leafy', 18, 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80', 'Arbi leaves.', 'bunch'),
  createProduct('v-24', 'Colocasia', 'अरबी', 'কচু', 'Root Veg', 33, 'https://images.unsplash.com/photo-1635332679679-242617757996?auto=format&fit=crop&w=800&q=80', 'Taro roots.', 'kg'),
  createProduct('v-25', 'Coriander Leaves', 'धनिया', 'ধনে পাতা', 'Leafy', 18, 'https://images.unsplash.com/photo-1588879464312-3277cb797d74?auto=format&fit=crop&w=800&q=80', 'Fresh dhaniya.', 'bunch'),
  createProduct('v-26', 'Corn', 'भुट्टा', 'ভুট্টা', 'Other Veg', 33, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', 'Sweet corn.', 'pc'),
  createProduct('v-27', 'Cucumber', 'खीरा', 'শসা', 'Fruit Veg', 31, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=800&q=80', 'Green cucumber.', 'kg'),
  createProduct('v-28', 'Curry Leaves', 'करी पत्ता', 'কারিপাতা', 'Leafy', 30, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', 'Fresh curry leaves.', 'bunch'),
  createProduct('v-29', 'Dill Leaves', 'सोया मेथी', 'শুল্ফা শাক', 'Leafy', 18, 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=800&q=80', 'Fresh dill.', 'bunch'),
  createProduct('v-30', 'Drumsticks', 'सहजन', 'সজনে ডাঁটা', 'Fruit Veg', 65, 'https://images.unsplash.com/photo-1561053720-76cd737463d3?auto=format&fit=crop&w=800&q=80', 'Moringa pods.', 'kg'),
  createProduct('v-31', 'Brinjal', 'बैंगन', 'বেগুন', 'Fruit Veg', 40, 'https://images.unsplash.com/photo-1615484477780-d6c299c8332d?auto=format&fit=crop&w=800&q=80', 'Small eggplants.', 'kg'),
  createProduct('v-32', 'Brinjal (Big)', 'बड़ा बैंगन', 'বড় বেগুন', 'Fruit Veg', 52, 'https://images.unsplash.com/photo-1599347893701-34440026e792?auto=format&fit=crop&w=800&q=80', 'Large roasting brinjal.', 'kg'),
  createProduct('v-33', 'Elephant Yam', 'जिमीकंद', 'ওল', 'Root Veg', 50, 'https://images.unsplash.com/photo-1633959603598-636952777329?auto=format&fit=crop&w=800&q=80', 'Suran/Yam.', 'kg'),
  createProduct('v-34', 'Fenugreek Leaves', 'मेथी', 'মেথি শাক', 'Leafy', 16, 'https://images.unsplash.com/photo-1588879464312-3277cb797d74?auto=format&fit=crop&w=800&q=80', 'Fresh Methi leaves.', 'bunch'),
  createProduct('v-35', 'French Beans', 'फ्रेंच बीन्स', 'বিনস', 'Beans/Legumes', 59, 'https://images.unsplash.com/photo-1592394533824-9436d7d25407?auto=format&fit=crop&w=800&q=80', 'Green beans.', 'kg'),
  createProduct('v-36', 'Garlic', 'लहसुन', 'রসুন', 'Bulb', 103, 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80', 'Fresh garlic.', 'kg'),
  createProduct('v-37', 'Ginger', 'अदरक', 'आदा', 'Root Veg', 77, 'https://images.unsplash.com/photo-1635839958022-7221b6559385?auto=format&fit=crop&w=800&q=80', 'Root ginger.', 'kg'),
  createProduct('v-38', 'Onion Green', 'हरा प्याज', 'পেঁয়াজ কলি', 'Leafy', 45, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80', 'Spring onions.', 'bunch'),
  createProduct('v-39', 'Green Peas', 'मटर', 'মটরশুঁটি', 'Beans/Legumes', 54, 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=800&q=80', 'Fresh peas.', 'kg'),
  createProduct('v-40', 'Ivy Gourd', 'कुंदरू', 'কুঁদরি', 'Fruit Veg', 37, 'https://images.unsplash.com/photo-1605307393433-437537307062?auto=format&fit=crop&w=800&q=80', 'Tindora.', 'kg'),
  createProduct('v-41', 'Lemon (Lime)', 'नींबू', 'লেবু', 'Fruit Veg', 59, 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=800&q=80', 'Yellow lemons.', 'kg'),
  createProduct('v-42', 'Mango Raw', 'कच्चा आम', 'কাঁচা আম', 'Fruit Veg', 51, 'https://images.unsplash.com/photo-1621961048738-a296d933be75?auto=format&fit=crop&w=800&q=80', 'Green mango for pickle.', 'kg'),
  createProduct('v-43', 'Mint Leaves', 'पुदीना', 'পুদিনা পাতা', 'Leafy', 10, 'https://images.unsplash.com/photo-1609124973516-724bc2407567?auto=format&fit=crop&w=800&q=80', 'Fresh pudina.', 'bunch'),
  createProduct('v-44', 'Mushroom', 'मशरूम', 'মাশরুম', 'Other Veg', 89, 'https://images.unsplash.com/photo-1504387432042-6bf78b2459a2?auto=format&fit=crop&w=800&q=80', 'Button mushrooms.', 'kg'),
  createProduct('v-45', 'Mustard Leaves', 'सरसों का साग', 'সরিষা শাক', 'Leafy', 23, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80', 'Sarson leaves.', 'bunch'),
  createProduct('v-46', 'Ladies Finger', 'भिंडी', 'ঢেঁড়স', 'Fruit Veg', 43, 'https://images.unsplash.com/photo-1425543103986-226d3d8db61e?auto=format&fit=crop&w=800&q=80', 'Okra.', 'kg'),
  createProduct('v-47', 'Pumpkin', 'कद्दू', 'কুমড়া', 'Other Veg', 27, 'https://images.unsplash.com/photo-1570586437263-ab629fbd8181?auto=format&fit=crop&w=800&q=80', 'Yellow pumpkin.', 'kg'),
  createProduct('v-48', 'Radish', 'मूली', 'মূলা', 'Root Veg', 33, 'https://images.unsplash.com/photo-1590623359560-59f6be2b6510?auto=format&fit=crop&w=800&q=80', 'White radish.', 'kg'),
  createProduct('v-49', 'Ridge Gourd', 'तोरई', 'ঝিঙে', 'Fruit Veg', 42, 'https://images.unsplash.com/photo-1598025362874-49480e041cce?auto=format&fit=crop&w=800&q=80', 'Torai.', 'kg'),
  createProduct('v-50', 'Shallot (Pearl Onion)', 'सांभर प्याज', 'ছোট পেঁয়াজ', 'Bulb', 45, 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=800&q=80', 'Pearl onions.', 'kg'),
  createProduct('v-51', 'Snake Gourd', 'चिचिंडा', 'চিচিঙ্গা', 'Fruit Veg', 37, 'https://images.unsplash.com/photo-1563865436874-99d1ca6e327b?auto=format&fit=crop&w=800&q=80', 'Long snake gourd.', 'kg'),
  createProduct('v-52', 'Sorrel Leaves', 'खट्टी भाजी', 'টক শাক', 'Leafy', 17, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80', 'Sour spinach.', 'bunch'),
  createProduct('v-53', 'Spinach', 'पालक', 'পালং শাক', 'Leafy', 16, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80', 'Fresh spinach.', 'bunch'),
  createProduct('v-54', 'Sweet Potato', 'शकरकंद', 'মিষ্টি আলু', 'Root Veg', 65, 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=800&q=80', 'Red sweet potato.', 'kg'),
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Benefits of Organic Farming in India',
    excerpt: 'Discover how organic farming helps the soil and provides healthier produce for your family. A deep dive into sustainable practices.',
    date: 'Oct 12, 2023',
    author: 'Dr. R. Sharma',
    authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    image: 'https://images.unsplash.com/photo-1625246333195-58197bd47d72?auto=format&fit=crop&w=600&q=80',
    category: 'Farming',
    readTime: '5 min read',
    tags: ['Organic', 'Sustainability', 'India']
  },
  {
    id: '2',
    title: 'Seasonal Fruits You Must Try This Summer',
    excerpt: 'Beat the heat with these hydrating and delicious seasonal fruits available now. From Mangoes to Watermelons.',
    date: 'Sep 28, 2023',
    author: 'Priya Patel',
    authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    category: 'Health',
    readTime: '4 min read',
    tags: ['Fruits', 'Summer', 'Diet']
  },
  {
    id: '3',
    title: '5 Healthy Smoothies for Breakfast',
    excerpt: 'Quick and easy recipes to start your day with a boost of energy. Includes Spinach power mix and Berry blast.',
    date: 'Sep 15, 2023',
    author: 'Amit Roy',
    authorAvatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=600&q=80',
    category: 'Recipes',
    readTime: '6 min read',
    tags: ['Smoothie', 'Breakfast', 'Easy']
  },
  {
    id: '4',
    title: 'Understanding Hydroponics: The Future of Greens',
    excerpt: 'How soil-less farming is revolutionizing urban agriculture and delivering cleaner, pesticide-free leafy greens.',
    date: 'Aug 22, 2023',
    author: 'Vikram Singh',
    authorAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=600&q=80',
    category: 'Farming',
    readTime: '7 min read',
    tags: ['Tech', 'Hydroponics', 'Future']
  },
  {
    id: '5',
    title: 'The Secret to Keeping Vegetables Fresh Longer',
    excerpt: 'Simple kitchen hacks to extend the shelf life of your leafy greens and root vegetables. Stop wasting food today!',
    date: 'Aug 10, 2023',
    author: 'Sita Verma',
    authorAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    image: 'https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=600&q=80',
    category: 'Tips',
    readTime: '3 min read',
    tags: ['Kitchen', 'Storage', 'Hacks']
  },
  {
    id: '6',
    title: 'Why "Farm-to-Table" Matters',
    excerpt: 'Exploring the economic and health impact of sourcing directly from local farmers. Support local, eat fresh.',
    date: 'Jul 05, 2023',
    author: 'Dr. R. Sharma',
    authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    category: 'Farming',
    readTime: '5 min read',
    tags: ['Community', 'Economy', 'Fresh']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Anjali Gupta',
    location: 'Mumbai',
    comment: 'The quality of FreshLeaf vegetables is unmatched. The delivery is always on time!',
    rating: 5
  },
  {
    id: '2',
    name: 'Rahul Sen',
    location: 'Kolkata',
    comment: 'I love the bilingual names. It helps my mother order easily. Great initiative.',
    rating: 5
  },
  {
    id: '3',
    name: 'Vikram Singh',
    location: 'Delhi',
    comment: 'Fresh mangoes were perfectly packed. Will definitely order again.',
    rating: 4
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'FL-2023-8991',
    userId: 'mock-user-1',
    date: 'Oct 15, 2023',
    total: 350,
    status: 'Delivered',
    items: [
      { ...PRODUCTS[0], quantity: 2, selectedUnit: '1kg' }, 
      { ...PRODUCTS[2], quantity: 5, selectedUnit: '1kg' }  
    ],
    paymentMethod: 'Cash on Delivery',
    address: '123 Main St, Metro City, 110001'
  },
  {
    id: 'FL-2023-9021',
    userId: 'mock-user-1',
    date: 'Oct 20, 2023',
    total: 1020,
    status: 'Out for Delivery',
    trackingId: 'TRK-9021-LIVE',
    items: [
      { ...PRODUCTS[18], quantity: 2, selectedUnit: '1kg' },
      { ...PRODUCTS[22], quantity: 1, selectedUnit: '1kg' } 
    ],
    paymentMethod: 'Online Payment',
    address: '123 Main St, Metro City, 110001'
  }
];