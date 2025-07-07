# IT Vulnerability Assessment Frontend

A comprehensive Vue.js application for conducting IT infrastructure vulnerability assessments with advanced features including draft management, user authentication, and detailed reporting.

## 🚀 Features

### Core Functionality

- **Multi-Phase Assessment System**: Complete vulnerability assessment workflow
- **Draft Management**: Save and resume assessments at any time
- **User Authentication**: Secure user registration and login system
- **Comprehensive Reporting**: Detailed vulnerability reports with recommendations
- **Progress Tracking**: Visual progress indicators and completion tracking

### Advanced Features

- **Navigation Guards**: Protect against accidental data loss
- **Toast Notifications**: User-friendly feedback system
- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Accessibility**: WCAG compliant with screen reader support
- **Error Handling**: Comprehensive error management and recovery
- **System Testing**: Built-in testing panel for validation

### User Experience

- **Responsive Design**: Mobile-friendly interface
- **Smooth Animations**: Professional transitions and micro-interactions
- **Loading States**: Visual feedback for all operations
- **Auto-save**: Automatic progress saving
- **Visual Feedback**: Progress indicators and status updates

## 🛠️ Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
itiva-frontend/
├── src/
│   ├── api/
│   │   └── mockData.js          # Mock questionnaire data
│   ├── components/
│   │   ├── admin/               # Admin components
│   │   ├── icons/               # Icon components
│   │   ├── AppHeader.vue        # Main header component
│   │   ├── AppFooter.vue        # Footer component
│   │   ├── DraftSaveModal.vue   # Draft save modal
│   │   ├── SystemTestPanel.vue  # System testing panel
│   │   └── ToastNotification.vue # Toast notification system
│   ├── stores/
│   │   ├── auth.js              # User authentication store
│   │   ├── assessment.js        # Assessment management store
│   │   └── reports.js           # Reports management store
│   ├── utils/
│   │   ├── errorHandler.js      # Error handling utilities
│   │   ├── testUtils.js         # Testing utilities
│   │   ├── toast.js             # Toast notification utilities
│   │   └── reportGenerator.js   # Report generation utilities
│   ├── views/
│   │   ├── admin/               # Admin views
│   │   ├── HomePage.vue         # Landing page
│   │   ├── LoginPage.vue        # User authentication
│   │   ├── DashboardPage.vue    # Main dashboard
│   │   ├── QuestionnairePage.vue # Assessment interface
│   │   ├── ReportViewerPage.vue # Report display
│   │   └── LinkAccountsPage.vue # Account linking
│   ├── router/
│   │   └── index.js             # Application routing
│   ├── App.vue                  # Root component
│   └── main.js                  # Application entry point
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd itiva-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📋 Usage Guide

### For Users

1. **Registration/Login**

   - Navigate to the login page
   - Register a new account or login with existing credentials
   - User data is persisted locally

2. **Starting an Assessment**

   - From the dashboard, click "Start New Assessment"
   - Choose assessment type
   - Answer questions with detailed explanations
   - Progress is automatically saved

3. **Managing Drafts**

   - Drafts are automatically created when starting assessments
   - Use "Continue Draft" to resume incomplete assessments
   - Drafts can be saved, discarded, or completed

4. **Viewing Reports**
   - Completed assessments generate detailed reports
   - View scores, recommendations, and improvement areas
   - Reports are stored locally and can be accessed anytime

### For Developers

1. **System Testing**

   - Access the System Test Panel from the dashboard
   - Run comprehensive tests to validate functionality
   - View detailed test results and error reports

2. **Error Handling**

   - All operations include comprehensive error handling
   - Errors are logged with context and user-friendly messages
   - Toast notifications provide immediate feedback

3. **State Management**
   - Pinia stores manage application state
   - All stores include validation and error handling
   - Data persistence through localStorage

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=IT Vulnerability Assessment
VITE_APP_VERSION=1.0.0
```

### Tailwind CSS Configuration

Customize the design system in `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
    },
  },
  plugins: [],
}
```

## 🧪 Testing

### Manual Testing

1. **System Test Panel**: Access from dashboard for comprehensive testing
2. **User Flows**: Test complete assessment workflows
3. **Error Scenarios**: Test error handling and recovery
4. **Accessibility**: Test with screen readers and keyboard navigation

### Automated Testing

The application includes built-in validation utilities:

- Store method validation
- Data structure validation
- localStorage functionality testing
- Router functionality testing

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **Data Sanitization**: Data is sanitized before storage
- **Error Handling**: Secure error messages without data exposure
- **Local Storage**: Data is stored locally with proper validation

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Proper focus indicators and management
- **Color Contrast**: High contrast ratios for readability

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive design for tablets
- **Desktop Experience**: Enhanced features for desktop users
- **Touch Friendly**: Optimized for touch interactions

## 🚀 Performance

- **Lazy Loading**: Components loaded on demand
- **Optimized Builds**: Production builds are optimized
- **Efficient State Management**: Minimal re-renders
- **Local Storage**: Fast data access and persistence

## 🔄 State Management

### Stores Overview

#### Auth Store (`src/stores/auth.js`)

- User registration and authentication
- User profile management
- Session persistence
- Input validation and error handling

#### Assessment Store (`src/stores/assessment.js`)

- Draft management and persistence
- Progress tracking
- Answer storage and retrieval
- Report generation

#### Reports Store (`src/stores/reports.js`)

- Report storage and management
- Draft to completed report conversion
- Report filtering and search
- Data validation and integrity

## 🛠️ Development

### Code Style

- **ESLint**: Code linting and formatting
- **Vue 3 Composition API**: Modern Vue.js patterns
- **TypeScript-like**: JSDoc comments for type safety
- **Component Structure**: Consistent component organization

### Best Practices

- **Error Boundaries**: Comprehensive error handling
- **Validation**: Input and data validation
- **Performance**: Optimized rendering and state updates
- **Accessibility**: WCAG compliance throughout

## 📈 Future Enhancements

### Planned Features

- **Real-time Collaboration**: Multi-user assessment support
- **Advanced Analytics**: Detailed performance metrics
- **Export Functionality**: PDF and Excel report export
- **API Integration**: Backend service integration
- **Cloud Storage**: Remote data synchronization

### Technical Improvements

- **TypeScript Migration**: Full TypeScript support
- **Unit Testing**: Comprehensive test coverage
- **E2E Testing**: End-to-end testing with Cypress
- **Performance Monitoring**: Real-time performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the system test panel
- Open an issue on GitHub
- Contact the development team

## 🎯 Project Goals

- **User Experience**: Provide an intuitive and efficient assessment experience
- **Reliability**: Ensure data integrity and system stability
- **Accessibility**: Make the application usable by everyone
- **Performance**: Deliver fast and responsive interactions
- **Maintainability**: Create clean, well-documented code

---

**Built with ❤️ using Vue.js 3 and modern web technologies**
