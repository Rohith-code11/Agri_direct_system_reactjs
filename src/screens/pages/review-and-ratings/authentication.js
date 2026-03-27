import ReviewCard from '../../../reusable-components/ReviewCard';
import { reviewData } from '../../../utils/reviewData';

const ReviewAndRatingsAuthentication = () => {
  return (
    <section className="review-section">
      <h2>Reviews and Ratings</h2>
      <p>What our users say about AgriDirect.</p>
      <div className="review-grid">
        {reviewData.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </div>
    </section>
  );
};

export default ReviewAndRatingsAuthentication;
