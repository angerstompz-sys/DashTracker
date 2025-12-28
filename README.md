# DashTracker

A modern, sleek mobile application for delivery service workers to track their shifts and earnings across multiple platforms.

## Features

- **Multi-Platform Support**: Track shifts from DoorDash, UberEats, Grubhub, and Walmart's Spark Driver
- **Shift Management**: Start and end shifts with one tap
- **Delivery Tracking**: Record individual deliveries with earnings, tips, and distance
- **Real-time Analytics**: View earnings, distance, and performance metrics
- **Beautiful UI**: Modern, dark-themed interface with smooth animations
- **Offline Support**: Uses SQLite for local data storage

## Tech Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **Expo SQLite** for local database
- **Expo Linear Gradient** for beautiful gradients
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dashtracker.git
   cd dashtracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your device:
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code from the terminal

## Project Structure

```
DashTracker/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/          # React Context providers
│   ├── database/         # SQLite database layer
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   └── theme/            # Design system (colors, spacing, etc.)
├── assets/               # Images, icons, fonts
├── App.js               # App entry point
└── package.json         # Dependencies
```

## Screens

- **Welcome Screen**: Onboarding and login
- **Dashboard**: Overview of active shift and quick stats
- **Shifts**: List of all shifts with detailed breakdown
- **Analytics**: Comprehensive earnings and performance analytics
- **Profile**: User settings and account management
- **Add Delivery**: Quick form to log deliveries

## Database Schema

### Users
- id, email, name, created_at

### Platforms
- id, user_id, name, is_active, color

### Shifts
- id, user_id, platform_id, start_time, end_time, total_earnings, total_distance, total_deliveries, notes, status

### Deliveries
- id, shift_id, earnings, distance, tip, base_pay, timestamp, notes

## Design System

The app features a modern dark theme with:
- Primary color: Indigo (#6366f1)
- Secondary color: Pink (#ec4899)
- Platform-specific brand colors
- Consistent spacing and typography
- Smooth gradients and animations

## Future Enhancements

- Cloud sync across devices
- Export data to CSV/PDF
- Weekly/monthly reports
- Goal tracking
- Expense tracking
- Tax estimation
- Push notifications
- Widget support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For support, email support@dashtracker.app or open an issue on GitHub.

---

Made with ❤️ for delivery drivers
