import mongoose, { Document, Model } from 'mongoose';

// Define the interface for Achievement document
interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  current: number;
  progress: number;
  type: string;
  threshold: number;
  lastUpdated: Date;
  unlockedAt?: Date;
  updateProgress: (value: number, threshold: number) => void;
}

// Define interface for Achievement model with static methods
interface AchievementModel extends Model<IAchievement> {
  createOrUpdate(
    userId: string,
    achievementId: string,
    value: number,
    threshold: number,
    type: string
  ): Promise<IAchievement>;
}

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  unlockedAt: {
    type: Date
  }
}, {
  timestamps: true
});

achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

achievementSchema.pre('save', function(next) {
  if (typeof this.current !== 'number') {
    this.current = Number(this.current) || 0;
  }
  if (typeof this.progress !== 'number') {
    this.progress = Number(this.progress) || 0;
  }
  next();
});

achievementSchema.methods.updateProgress = function(value: number, threshold: number) {
  this.current = value;
  this.progress = Math.min((value / threshold) * 100, 100);
  this.lastUpdated = new Date();
  
  if (this.progress === 100 && !this.unlockedAt) {
    this.unlockedAt = new Date();
  }
};

achievementSchema.static('createOrUpdate', async function(
  userId: string,
  achievementId: string,
  value: number,
  threshold: number,
  type: string
) {
  const achievement = await this.findOne({ userId, achievementId });
  
  if (!achievement) {
    return this.create({
      userId,
      achievementId,
      current: value,
      progress: Math.min((value / threshold) * 100, 100),
      type,
      threshold,
      lastUpdated: new Date(),
      unlockedAt: value >= threshold ? new Date() : undefined
    });
  }

  achievement.updateProgress(value, threshold);
  return achievement.save();
});

const Achievement = (mongoose.models.Achievement || mongoose.model<IAchievement, AchievementModel>('Achievement', achievementSchema)) as AchievementModel;

export { Achievement };
