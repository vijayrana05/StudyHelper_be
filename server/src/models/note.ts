// models/note.ts
import mongoose, {Schema} from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: String,
  content: {
    type: Schema.Types.Mixed ,// or Schema.Types.Mixed
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject : String,
  color: String,
  fav: {
    type: Boolean,
    default: false
  },
  
},

  { timestamps: true });

export default mongoose.model('Note', noteSchema);
