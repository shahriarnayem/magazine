Fix: MongoDB connection is now opt-in.
- Added DATABASE_MODE=seed default.
- App will not attempt MongoDB connection just because MONGODB_URI exists unless DATABASE_MODE=mongodb.
- This prevents querySrv ECONNREFUSED crashes during local development.
