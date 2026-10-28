const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Item = require('./models/Item');
const { connectDB, disconnectDB } = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const sampleItems = [
  {
    title: 'Casio Scientific Calculator FX-991EX',
    type: 'Found',
    category: 'Electronics',
    location: 'Faculty of Science, Physics Lab 2',
    date: new Date('2026-10-26T10:30:00Z'),
    description: 'Black Casio FX-991EX ClassWiz calculator with white solar strip. Found on the second bench in the physics laboratory after morning lecture.',
    imageUrl: '',
    contactName: 'Adaobi Okafor',
    contactEmail: 'adaobi.okafor@sdu.edu.ng',
    contactPhone: '+234 803 111 2233',
    status: 'Active'
  },
  {
    title: 'SDU Student ID Card - Computer Science',
    type: 'Lost',
    category: 'ID Cards',
    location: 'Main University Library, Reading Hall 1',
    date: new Date('2026-10-25T14:15:00Z'),
    description: 'SDU University Student Identity Card with Matriculation Number SDU/2023/1842. Belongs to Faculty of Science, Dept of Computer Science.',
    imageUrl: '',
    contactName: 'Emeka Okonkwo',
    contactEmail: 'emeka.okonkwo@sdu.edu.ng',
    contactPhone: '+234 802 444 5566',
    status: 'Active'
  },
  {
    title: 'Original Dell 65W Laptop Charger (Black)',
    type: 'Found',
    category: 'Electronics',
    location: 'Faculty of Engineering, Lecture Theatre B',
    date: new Date('2026-10-24T16:45:00Z'),
    description: 'Original black Dell laptop charger with round barrel tip. Left plugged into the wall outlet near the right projection screen in Lecture Theatre B.',
    imageUrl: '',
    contactName: 'Blessing Eze',
    contactEmail: 'blessing.eze@sdu.edu.ng',
    contactPhone: '+234 813 555 7788',
    status: 'Active'
  },
  {
    title: 'Hostel Room Keys on Blue SDU Lanyard (3 Keys)',
    type: 'Lost',
    category: 'Keys',
    location: 'Male Hostel Block B Walkway',
    date: new Date('2026-10-23T19:00:00Z'),
    description: 'Set of 3 Yale keys attached to an official blue Southern Delta University branded lanyard with a small metal whistle.',
    imageUrl: '',
    contactName: 'Tari Ovie',
    contactEmail: 'tari.ovie@sdu.edu.ng',
    contactPhone: '+234 805 777 9900',
    status: 'Active'
  },
  {
    title: 'Engineering Mathematics II Hardcover Notebook',
    type: 'Found',
    category: 'Books',
    location: 'Main University Auditorium',
    date: new Date('2026-10-22T11:20:00Z'),
    description: 'Blue 60-leaves hardcover notebook containing Engineering Mathematics notes, differential equations, and tutorial exercise solutions.',
    imageUrl: '',
    contactName: 'Kome Douglas',
    contactEmail: 'kome.douglas@sdu.edu.ng',
    contactPhone: '+234 809 333 4455',
    status: 'Active'
  },
  {
    title: "Brown Leather Wallet with Driver's License",
    type: 'Found',
    category: 'Other',
    location: 'Campus Central Cafeteria',
    date: new Date('2026-10-20T13:00:00Z'),
    description: 'Men brown leather bifold wallet with national identity card and driver license. Handed over directly to the Security Desk.',
    imageUrl: '',
    contactName: 'Security Desk',
    contactEmail: 'security@sdu.edu.ng',
    contactPhone: '+234 803 000 7382',
    status: 'Recovered'
  },
  {
    title: 'Apple AirPods Pro 2nd Gen (White Case)',
    type: 'Lost',
    category: 'Electronics',
    location: 'Faculty of Management Sciences, Room 102',
    date: new Date('2026-10-27T09:10:00Z'),
    description: 'White AirPods Pro case with small red silicone bumper. Has student initials engraved lightly on the back.',
    imageUrl: '',
    contactName: 'Chiamaka N.',
    contactEmail: 'chiamaka.n@sdu.edu.ng',
    contactPhone: '+234 806 888 1234',
    status: 'Active'
  },
  {
    title: 'Navy Blue Nike Gym Backpack',
    type: 'Found',
    category: 'Clothing',
    location: 'University Sports Complex Bleachers',
    date: new Date('2026-10-27T17:30:00Z'),
    description: 'Navy blue Nike sports backpack containing a training towel, water bottle, and a copy of General Studies textbook.',
    imageUrl: '',
    contactName: 'Coach Davies',
    contactEmail: 'sports@sdu.edu.ng',
    contactPhone: '+234 803 000 7382',
    status: 'Active'
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clear existing
    await Item.deleteMany({});
    console.log('🗑️ Cleared existing items.');

    // Insert new sample items
    const createdItems = await Item.insertMany(sampleItems);
    console.log(`✅ Successfully seeded ${createdItems.length} campus items into database!`);

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { sampleItems, seedData };
