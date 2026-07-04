// src/pages/DeliveryProfile.jsx
//
// Delivery Profile page: shows the partner's identity card (photo,
// name, rating, availability) alongside a details card (email, phone,
// vehicle info). "Edit Profile" opens a small modal form that writes
// back through deliveryApi.updateDeliveryProfile.

import React, { useState, useEffect } from "react";
import {
  fetchDeliveryProfile,
  updateDeliveryProfile,
} from "../services/deliveryApi";
import "../styles/profile.css";

const DeliveryProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Controls whether the Edit Profile modal is visible.
  const [isEditing, setIsEditing] = useState(false);

  // Local form state, only committed to `profile` on Save.
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  // Load the profile once on mount.
  useEffect(() => {
    let isMounted = true;

    fetchDeliveryProfile().then((data) => {
      if (isMounted) {
        setProfile(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Opens the modal and pre-fills the form with the current profile values.
  const handleOpenEdit = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      vehicleType: profile.vehicleType,
      vehicleNumber: profile.vehicleNumber,
    });
    setIsEditing(true);
  };

  // Updates a single field in the edit form as the user types.
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Saves the edited fields back through the API mock, then closes the modal.
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = await updateDeliveryProfile(formData);
    setProfile(updated);
    setIsEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="profile-page">
        <p>Loading profile…</p>
      </div>
    );
  }

  const isOnline = profile.availability === "Online";

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Delivery Profile</h1>

      <div className="profile-layout">
        {/* ---------------- Identity card ---------------- */}
        <div className="profile-identity-card">
          <div className="profile-identity-card__photo-wrap">
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="profile-identity-card__photo"
            />
            <span
              className={`profile-identity-card__status-dot ${
                isOnline
                  ? "profile-identity-card__status-dot--online"
                  : "profile-identity-card__status-dot--offline"
              }`}
              title={profile.availability}
            />
          </div>

          <h2 className="profile-identity-card__name">{profile.name}</h2>
          <p className="profile-identity-card__id">{profile.id}</p>

          <span className="profile-identity-card__rating">
            ⭐ {profile.rating} Rating
          </span>

          <hr className="profile-identity-card__divider" />

          <div className="profile-identity-card__stat">
            <span>Total Deliveries</span>
            <strong>{profile.totalDeliveries}</strong>
          </div>
          <div className="profile-identity-card__stat">
            <span>Availability</span>
            <strong>{profile.availability}</strong>
          </div>
          <div className="profile-identity-card__stat">
            <span>Joined</span>
            <strong>
              {new Date(profile.joinedOn).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

        {/* ---------------- Details card ---------------- */}
        <div className="profile-details-card">
          <div className="profile-details-card__header">
            <h3 className="profile-details-card__heading">
              Contact &amp; Vehicle Details
            </h3>
            <button type="button" className="btn btn--primary" onClick={handleOpenEdit}>
              Edit Profile
            </button>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <span className="profile-field__label">Full Name</span>
              <span className="profile-field__value">{profile.name}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Email</span>
              <span className="profile-field__value">{profile.email}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Phone Number</span>
              <span className="profile-field__value">{profile.phone}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Availability</span>
              <span className="profile-field__value">
                {profile.availability}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Vehicle Type</span>
              <span className="profile-field__value">
                {profile.vehicleType}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Vehicle Number</span>
              <span className="profile-field__value">
                {profile.vehicleNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Edit Profile modal ---------------- */}
      {isEditing && (
        <div className="profile-edit-overlay" onClick={() => setIsEditing(false)}>
          {/* stopPropagation so clicking inside the modal doesn't close it */}
          <div
            className="profile-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="profile-edit-modal__title">Edit Profile</h3>

            <form onSubmit={handleSaveProfile}>
              <div className="profile-edit-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleFormChange}
                >
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Car">Car</option>
                </select>
              </div>

              <div className="profile-edit-field">
                <label htmlFor="vehicleNumber">Vehicle Number</label>
                <input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="profile-edit-modal__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProfile;