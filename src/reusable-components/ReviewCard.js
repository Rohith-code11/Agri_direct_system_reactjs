import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const ReviewCard = ({ name, role, rating, feedback }) => {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <div className="review-avatar" aria-hidden="true">
          {name?.slice(0, 1)}
        </div>
        <div>
          <h3>{name}</h3>
          <p className="review-role">{role}</p>
        </div>
      </div>
      <p className="review-rating"><FontAwesomeIcon icon={faStar} /> Rating: {rating}/5</p>
      <p>{feedback}</p>
    </article>
  );
};

export default ReviewCard;
