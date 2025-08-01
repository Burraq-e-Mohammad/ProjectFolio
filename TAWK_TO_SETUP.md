# Tawk.to Live Chat Setup

## Overview
The live chat functionality has been implemented using Tawk.to. The chat widget will appear on all pages of the application.

## Configuration

### Current Setup
The Tawk.to widget is configured with the following credentials:
- **Property ID**: `688881b6c99c121929b66aa8`
- **Widget ID**: `1j1ajldig`

### Files Modified
1. `client/src/components/chat/TawkToChat.tsx` - Main chat component
2. `client/src/App.tsx` - Integration of chat widget

## Features

### Visitor Information
When a user is logged in, the chat widget will automatically set visitor information:
- Name (firstName + lastName)
- Email address
- User role (seller/customer/admin)
- User ID

### Event Handling
The chat widget includes event handlers for:
- Chat status changes
- Chat start/end events
- Visitor information updates

### Fallback
If the Tawk.to credentials are not properly configured, a simple chat icon will be displayed with an alert message.

## Customization

### Environment Variables (Optional)
You can use environment variables instead of hardcoded credentials:

1. Create a `.env` file in the client directory:
```env
VITE_TAWK_TO_PROPERTY_ID=688881b6c99c121929b66aa8
VITE_TAWK_TO_WIDGET_ID=1j1ajldig
```

2. Update `App.tsx` to use environment variables:
```tsx
<TawkToChat 
  propertyId={import.meta.env.VITE_TAWK_TO_PROPERTY_ID}
  widgetId={import.meta.env.VITE_TAWK_TO_WIDGET_ID}
/>
```

### Styling
The chat widget uses Tawk.to's default styling. You can customize the appearance through the Tawk.to dashboard.

## Testing
1. Start the application
2. Navigate to any page
3. The chat widget should appear in the bottom-right corner
4. Click on the chat widget to start a conversation
5. If logged in, visitor information should be automatically set

## Troubleshooting

### Chat Widget Not Appearing
- Check browser console for any JavaScript errors
- Verify that the Property ID and Widget ID are correct
- Ensure the Tawk.to script is loading properly

### Visitor Information Not Setting
- Make sure the user is properly logged in
- Check that the AuthContext is providing user data
- Verify the user object has firstName, lastName, email, and role properties

## Tawk.to Dashboard
Access your Tawk.to dashboard at: https://dashboard.tawk.to/
- Configure chat settings
- View chat history
- Manage agents
- Customize widget appearance 