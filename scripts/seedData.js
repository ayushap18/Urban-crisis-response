/**
 * Seed Data Generator
 * Usage: node scripts/seedData.js > src/services/seed.json
 */

const INCIDENT_TYPES = ['FIRE', 'MEDICAL', 'POLICE', 'HAZMAT', 'TRAFFIC'];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const LOCATIONS = [
  { name: "Connaught Place", lat: 28.6304, lng: 77.2177 },
  { name: "India Gate", lat: 28.6129, lng: 77.2295 },
  { name: "Hauz Khas", lat: 28.5494, lng: 77.2001 },
  { name: "Karol Bagh", lat: 28.6520, lng: 77.1915 },
  { name: "Lajpat Nagar", lat: 28.5677, lng: 77.2433 }
];

const generateIncidents = (count) => {
  const incidents = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    // Jitter location
    const lat = loc.lat + (Math.random() - 0.5) * 0.02;
    const lng = loc.lng + (Math.random() - 0.5) * 0.02;

    // Time in the last 24 hours
    const timestamp = new Date(now - Math.floor(Math.random() * 86400000)).toISOString();

    incidents.push({
      id: `seed-${i + 1000}`,
      title: `${severity} ${type} Incident`,
      description: `Reported ${type} emergency near ${loc.name}. Multiple calls received.`,
      type,
      status: Math.random() > 0.5 ? 'RESOLVED' : 'NEW',
      severity,
      location: { lat, lng },
      address: `${loc.name}, New Delhi`,
      timestamp,
      reportingParty: "Simulation Script",
      assignedServiceIds: []
    });
  }

  return incidents;
};

const data = generateIncidents(100);
console.log(JSON.stringify(data, null, 2));
