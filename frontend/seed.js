const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");
const { faker } = require('@faker-js/faker');

// --- 1. Your Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBT9Zm4FCAIkgnvQxaMohLySavOrTogGz8",
  authDomain: "kpi-tdn-71797.firebaseapp.com",
  projectId: "kpi-tdn-71797",
  storageBucket: "kpi-tdn-71797.firebasestorage.app",
  messagingSenderId: "673491996903",
  appId: "1:673491996903:web:3a3be1afa90de6ab369242",
  measurementId: "G-6BFL0LD8H5"
};
// --- 2. Your Master Data IDs ---
const advertiserIds = ["R0jqSJ65ec7y2jQkfyuF", "N4OJaJS8hmA1ZbzQOHSh"];
const csIds = ["BflgVhD4iuKxUaySRHE", "CfcLiXU2kQnhjN80YKkX", "H4EEPeoVg8sZII7v8n5E", "aBXU0RZ22AVy8pSKlm0X", "qxLX5QMPcC2lzNqVeVIT"];
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