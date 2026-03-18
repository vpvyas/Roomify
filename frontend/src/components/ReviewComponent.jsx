import React, { useState } from 'react';
import axios from 'axios';

const ReviewComponent = ({ pgId, reviews, refreshData }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Get user from local storage (or your Auth Context)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const submitHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a rating');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`, // Sending the JWT token
        },
      };

      await axios.post(`/api/pg/${pgId}/reviews`, { rating, message }, config);
      
      setMessage('');
      setRating(0);
      refreshData(); // Call a function to reload PG data to show the new review
      alert('Review Submitted!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">User Reviews</h3>
      
      {/* List Existing Reviews */}
      <div className="space-y-4 mb-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                <span className="font-bold mr-2 text-blue-600">{rev.user.name}</span>
                <span className="text-yellow-500">{"★".repeat(rev.rating)}</span>
              </div>
              <p className="text-gray-700">{rev.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {/* Add New Review Form */}
      <div className="bg-white p-6 border rounded-xl shadow-sm">
        <h4 className="text-lg font-semibold mb-3">Write a Review</h4>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        
        {userInfo ? (
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="block mb-1">Rating</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="0">Select...</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Comment</label>
              <textarea
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="How was your stay?"
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Submit Review
            </button>
          </form>
        ) : (
          <p className="bg-yellow-100 p-3 rounded">
            Please <a href="/login" className="font-bold underline">Login</a> to write a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewComponent;