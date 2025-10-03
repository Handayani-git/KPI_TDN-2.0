const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");
const { faker } = require('@faker-js/faker');

// --- 1. Your Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCnjKYSHGYpNA1nyTJCfm-HCVFsBeV5mIU", // Sebaiknya ganti dengan kunci asli Anda
  authDomain: "kpi-429cf.firebaseapp.com",
  projectId: "kpi-429cf",
  storageBucket: "kpi-429cf.appspot.com", // Perbaiki .firebasestorage menjadi .appspot
  messagingSenderId: "252385462360",
  appId: "1:252385462360:web:b7d6810b0b1df8ad8b222d",
  measurementId: "G-G4P6K7NSNC"
};
// --- 2. Your Master Data IDs ---
const advertiserIds = ["36RU8bVTZDZ9Z2KMXEOZ", "PeEPkAVxsu57ue1jbyVM", "Q2zGDTPlgS8I0EakksgJ"];
const csIds = ["GD1eKU0p60wao8n8V7j", "OBFUwpGMARoz4Xo9GufG"];
const products = ["Vitameal", "Eyebost", "Vitameal Less Sugar"];
const platforms = ["Meta", "TikTok", "Google Ads", "Meta Interaksi WA"];

// --- 3. The Data Generation and Upload Logic ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to generate and upload data
async function generateAndUpload(collectionName, count, generatorFn) {
  const collectionRef = collection(db, collectionName);
  console.log(`Generating and uploading ${count} documents to ${collectionName}...`);
  for (let i = 0; i < count; i++) {
    const dataItem = generatorFn();
    const dataWithTimestamp = {
      ...dataItem,
      date: Timestamp.fromDate(dataItem.date)
    };
    await addDoc(collectionRef, dataWithTimestamp);
  }
  console.log(`${collectionName} upload complete!`);
}

// Generator function for adSpends
const generateAdSpend = () => ({
  date: faker.date.between({ from: '2025-06-01T00:00:00.000Z', to: '2025-08-04T00:00:00.000Z' }),
  advertiserId: faker.helpers.arrayElement(advertiserIds),
  platform: faker.helpers.arrayElement(platforms),
  product: faker.helpers.arrayElement(products),
  spend: faker.number.int({ min: 150000, max: 2000000 })
});

// Generator function for leads
const generateLead = () => ({
  date: faker.date.between({ from: '2025-06-01T00:00:00.000Z', to: '2025-08-04T00:00:00.000Z' }),
  csId: faker.helpers.arrayElement(csIds),
  sourceAdvertiserId: faker.helpers.arrayElement(advertiserIds),
  sourcePlatform: faker.helpers.arrayElement(platforms),
  product: faker.helpers.arrayElement(products),
  leadCount: faker.number.int({ min: 5, max: 150 })
});

// Generator function for sales
const generateSale = () => {
  const quantity = faker.number.int({ min: 1, max: 5 });
  const pricePerItem = faker.number.int({ min: 250000, max: 400000 });
  return {
    date: faker.date.between({ from: '2025-06-01T00:00:00.000Z', to: '2025-08-04T00:00:00.000Z' }),
    csId: faker.helpers.arrayElement(csIds),
    advertiserId: faker.helpers.arrayElement(advertiserIds),
    sku: faker.helpers.arrayElement(["VML01", "EYB01", "VMLS01"]),
    product: faker.helpers.arrayElement(products),
    quantity: quantity,
    omset: quantity * pricePerItem
  };
};


// Run the script
async function seedDatabase() {
  console.log("Starting database seed process...");
  try {
    await generateAndUpload('adSpends', 100, generateAdSpend);
    await generateAndUpload('leads', 100, generateLead);
    await generateAndUpload('sales', 100, generateSale);
    console.log('\nAll 300 documents seeded successfully!');
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

seedDatabase();