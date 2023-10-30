import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';
import TopBar from '../topBar/TopBar';
import FetchModel from '../../lib/fetchModelData'; 

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      user: null, // Initialize user as null
      comment: null, // Initialize comment as null
    };
  }

  componentDidMount() {
    this.fetchUserPhotosAndDetails();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { userId } = match.params;

    if (prevProps.match.params.userId !== userId) {
      this.fetchUserPhotosAndDetails();
    }
  }

  fetchUserPhotosAndDetails() {
    const { match } = this.props;
    const { userId } = match.params;

    // Use FetchModel to fetch user photos from the server
    FetchModel(`/photosOfUser/${userId}`)
      .then((response) => {
        this.setState({ photos: response.data });
      })
      .catch((error) => {
        console.error('Error fetching user photos:', error);
      });

    // Use FetchModel to fetch user details from the server
    FetchModel(`/user/${userId}`)
      .then((response) => {
        this.setState({
          user: response.data,
          comment: response.data ? response.data.comment : null,
        });
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });
  }

  render() {
    const { photos, user, comment } = this.state;
    const { match } = this.props;
    const { userId } = match.params;
    const topNameValue = user ? `User photos for ${user.first_name} ${user.last_name}` : '';

    return (
      <div>
        <TopBar topName={topNameValue} />
        <Button
          component={Link}
          to={`/users/${userId}`}
          variant="contained"
          className="ButtonLink"
        >
          User Details
        </Button>
        <Typography
          variant="h4"
          className="UserPhotosHeader"
        >
          User Photos
        </Typography>
        <div className="photo-list">
          {photos.map((photo) => (
            <div key={photo._id} className="photo-item">
              <img
                src={`/images/${photo.file_name}`}
                alt={`User ${userId}'s Photo`}
                className="photo-image"
              />
              <div className="user-photo-box" style={{ marginTop: '16px' }}>
                <Typography variant="caption" className="user-photo-title">
                  Date Taken
                </Typography>
                <Typography variant="body1" className="user-photo-value">
                  {photo.date_time}
                </Typography>
              </div>

              {photo.comments && photo.comments.length > 0 && (
                    <div
                      style={{}}
                    >
                      <p style={{ margin: 0, fontWeight: 'bold' }}>Comments:</p>
                      {photo.comments.map((comment) => (
                        <div className="user-photo-box" style={{ marginTop: '16px' }}>
                          <p>{comment.comment}</p>
                          <p>
                            <b>Commented ON:</b> {comment.date_time}
                          </p>
                          <p>
                            <b>Commented BY:</b>
                            <Link to={`/users/${comment.user._id}`}>{comment.user.first_name} {comment.user.last_name}</Link>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

            </div>
          ))}
        </div>



        {user ? ( // Display user-related information if user exists
          <div>
            {comment && ( // Display comment if available
              <div className="user-photo-box" style={{ marginTop: '16px' }}>
                <Typography variant="caption" className="user-photo-title">
                  Comment
                </Typography>
                <Typography variant="body1" className="user-photo-value">
                  {comment}
                </Typography>
              </div>
            )}
          </div>
        ) : (
          <Typography variant="body1" className="user-detail-box loading-text">
            Loading user details...
          </Typography>
        )}
      </div>
    );
  }
}

export default UserPhotos;