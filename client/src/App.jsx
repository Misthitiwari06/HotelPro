import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import GuestBookingsView from './views/GuestBookingsView';
import FrontDeskView from './views/FrontDeskView';
import AdminDashboardView from './views/AdminDashboardView';
import BookingModal from './components/BookingModal';
import InvoiceModal from './components/InvoiceModal';
import AuthModal from './components/AuthModal';

const MainLayout = () => {
  const { isAuthenticated, isAdmin, isStaff } = useAuth();
  const [activeView, setActiveView] = useState('home');

  // Modals state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBookRoom = (room) => {
    setSelectedRoomForBooking(room);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (newBooking) => {
    setSelectedBookingForInvoice(newBooking);
    setShowInvoiceModal(true);
  };

  const handleOpenInvoice = (booking) => {
    setSelectedBookingForInvoice(booking);
    setShowInvoiceModal(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      <main className="flex-grow-1">
        {activeView === 'home' && (
          <HomeView
            onBookRoom={handleBookRoom}
            onOpenAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {activeView === 'my-bookings' && (
          <GuestBookingsView
            onOpenInvoice={handleOpenInvoice}
            onExploreRooms={() => setActiveView('home')}
          />
        )}

        {activeView === 'front-desk' && (
          <FrontDeskView onOpenInvoice={handleOpenInvoice} />
        )}

        {activeView === 'admin-dashboard' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoomForBooking}
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        booking={selectedBookingForInvoice}
        show={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
