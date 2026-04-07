import ReviewCard from '../../../reusable-components/ReviewCard';
import { reviewData } from '../../../utils/reviewData';

const ReviewAndRatingsAuthentication = () => {
  return (
    <section className="review-section">
      <div className="review-header">
        <div>
          <p className="feature-eyebrow">Field Feedback</p>
          <h2>Reviews and Ratings</h2>
          <p>What growers and buyers say after using AgriDirect in live sourcing workflows.</p>
        </div>
        <div className="review-score-card">
          <strong>4.8/5</strong>
          <span>Operational satisfaction</span>
        </div>
      </div>
      <div className="review-grid">
        {reviewData.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </div>
    </section>
  );
};

export default ReviewAndRatingsAuthentication;
