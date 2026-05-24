require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const events = db.collection('events');
  const responses = db.collection('responses');

  // Rename families → attendees on all event documents
  const eventsResult = await events.updateMany(
    { families: { $exists: true } },
    { $rename: { families: 'attendees' } }
  );
  console.log(`Events migrated: ${eventsResult.modifiedCount}`);

  // Rename familyName → attendeeName on all response documents
  const responsesResult = await responses.updateMany(
    { familyName: { $exists: true } },
    { $rename: { familyName: 'attendeeName' } }
  );
  console.log(`Responses migrated: ${responsesResult.modifiedCount}`);

  // Drop the old unique index so Mongoose rebuilds it on the new field
  const indexes = await responses.indexes();
  const oldIndex = indexes.find(i => i.key && i.key.familyName !== undefined);
  if (oldIndex) {
    await responses.dropIndex(oldIndex.name);
    console.log(`Dropped old index: ${oldIndex.name}`);
  } else {
    console.log('Old familyName index not found (already dropped)');
  }

  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
