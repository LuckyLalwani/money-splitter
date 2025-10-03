import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) return;

    try {
      const response = await axios.get(`/api/users/search?search=${searchTerm}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const addMember = (member) => {
    if (!selectedMembers.some((m) => m._id === member._id)) {
      setSelectedMembers([...selectedMembers, member]);
      setSearchResults([]);
      setSearchTerm('');
    }
  };

  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter((m) => m._id !== memberId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const memberIds = selectedMembers.map((member) => member._id);
      
      const response = await axios.post('/api/groups', {
        ...formData,
        members: memberIds,
      });
      
      navigate(`/groups/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="mb-4">Create New Group</h2>

              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Group Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Roommates, Trip to Goa, Office Lunch"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description about this group"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label">Add Members</label>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleSearch}
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="list-group mb-3">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => addMember(user)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{user.name}</strong>
                              <div className="text-muted small">{user.email}</div>
                            </div>
                            <FontAwesomeIcon icon={faUserPlus} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedMembers.length > 0 && (
                    <div className="mb-3">
                      <h6 className="mb-2">Selected Members:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                          <div
                            key={member._id}
                            className="badge bg-light text-dark p-2 d-flex align-items-center"
                          >
                            <span>{member.name}</span>
                            <button
                              type="button"
                              className="btn btn-sm text-danger ms-2 p-0"
                              onClick={() => removeMember(member._id)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.name}
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/groups')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage; 