import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMoneyBillWave, faHandHoldingUsd, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentGroups, setRecentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch expense summary
        const summaryResponse = await axios.get('/api/expenses/summary');
        setSummary(summaryResponse.data);
        
        // Fetch recent groups
        const groupsResponse = await axios.get('/api/groups');
        setRecentGroups(groupsResponse.data.slice(0, 3)); // Get first 3 groups
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1>Welcome, {user?.name}</h1>
          <p className="lead">Here's a summary of your expenses and balances</p>
        </div>
        <div className="col-md-4 text-md-end">
          <Link to="/groups/create" className="btn btn-primary me-2">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Group
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {summary && (
        <div className="row mb-5">
          <div className="col-md-4 mb-3">
            <div className="summary-card">
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" className="text-primary me-3" />
                <h3 className="mb-0">Total Paid</h3>
              </div>
              <h2 className="mb-0">₹{summary.paid.toFixed(2)}</h2>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="summary-card">
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faHandHoldingUsd} size="2x" className="text-primary me-3" />
                <h3 className="mb-0">You Owe</h3>
              </div>
              <h2 className="mb-0 negative-amount">₹{summary.owed.toFixed(2)}</h2>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="summary-card">
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faExchangeAlt} size="2x" className="text-primary me-3" />
                <h3 className="mb-0">Balance</h3>
              </div>
              <h2 className={`mb-0 ${summary.balance >= 0 ? 'positive-amount' : 'negative-amount'}`}>
                ₹{summary.balance.toFixed(2)}
              </h2>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Recent Groups</h4>
              <Link to="/groups" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            
            <div className="card-body">
              {recentGroups.length > 0 ? (
                recentGroups.map((group) => (
                  <div key={group._id} className="mb-3 p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{group.name}</h5>
                        <p className="text-muted mb-0">
                          {group.members.length} members · {group.expenses.length} expenses
                        </p>
                      </div>
                      <Link
                        to={`/groups/${group._id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="mb-0">You don't have any groups yet</p>
                  <Link to="/groups/create" className="btn btn-primary mt-3">
                    Create Your First Group
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 