import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('/api/groups');
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load groups');
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your groups...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1>Your Groups</h1>
          <p className="lead">Manage your expense groups and see who owes whom</p>
        </div>
        <div className="col-md-4 text-md-end">
          <Link to="/groups/create" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Create New Group
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">{group.name}</h4>
                  <p className="card-text text-muted">
                    {group.description || 'No description provided'}
                  </p>
                  
                  <div className="d-flex mb-3">
                    <div className="me-4">
                      <FontAwesomeIcon icon={faUsers} className="text-muted me-2" />
                      <span>{group.members.length} members</span>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                      <span>
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/groups/${group._id}`}
                    className="btn btn-outline-primary w-100"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-md-12 text-center py-5">
            <div className="mb-4">
              <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted" />
            </div>
            <h3>No Groups Yet</h3>
            <p className="text-muted mb-4">
              Create your first group to start tracking shared expenses
            </p>
            <Link to="/groups/create" className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create Your First Group
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage; 