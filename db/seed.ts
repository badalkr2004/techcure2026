import { db } from "./drizzle";
import { biharDistrict, issueType } from "./schema";
import { randomUUID } from "crypto";

// Bihar Districts Data (all 38 districts)
const biharDistrictsData = [
    // Patna Division
    { name: "Patna", nameHindi: "पटना", division: "Patna", latitude: 25.5941, longitude: 85.1376, population: 5838465 },
    { name: "Nalanda", nameHindi: "नालंदा", division: "Patna", latitude: 25.1353, longitude: 85.4444, population: 2877653 },
    { name: "Bhojpur", nameHindi: "भोजपुर", division: "Patna", latitude: 25.4627, longitude: 84.4461, population: 2728407 },
    { name: "Buxar", nameHindi: "बक्सर", division: "Patna", latitude: 25.5641, longitude: 84.0311, population: 1706352 },
    { name: "Rohtas", nameHindi: "रोहतास", division: "Patna", latitude: 24.9741, longitude: 84.0211, population: 2959918 },
    { name: "Kaimur", nameHindi: "कैमूर", division: "Patna", latitude: 25.0463, longitude: 83.5818, population: 1626384 },

    // Magadh Division
    { name: "Gaya", nameHindi: "गया", division: "Magadh", latitude: 24.7914, longitude: 85.0002, population: 4391418 },
    { name: "Jehanabad", nameHindi: "जहानाबाद", division: "Magadh", latitude: 25.2077, longitude: 84.9872, population: 1124176 },
    { name: "Arwal", nameHindi: "अरवल", division: "Magadh", latitude: 25.2479, longitude: 84.6810, population: 700843 },
    { name: "Nawada", nameHindi: "नवादा", division: "Magadh", latitude: 24.8777, longitude: 85.5314, population: 2219146 },
    { name: "Aurangabad", nameHindi: "औरंगाबाद", division: "Magadh", latitude: 24.7516, longitude: 84.3742, population: 2540073 },

    // Saran Division
    { name: "Saran", nameHindi: "सारण", division: "Saran", latitude: 25.8449, longitude: 84.7861, population: 3951862 },
    { name: "Siwan", nameHindi: "सिवान", division: "Saran", latitude: 26.2236, longitude: 84.3564, population: 3330464 },
    { name: "Gopalganj", nameHindi: "गोपालगंज", division: "Saran", latitude: 26.4683, longitude: 84.4372, population: 2562012 },

    // Tirhut Division
    { name: "Muzaffarpur", nameHindi: "मुजफ्फरपुर", division: "Tirhut", latitude: 26.1197, longitude: 85.3910, population: 4801062 },
    { name: "East Champaran", nameHindi: "पूर्वी चम्पारण", division: "Tirhut", latitude: 26.6476, longitude: 84.8694, population: 5099371 },
    { name: "West Champaran", nameHindi: "पश्चिमी चम्पारण", division: "Tirhut", latitude: 27.0322, longitude: 84.4800, population: 3935042 },
    { name: "Sitamarhi", nameHindi: "सीतामढ़ी", division: "Tirhut", latitude: 26.5948, longitude: 85.4808, population: 3423574 },
    { name: "Sheohar", nameHindi: "शिवहर", division: "Tirhut", latitude: 26.5179, longitude: 85.2981, population: 656916 },
    { name: "Vaishali", nameHindi: "वैशाली", division: "Tirhut", latitude: 25.6777, longitude: 85.2159, population: 3495021 },

    // Darbhanga Division
    { name: "Darbhanga", nameHindi: "दरभंगा", division: "Darbhanga", latitude: 26.1542, longitude: 85.8918, population: 3937385 },
    { name: "Madhubani", nameHindi: "मधुबनी", division: "Darbhanga", latitude: 26.3487, longitude: 86.0715, population: 4487379 },
    { name: "Samastipur", nameHindi: "समस्तीपुर", division: "Darbhanga", latitude: 25.8586, longitude: 85.7813, population: 4261566 },

    // Kosi Division
    { name: "Saharsa", nameHindi: "सहरसा", division: "Kosi", latitude: 25.8801, longitude: 86.6004, population: 1900661 },
    { name: "Supaul", nameHindi: "सुपौल", division: "Kosi", latitude: 26.1209, longitude: 86.6004, population: 2229076 },
    { name: "Madhepura", nameHindi: "मधेपुरा", division: "Kosi", latitude: 25.9210, longitude: 86.7923, population: 2001762 },

    // Purnia Division
    { name: "Purnia", nameHindi: "पूर्णिया", division: "Purnia", latitude: 25.7771, longitude: 87.4753, population: 3264619 },
    { name: "Katihar", nameHindi: "कटिहार", division: "Purnia", latitude: 25.5393, longitude: 87.5717, population: 3071029 },
    { name: "Araria", nameHindi: "अररिया", division: "Purnia", latitude: 26.1487, longitude: 87.5205, population: 2811569 },
    { name: "Kishanganj", nameHindi: "किशनगंज", division: "Purnia", latitude: 26.0893, longitude: 87.9570, population: 1690400 },

    // Bhagalpur Division
    { name: "Bhagalpur", nameHindi: "भागलपुर", division: "Bhagalpur", latitude: 25.2425, longitude: 87.0069, population: 3032226 },
    { name: "Banka", nameHindi: "बांका", division: "Bhagalpur", latitude: 24.8855, longitude: 86.9227, population: 2034763 },

    // Munger Division
    { name: "Munger", nameHindi: "मुंगेर", division: "Munger", latitude: 25.3750, longitude: 86.4744, population: 1367765 },
    { name: "Lakhisarai", nameHindi: "लखीसराय", division: "Munger", latitude: 25.1579, longitude: 86.0948, population: 1000717 },
    { name: "Sheikhpura", nameHindi: "शेखपुरा", division: "Munger", latitude: 25.1397, longitude: 85.8470, population: 636342 },
    { name: "Jamui", nameHindi: "जमुई", division: "Munger", latitude: 24.9284, longitude: 86.2250, population: 1760405 },
    { name: "Khagaria", nameHindi: "खगड़िया", division: "Munger", latitude: 25.5022, longitude: 86.4706, population: 1666886 },
    { name: "Begusarai", nameHindi: "बेगूसराय", division: "Munger", latitude: 25.4185, longitude: 86.1316, population: 2970541 },
];

