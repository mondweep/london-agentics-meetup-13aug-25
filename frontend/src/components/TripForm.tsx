import React, { useState } from 'react';
import { TripFormData, DAY_NAMES } from '../types';

interface TripFormProps {
  onSubmit: (tripData: TripFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TripFormData>;
  isEditing?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<TripFormData>({
    name: initialData?.name || '',
    origin: {
      address: initialData?.origin?.address || '',
      latitude: initialData?.origin?.latitude || 0,
      longitude: initialData?.origin?.longitude || 0
    },
    destination: {
      address: initialData?.destination?.address || '',
      latitude: initialData?.destination?.latitude || 0,
      longitude: initialData?.destination?.longitude || 0
    },
    schedule: {
      days: initialData?.schedule?.days || [1, 2, 3, 4, 5], // Default to weekdays
      windowStart: initialData?.schedule?.windowStart || '08:00',
      windowEnd: initialData?.schedule?.windowEnd || '09:00'
    },
    alertThreshold: {
      type: initialData?.alertThreshold?.type || 'PERCENTAGE',
      value: initialData?.alertThreshold?.value || 25
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (!formData.origin.address.trim()) {
      newErrors.originAddress = 'Origin address is required';
    }

    if (!formData.destination.address.trim()) {
      newErrors.destinationAddress = 'Destination address is required';
    }

    if (formData.schedule.days.length === 0) {
      newErrors.days = 'Select at least one day';
    }

    if (formData.schedule.windowStart >= formData.schedule.windowEnd) {
      newErrors.timeWindow = 'End time must be after start time';
    }

    if (formData.alertThreshold.value <= 0) {
      newErrors.threshold = 'Alert threshold must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // In a real app, you would geocode the addresses here
    // For demo purposes, we'll use placeholder coordinates
    const processedData = {
      ...formData,
      origin: {
        ...formData.origin,
        latitude: formData.origin.latitude || 51.5074, // Default to London
        longitude: formData.origin.longitude || -0.1278
      },
      destination: {
        ...formData.destination,
        latitude: formData.destination.latitude || 51.5074,
        longitude: formData.destination.longitude || -0.1278
      }
    };

    onSubmit(processedData);
  };

  const handleDayToggle = (dayIndex: number) => {
    const newDays = formData.schedule.days.includes(dayIndex)
      ? formData.schedule.days.filter(d => d !== dayIndex)
      : [...formData.schedule.days, dayIndex].sort();
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days: newDays
      }
    });
  };

  const handleAddressChange = (field: 'origin' | 'destination', address: string) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        address
      }
    });
  };

  return (
    <div className="form">
      <h2>{isEditing ? 'Edit Trip' : 'Add New Trip'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Trip Name *
          </label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Daily Commute, Weekend Shopping"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="origin">
            From (Origin) *
          </label>
          <input
            id="origin"
            type="text"
            className="form-input"
            value={formData.origin.address}
            onChange={(e) => handleAddressChange('origin', e.target.value)}
            placeholder="Enter starting address"
          />
          {errors.originAddress && <div className="error-message">{errors.originAddress}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="destination">
            To (Destination) *
          </label>
          <input
            id="destination"
            type="text"
            className="form-input"
            value={formData.destination.address}
            onChange={(e) => handleAddressChange('destination', e.target.value)}
            placeholder="Enter destination address"
          />
          {errors.destinationAddress && <div className="error-message">{errors.destinationAddress}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Travel Days *</label>
          <div className="checkbox-group">
            {DAY_NAMES.map((day, index) => (
              <div key={index} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`day-${index}`}
                  checked={formData.schedule.days.includes(index)}
                  onChange={() => handleDayToggle(index)}
                />
                <label htmlFor={`day-${index}`}>{day}</label>
              </div>
            ))}
          </div>
          {errors.days && <div className="error-message">{errors.days}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Time Window *</label>
          <div className="form-row">
            <div>
              <label className="form-label" htmlFor="windowStart">From</label>
              <input
                id="windowStart"
                type="time"
                className="form-input"
                value={formData.schedule.windowStart}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: {
                    ...formData.schedule,
                    windowStart: e.target.value
                  }
                })}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="windowEnd">To</label>
              <input
                id="windowEnd"
                type="time"
                className="form-input"
                value={formData.schedule.windowEnd}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: {
                    ...formData.schedule,
                    windowEnd: e.target.value
                  }
                })}
              />
            </div>
          </div>
          {errors.timeWindow && <div className="error-message">{errors.timeWindow}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Alert Threshold</label>
          <div className="form-row">
            <div>
              <select
                className="form-input"
                value={formData.alertThreshold.type}
                onChange={(e) => setFormData({
                  ...formData,
                  alertThreshold: {
                    ...formData.alertThreshold,
                    type: e.target.value as 'PERCENTAGE' | 'MINUTES'
                  }
                })}
              >
                <option value="PERCENTAGE">Percentage Increase</option>
                <option value="MINUTES">Minutes Delay</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                className="form-input"
                value={formData.alertThreshold.value}
                onChange={(e) => setFormData({
                  ...formData,
                  alertThreshold: {
                    ...formData.alertThreshold,
                    value: parseInt(e.target.value) || 0
                  }
                })}
                placeholder={formData.alertThreshold.type === 'PERCENTAGE' ? '25' : '15'}
                min="1"
              />
            </div>
          </div>
          <small className="form-help">
            Alert when travel time increases by{' '}
            {formData.alertThreshold.type === 'PERCENTAGE' 
              ? `${formData.alertThreshold.value}% or more`
              : `${formData.alertThreshold.value} minutes or more`
            }
          </small>
          {errors.threshold && <div className="error-message">{errors.threshold}</div>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn">
            {isEditing ? 'Update Trip' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;