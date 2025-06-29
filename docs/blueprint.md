# **App Name**: PharmaGuard

## Core Features:

- Weekly Schedule Automation: Load pharmacy data from a local pharmacies.json file and automatically display the relevant week's schedule based on the device's date. Schedule updates every week at 7:00 AM.
- Pharmacy Information Display: Display pharmacy details including name, location, and contact information (call and WhatsApp).
- Direct Contact Buttons: Implement call (tel:) and WhatsApp (https://wa.me/NUMERO) buttons for easy contact.
- Historical/Future Schedule Access: Enable browsing of past and future weeks via a date selector or navigation buttons.
- Integrated Offline Map: Integrate a leaflet map (OpenStreetMap type without Google API). When a pharmacy is selected, attempt to display details. Ensure full offline availability after the first load using PWA and service workers.
- AI Pharmacist Chatbot: Include a floating chatbot that uses tool powered by a generative AI. It should respond like a pharmacist, offering information on dosage and side effects.
- Admin Panel for JSON Management: In a password-protected admin panel accessible via an 'Options' menu, enable manual replacement of the pharmacies.json file. Automatically sync new JSON files in the cache for offline access when a user is online. Password: kenneth18.
- Integrated health leaflet resource: A new secondary page provides a health library with up-to-date leaflets on popular over-the-counter treatments.

## Style Guidelines:

- Primary color: Deep teal (#008080) to convey trust and health.
- Background color: Light teal (#E0F8F7) for a clean and calming effect.
- Accent color: Soft peach (#F2D7B5) for a gentle, inviting contrast.
- Body and headline font: 'PT Sans' (sans-serif) to ensure legibility and a modern, accessible design.
- Code font: 'Source Code Pro' for the display of configuration or data snippets within the admin panel.
- Use clean, minimalist icons related to pharmacy, medicine, and navigation.
- Ensure a responsive layout that adapts seamlessly to both web and mobile screens.
- Implement subtle animations for transitions and feedback, ensuring smooth and intuitive interactions.