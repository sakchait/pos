"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import ReviewCard from "@/components/common/ReviewCard";
import { Review } from "@/types/review.types";
import { api } from "@/lib/api";

const ReviewsContent = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getReviews(productId);
      setReviews(res.reviews);
      setAverageRating(res.averageRating);
      setTotalCount(res.totalReviewsCount);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.submitReview(productId, {
        customerName: customerName || "Guest",
        rating,
        content
      });
      setCustomerName("");
      setRating(5);
      setContent("");
      setShowForm(false);
      await loadReviews();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between flex-col sm:flex-row mb-5 sm:mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <h3 className="text-xl sm:text-2xl font-bold text-black mr-2">
            All Reviews
          </h3>
          <span className="text-sm sm:text-base text-black/60">({totalCount})</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="sm:min-w-[166px] px-4 py-3 sm:px-5 sm:py-4 rounded-full bg-orange-600 font-medium text-xs sm:text-base h-12 text-white hover:bg-orange-700 shadow-md shadow-orange-600/10"
          >
            {showForm ? "Cancel Review" : "Write a Review"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6 space-y-4 max-w-xl">
          <h4 className="font-bold text-lg text-black">Write Your Review</h4>
          
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-black/70">Your Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border border-neutral-300 rounded-lg p-2.5 text-sm bg-white text-black"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-black/70">Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-semibold transition-all ${
                    rating === val ? "bg-orange-600 text-white border-orange-600 shadow-sm" : "bg-white text-black border-neutral-300"
                  }`}
                >
                  {val} ⭐
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-black/70">Review Comments</label>
            <textarea
              required
              rows={3}
              placeholder="Share details of your experience with this product..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border border-neutral-300 rounded-lg p-2.5 text-sm bg-white text-black"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 font-medium">{submitError}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-2.5 font-medium text-sm disabled:opacity-50 shadow-md shadow-orange-600/15"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-black/40">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 sm:mb-9">
          {reviews.map((review) => (
            <ReviewCard key={review.id} data={review} isAction isDate />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-black/40 border border-dashed border-neutral-200 rounded-2xl mb-6">
          No reviews yet. Be the first to write one!
        </div>
      )}
    </section>
  );
};

export default ReviewsContent;
