import axios from 'axios';

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};

export const getAddressFromCoords = async (lat, lng) => {
  try {
    // Using Nominatim (OpenStreetMap) for free reverse geocoding
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (response.data && response.data.display_name) {
      // Extracting a concise area name (e.g., suburb, city)
      const address = response.data.address;
      const area = address.suburb || address.neighbourhood || address.city_district || address.town || address.city || 'Unknown Area';
      const city = address.city || address.state || '';
      return `${area}${city ? ', ' + city : ''}`;
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Location not found';
  }
};