// Issue Types Data
const issueTypesData = [
    {
        code: "panic",
        name: "Panic Alert",
        nameHindi: "पैनिक अलर्ट",
        description: "Critical emergency panic alert",
        icon: "AlertTriangle",
        color: "#EF4444",
        requiresAuth: false,
        defaultSeverity: "critical",
        autoAssignTeamType: null,
        sortOrder: 0,
    },
    {
        code: "medical_emergency",
        name: "Medical Emergency",
        nameHindi: "चिकित्सा आपातकाल",
        description: "Health-related emergencies requiring immediate medical attention",
        icon: "Heart",
        color: "#DC2626",
        requiresAuth: true,
        defaultSeverity: "high",
        autoAssignTeamType: "medical",
        sortOrder: 1,
    },
    {
        code: "harassment",
        name: "Harassment",
        nameHindi: "उत्पीड़न",
        description: "Report any form of harassment or abuse",
        icon: "ShieldAlert",
        color: "#F97316",
        requiresAuth: true,
        defaultSeverity: "high",
        autoAssignTeamType: null,
        sortOrder: 2,
    },
    {
        code: "accident",
        name: "Road Accident",
        nameHindi: "सड़क दुर्घटना",
        description: "Vehicle accidents and road-related emergencies",
        icon: "Car",
        color: "#EAB308",
        requiresAuth: true,
        defaultSeverity: "high",
        autoAssignTeamType: "rescue",
        sortOrder: 3,
    },
    {
        code: "fire",
        name: "Fire",
        nameHindi: "आग",
        description: "Fire-related emergencies",
        icon: "Flame",
        color: "#F43F5E",
        requiresAuth: true,
        defaultSeverity: "critical",
        autoAssignTeamType: "rescue",
        sortOrder: 4,
    },
    {
        code: "flood",
        name: "Flood",
        nameHindi: "बाढ़",
        description: "Flood-related emergencies and rescue needs",
        icon: "Waves",
        color: "#0EA5E9",
        requiresAuth: true,
        defaultSeverity: "high",
        autoAssignTeamType: "rescue",
        sortOrder: 5,
    },
    {
        code: "crime",
        name: "Crime Report",
        nameHindi: "अपराध रिपोर्ट",
        description: "Report criminal activity",
        icon: "AlertOctagon",
        color: "#8B5CF6",
        requiresAuth: true,
        defaultSeverity: "high",
        autoAssignTeamType: null,
        sortOrder: 6,
    },
    {
        code: "missing_person",
        name: "Missing Person",
        nameHindi: "लापता व्यक्ति",
        description: "Report a missing person",
        icon: "UserX",
        color: "#6366F1",
        requiresAuth: true,
        defaultSeverity: "high",
        autoAssignTeamType: null,
        sortOrder: 7,
    },
    {
        code: "natural_disaster",
        name: "Natural Disaster",
        nameHindi: "प्राकृतिक आपदा",
        description: "Earthquake, cyclone, and other natural disasters",
        icon: "CloudLightning",
        color: "#64748B",
        requiresAuth: true,
        defaultSeverity: "critical",
        autoAssignTeamType: "relief",
        sortOrder: 8,
    },
    {
        code: "general",
        name: "General Help",
        nameHindi: "सामान्य सहायता",
        description: "General assistance and support requests",
        icon: "HelpCircle",
        color: "#22C55E",
        requiresAuth: true,
        defaultSeverity: "medium",
        autoAssignTeamType: "general",
        sortOrder: 99,
    },
];

async function seed() {
    console.log("🌱 Starting seed process...\n");

    // Seed Bihar Districts
    console.log("📍 Seeding Bihar districts...");
    for (const district of biharDistrictsData) {
        await db.insert(biharDistrict).values({
            id: randomUUID(),
            ...district,
            isActive: true,
        }).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${biharDistrictsData.length} Bihar districts\n`);

    // Seed Issue Types
    console.log("📋 Seeding issue types...");
    for (const type of issueTypesData) {
        await db.insert(issueType).values({
            id: randomUUID(),
            ...type,
            isActive: true,
        }).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${issueTypesData.length} issue types\n`);

    console.log("🎉 Seed completed successfully!");
}

// Run seed
seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    });
