const ReviewCard = ({ name, role, rating, feedback }) => {
  return (
    <article className="review-card">
      <h3>{name}</h3>
      <p className="review-role">{role}</p>
      <p className="review-rating">Rating: {rating}/5</p>
      <p>{feedback}</p>
    </article>
  );
};

export default ReviewCard;
