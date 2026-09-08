const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Event name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    image: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: [true, 'Event date is required'] },
    time: { type: String, required: [true, 'Event time is required'] },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    rules: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ name: 'text', description: 'text', venue: 'text' });

eventSchema.virtual('registrationStatus').get(function () {
  if (!this.isActive) return 'closed';
  return this.availableSeats > 0 ? 'open' : 'full';
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
