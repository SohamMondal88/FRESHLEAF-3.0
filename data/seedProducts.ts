import { Product } from '../types';

type RawProduct = {
  id: string;
  englishName: string;
  hindiName: string;
  bengaliName: string;
  category: string;
  price: number;
  unit: string;
};

const rawProducts: RawProduct[] = [
  { id: 'f-1', englishName: 'Apple Washington', hindiName: 'वाशिंगटन सेब', bengaliName: 'ওয়াশিংটন আপেল', category: 'Imported Fruit', price: 135, unit: 'kg' },
  { id: 'f-2', englishName: 'Apple Shimla', hindiName: 'शिमला सेब', bengaliName: 'শিমলা আপেল', category: 'Apple', price: 115, unit: 'kg' },
  { id: 'f-3', englishName: 'Apple Green', hindiName: 'हरा सेब', bengaliName: 'সবুজ আপেল', category: 'Apple', price: 165, unit: 'kg' },
  { id: 'f-4', englishName: 'Apricot', hindiName: 'खुबानी', bengaliName: 'এপ্রিকট', category: 'Stone Fruit', price: 175, unit: 'kg' },
  { id: 'f-5', englishName: 'Avocado', hindiName: 'एवोकाडो', bengaliName: 'অ্যাভোকাডো', category: 'Exotic', price: 205, unit: 'pc' },
  { id: 'f-6', englishName: 'Banana Morris', hindiName: 'मॉरिस केला', bengaliName: 'মরিস কলা', category: 'Banana', price: 31, unit: 'kg' },
  { id: 'f-7', englishName: 'Banana', hindiName: 'केला', bengaliName: 'কলা', category: 'Banana', price: 63, unit: 'kg' },
  { id: 'f-8', englishName: 'Banana Poovam', hindiName: 'पूवन केला', bengaliName: 'পুভাম কলা', category: 'Banana', price: 63, unit: 'kg' },
  { id: 'f-9', englishName: 'Cantaloupe', hindiName: 'खरबूजा', bengaliName: 'খরমুজ', category: 'Melon', price: 31, unit: 'kg' },
  { id: 'f-10', englishName: 'Custard Apple', hindiName: 'सीताफल', bengaliName: 'আতা', category: 'Tropical', price: 57, unit: 'kg' },
  { id: 'f-11', englishName: 'Gooseberry', hindiName: 'आंवला', bengaliName: 'আমলকী', category: 'Berry', price: 115, unit: 'kg' },
  { id: 'f-12', englishName: 'Grapes Black', hindiName: 'काले अंगूर', bengaliName: 'কালো আঙ্গুর', category: 'Grapes', price: 85, unit: 'kg' },
  { id: 'f-13', englishName: 'Grapes Green', hindiName: 'हरे अंगूर', bengaliName: 'সবুজ আঙ্গুর', category: 'Grapes', price: 95, unit: 'kg' },
  { id: 'f-14', englishName: 'Guava', hindiName: 'अमरूद', bengaliName: 'পেয়ারা', category: 'Tropical', price: 56, unit: 'kg' },
  { id: 'f-15', englishName: 'Jackfruit', hindiName: 'कटहल', bengaliName: 'কাঁঠাল', category: 'Tropical', price: 85, unit: 'kg' },
  { id: 'f-16', englishName: 'Lychee', hindiName: 'लीची', bengaliName: 'লিচু', category: 'Exotic', price: 215, unit: 'kg' },
  { id: 'f-17', englishName: 'Mango', hindiName: 'आम', bengaliName: 'আম', category: 'Mango', price: 102, unit: 'kg' },
  { id: 'f-18', englishName: 'Orange', hindiName: 'संतरा', bengaliName: 'কমলা', category: 'Citrus', price: 70, unit: 'kg' },
  { id: 'f-19', englishName: 'Papaya', hindiName: 'पपीता', bengaliName: 'পেঁপে', category: 'Tropical', price: 38, unit: 'pc' },
  { id: 'f-20', englishName: 'Pears', hindiName: 'नाशपाती', bengaliName: 'নাশপাতি', category: 'Imported Fruit', price: 97, unit: 'kg' },
  { id: 'f-21', englishName: 'Pineapple', hindiName: 'अननास', bengaliName: 'আনারস', category: 'Tropical', price: 35, unit: 'pc' },
  { id: 'f-22', englishName: 'Pomegranate Kabul', hindiName: 'काबुली अनार', bengaliName: 'কাবুলি বেদানা', category: 'Exotic', price: 125, unit: 'kg' },
  { id: 'f-23', englishName: 'Sapota', hindiName: 'चीकू', bengaliName: 'সবেদা', category: 'Tropical', price: 55, unit: 'kg' },
  { id: 'f-24', englishName: 'Sugar Cane', hindiName: 'गन्ना', bengaliName: 'আঁখ', category: 'Other', price: 30, unit: 'pc' },
  { id: 'f-25', englishName: 'Sweet Lime (Mosambi)', hindiName: 'मौसम्बी', bengaliName: 'মৌসাম্বি', category: 'Citrus', price: 50, unit: 'kg' },
  { id: 'f-26', englishName: 'Watermelon', hindiName: 'तरबूज', bengaliName: 'তরমুজ', category: 'Melon', price: 28, unit: 'pc' },

  { id: 'v-1', englishName: 'Onion Big', hindiName: 'बड़ा प्याज', bengaliName: 'বড় পেঁয়াজ', category: 'Bulb', price: 34, unit: 'kg' },
  { id: 'v-2', englishName: 'Onion Small', hindiName: 'छोटा प्याज', bengaliName: 'ছোট পেঁয়াজ', category: 'Bulb', price: 53, unit: 'kg' },
  { id: 'v-3', englishName: 'Tomato', hindiName: 'टमाटर', bengaliName: 'টমেটো', category: 'Fruit Veg', price: 51, unit: 'kg' },
  { id: 'v-4', englishName: 'Green Chilli', hindiName: 'हरी मिर्च', bengaliName: 'কাঁচা লঙ্কা', category: 'Fruit Veg', price: 45, unit: 'kg' },
  { id: 'v-5', englishName: 'Beetroot', hindiName: 'चुकंदर', bengaliName: 'বিট', category: 'Root Veg', price: 35, unit: 'kg' },
  { id: 'v-6', englishName: 'Potato', hindiName: 'आलू', bengaliName: 'আলু', category: 'Root Veg', price: 41, unit: 'kg' },
  { id: 'v-7', englishName: 'Raw Banana', hindiName: 'कच्चा केला', bengaliName: 'কাঁচ কলা', category: 'Other Veg', price: 17, unit: 'pc' },
  { id: 'v-8', englishName: 'Amaranth Leaves', hindiName: 'चौलाई', bengaliName: 'নটে শাক', category: 'Leafy', price: 21, unit: 'bunch' },
  { id: 'v-9', englishName: 'Amla', hindiName: 'आंवला', bengaliName: 'আমলকী', category: 'Other Veg', price: 90, unit: 'kg' },
  { id: 'v-10', englishName: 'Ash Gourd', hindiName: 'पेठा', bengaliName: 'চাল কুমড়া', category: 'Other Veg', price: 22, unit: 'kg' },
  { id: 'v-11', englishName: 'Baby Corn', hindiName: 'बेबी कॉर्न', bengaliName: 'বেবি কর্ন', category: 'Other Veg', price: 57, unit: 'kg' },
  { id: 'v-12', englishName: 'Banana Flower', hindiName: 'केले का फूल', bengaliName: 'মোচা', category: 'Other Veg', price: 23, unit: 'pc' },
  { id: 'v-13', englishName: 'Capsicum', hindiName: 'शिमला मिर्च', bengaliName: 'ক্যাপসিকাম', category: 'Fruit Veg', price: 45, unit: 'kg' },
  { id: 'v-14', englishName: 'Bitter Gourd', hindiName: 'करेला', bengaliName: 'করলা', category: 'Fruit Veg', price: 41, unit: 'kg' },
  { id: 'v-15', englishName: 'Bottle Gourd', hindiName: 'लौकी', bengaliName: 'লাউ', category: 'Fruit Veg', price: 41, unit: 'pc' },
  { id: 'v-16', englishName: 'Butter Beans', hindiName: 'मक्खन सेम', bengaliName: 'শিম', category: 'Beans/Legumes', price: 52, unit: 'kg' },
  { id: 'v-17', englishName: 'Broad Beans', hindiName: 'बड़ी सेम', bengaliName: 'শিম', category: 'Beans/Legumes', price: 43, unit: 'kg' },
  { id: 'v-18', englishName: 'Cabbage', hindiName: 'पत्ता गोभी', bengaliName: 'বাঁধাকপি', category: 'Leafy', price: 34, unit: 'pc' },
  { id: 'v-19', englishName: 'Carrot', hindiName: 'गाजर', bengaliName: 'গাজর', category: 'Root Veg', price: 43, unit: 'kg' },
  { id: 'v-20', englishName: 'Cauliflower', hindiName: 'फूलगोभी', bengaliName: 'ফুলকপি', category: 'Flower Veg', price: 31, unit: 'pc' },
  { id: 'v-21', englishName: 'Cluster Beans', hindiName: 'ग्वार फली', bengaliName: 'গওয়ার ফলি', category: 'Beans/Legumes', price: 50, unit: 'kg' },
  { id: 'v-22', englishName: 'Coconut', hindiName: 'नारियल', bengaliName: 'নারকেল', category: 'Other Veg', price: 70, unit: 'pc' },
  { id: 'v-23', englishName: 'Colocasia Leaves', hindiName: 'अरबी के पत्ते', bengaliName: 'কচু শাক', category: 'Leafy', price: 18, unit: 'bunch' },
  { id: 'v-24', englishName: 'Colocasia', hindiName: 'अरबी', bengaliName: 'কচু', category: 'Root Veg', price: 33, unit: 'kg' },
  { id: 'v-25', englishName: 'Coriander Leaves', hindiName: 'धनिया', bengaliName: 'ধনে পাতা', category: 'Leafy', price: 18, unit: 'bunch' },
  { id: 'v-26', englishName: 'Corn', hindiName: 'भुट्टा', bengaliName: 'ভুট্টা', category: 'Other Veg', price: 33, unit: 'pc' },
  { id: 'v-27', englishName: 'Cucumber', hindiName: 'खीरा', bengaliName: 'শসা', category: 'Fruit Veg', price: 31, unit: 'kg' },
  { id: 'v-28', englishName: 'Curry Leaves', hindiName: 'करी पत्ता', bengaliName: 'কারিপাতা', category: 'Leafy', price: 30, unit: 'bunch' },
  { id: 'v-29', englishName: 'Dill Leaves', hindiName: 'सोया मेथी', bengaliName: 'শুল্ফা শাক', category: 'Leafy', price: 18, unit: 'bunch' },
  { id: 'v-30', englishName: 'Drumsticks', hindiName: 'सहजन', bengaliName: 'সজনে ডাঁটা', category: 'Fruit Veg', price: 65, unit: 'kg' },
  { id: 'v-31', englishName: 'Brinjal', hindiName: 'बैंगन', bengaliName: 'বেগুন', category: 'Fruit Veg', price: 40, unit: 'kg' },
  { id: 'v-32', englishName: 'Brinjal Big', hindiName: 'बड़ा बैंगन', bengaliName: 'বড় বেগুন', category: 'Fruit Veg', price: 52, unit: 'kg' },
  { id: 'v-33', englishName: 'Elephant Yam', hindiName: 'जिमीकंद', bengaliName: 'ওল', category: 'Root Veg', price: 50, unit: 'kg' },
  { id: 'v-34', englishName: 'Fenugreek Leaves', hindiName: 'मेथी', bengaliName: 'মেথি শাক', category: 'Leafy', price: 16, unit: 'bunch' },
  { id: 'v-35', englishName: 'French Beans', hindiName: 'फ्रेंच बीन्स', bengaliName: 'বিনস', category: 'Beans/Legumes', price: 59, unit: 'kg' },
  { id: 'v-36', englishName: 'Garlic', hindiName: 'लहसुन', bengaliName: 'রসুন', category: 'Bulb', price: 103, unit: 'kg' },
  { id: 'v-37', englishName: 'Ginger', hindiName: 'अदरक', bengaliName: 'আদা', category: 'Root Veg', price: 77, unit: 'kg' },
  { id: 'v-38', englishName: 'Green Onion', hindiName: 'हरा प्याज', bengaliName: 'পেঁয়াজ কল', category: 'Leafy', price: 45, unit: 'bunch' },
  { id: 'v-39', englishName: 'Green Peas', hindiName: 'मटर', bengaliName: 'মটর', category: 'Beans/Legumes', price: 54, unit: 'kg' },
  { id: 'v-40', englishName: 'Ivy Gourd', hindiName: 'कुंदरू', bengaliName: 'কুন্দরি', category: 'Fruit Veg', price: 37, unit: 'kg' },
  { id: 'v-41', englishName: 'Lemon', hindiName: 'नींबू', bengaliName: 'লেবু', category: 'Fruit Veg', price: 59, unit: 'kg' },
  { id: 'v-42', englishName: 'Raw Mango', hindiName: 'कच्चा आम', bengaliName: 'কাঁচা আম', category: 'Fruit Veg', price: 51, unit: 'kg' },
  { id: 'v-43', englishName: 'Mint Leaves', hindiName: 'पुदीना', bengaliName: 'পুদিনা', category: 'Leafy', price: 10, unit: 'bunch' },
  { id: 'v-44', englishName: 'Mushroom', hindiName: 'मशरूम', bengaliName: 'মাশরুম', category: 'Other Veg', price: 89, unit: 'kg' },
  { id: 'v-45', englishName: 'Mustard Leaves', hindiName: 'सरसों का साग', bengaliName: 'সরিষা শাক', category: 'Leafy', price: 23, unit: 'bunch' },
  { id: 'v-46', englishName: 'Ladies Finger', hindiName: 'भिंडी', bengaliName: 'ভিন্ডি', category: 'Fruit Veg', price: 43, unit: 'kg' },
  { id: 'v-47', englishName: 'Pumpkin', hindiName: 'कद्दू', bengaliName: 'কুমড়ো', category: 'Other Veg', price: 27, unit: 'kg' },
  { id: 'v-48', englishName: 'Radish', hindiName: 'मूली', bengaliName: 'মূলা', category: 'Root Veg', price: 33, unit: 'kg' },
  { id: 'v-49', englishName: 'Ridge Gourd', hindiName: 'तोरई', bengaliName: 'তোড়াই', category: 'Fruit Veg', price: 42, unit: 'kg' },
  { id: 'v-50', englishName: 'Shallot', hindiName: 'सांभर प्याज', bengaliName: 'ছোট পেঁয়াজ', category: 'Bulb', price: 45, unit: 'kg' },
  { id: 'v-51', englishName: 'Snake Gourd', hindiName: 'चिचिंडा', bengaliName: 'চিচিঙ্গা', category: 'Fruit Veg', price: 37, unit: 'kg' },
  { id: 'v-52', englishName: 'Sorrel Leaves', hindiName: 'खट्टी भाजी', bengaliName: 'খাট্টা শাক', category: 'Leafy', price: 17, unit: 'bunch' },
  { id: 'v-53', englishName: 'Spinach', hindiName: 'पालक', bengaliName: 'পালং শাক', category: 'Leafy', price: 16, unit: 'bunch' },
  { id: 'v-54', englishName: 'Sweet Potato', hindiName: 'शकरकंद', bengaliName: 'মিষ্টি আলু', category: 'Root Veg', price: 65, unit: 'kg' }
];

const categoryImageMap: Record<string, string> = {
  'Apple': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
  'Imported Fruit': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
  'Banana': 'https://images.unsplash.com/photo-1574226516831-e1dff420e37f?auto=format&fit=crop&w=800&q=80',
  'Citrus': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
  'Melon': 'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=800&q=80',
  'Exotic': 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=800&q=80',
  'Fruit Veg': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  'Leafy': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
  'Root Veg': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  'Bulb': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
  'Other Veg': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80',
  'Beans/Legumes': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  'Flower Veg': 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
};

const imageForCategory = (category: string) => categoryImageMap[category] || categoryImageMap.default;

export const seedProducts: Product[] = rawProducts.map((p) => {
  const image = imageForCategory(p.category);
  return {
    id: p.id,
    name: {
      en: p.englishName,
      hi: p.hindiName,
      bn: p.bengaliName
    },
    price: p.price,
    image,
    gallery: [image],
    category: p.category,
    description: `${p.englishName} - farm-fresh and quality checked for daily delivery.`,
    inStock: true,
    rating: 4.6,
    reviews: 100,
    isOrganic: true,
    baseUnit: p.unit
  };
});
