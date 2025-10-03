import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faUsers,
  faMoneyBillWave,
  faUserPlus,
  faChevronRight,
  faCheck,
  faTimes,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group details
        const groupResponse = await axios.get(`/api/groups/${groupId}`);
        setGroup(groupResponse.data);
        
        // Fetch group expenses
        const expensesResponse = await axios.get(`/api/expenses/group/${groupId}`);
        setExpenses(expensesResponse.data);
        
        // Calculate balances
        calculateBalances(groupResponse.data.members, expensesResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load group data');
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const calculateBalances = (members, expenses) => {
    // Create a map to track how much each person has paid and owes
    const balanceMap = {};
    
    // Initialize balance map with all members
    members.forEach(member => {
      balanceMap[member.user._id] = {
        id: member.user._id,
        name: member.user.name,
        paid: 0,
        owed: 0,
        balance: 0
      };
    });
    
    // Calculate paid and owed amounts for each expense
    expenses.forEach(expense => {
      // Add paid amount to the person who paid
      if (balanceMap[expense.paidBy._id]) {
        balanceMap[expense.paidBy._id].paid += expense.amount;
      }
      
      // Add owed amounts for each split
      expense.splits.forEach(split => {
        if (balanceMap[split.user._id] && split.user._id !== expense.paidBy._id) {
          balanceMap[split.user._id].owed += split.amount;
        }
      });
    });
    
    // Calculate final balance for each person
    Object.keys(balanceMap).forEach(userId => {
      balanceMap[userId].balance = balanceMap[userId].paid - balanceMap[userId].owed;
    });
    
    // Convert to array and sort
    const balanceArray = Object.values(balanceMap).sort((a, b) => b.balance - a.balance);
    setBalances(balanceArray);
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) return;

    try {
      const response = await axios.get(`/api/users/search?search=${searchTerm}`);
      // Filter out existing members
      const existingMemberIds = group.members.map(m => m.user._id);
      const filteredResults = response.data.filter(
        user => !existingMemberIds.includes(user._id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await axios.post(`/api/groups/${groupId}/members`, {
        memberIds: [userId]
      });
      
      // Refresh group data
      const refreshedGroup = await axios.get(`/api/groups/${groupId}`);
      setGroup(refreshedGroup.data);
      
      // Clear search
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      setError('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axios.delete(`/api/groups/${groupId}/members`, {
        data: { memberId: userId }
      });
      
      // Refresh group data
      const refreshedGroup = await axios.get(`/api/groups/${groupId}`);
      setGroup(refreshedGroup.data);
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  const handleSettleUp = async (expenseId, userId) => {
    try {
      await axios.patch('/api/expenses/settle', {
        expenseId,
        userId,
        status: 'settled'
      });
      
      // Refresh expenses
      const refreshedExpenses = await axios.get(`/api/expenses/group/${groupId}`);
      setExpenses(refreshedExpenses.data);
    } catch (err) {
      setError('Failed to update settlement status');
    }
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading group details...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {group && (
        <>
          <div className="row mb-4">
            <div className="col-md-8">
              <h1>{group.name}</h1>
              <p className="lead">{group.description || 'No description'}</p>
            </div>
            <div className="col-md-4 text-md-end">
              <Link
                to={`/groups/${groupId}/add-expense`}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Expense
              </Link>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}

          <div className="row mb-4">
            <div className="col-12">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenses')}
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                    Expenses
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'balances' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balances')}
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                    Balances
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Members
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="row">
              <div className="col-12">
                {expenses.length > 0 ? (
                  expenses.map(expense => (
                    <div
                      key={expense._id}
                      className="card mb-3 expense-card"
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="card-title">{expense.description}</h5>
                            <p className="card-text text-muted">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                          <h5 className="text-primary">₹{expense.amount.toFixed(2)}</h5>
                        </div>
                        <p className="card-text">
                          Paid by: <strong>{expense.paidBy.name}</strong>
                        </p>
                        
                        <div className="mt-3">
                          <h6>Split Details:</h6>
                          <div className="list-group">
                            {expense.splits.map(split => (
                              <div
                                key={split._id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                <div>{split.user.name}</div>
                                <div className="d-flex align-items-center">
                                  <span className="me-3">₹{split.amount.toFixed(2)}</span>
                                  {split.user._id !== expense.paidBy._id && (
                                    split.status === 'pending' ? (
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => handleSettleUp(expense._id, split.user._id)}
                                      >
                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                        Settle
                                      </button>
                                    ) : (
                                      <span className="badge bg-success">Settled</span>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <FontAwesomeIcon icon={faMoneyBillWave} size="3x" className="text-muted" />
                    </div>
                    <h3>No Expenses Yet</h3>
                    <p className="text-muted mb-4">
                      Add your first expense to start tracking
                    </p>
                    <Link
                      to={`/groups/${groupId}/add-expense`}
                      className="btn btn-primary"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add First Expense
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Current Balances</h5>
                  </div>
                  <div className="card-body">
                    {balances.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Member</th>
                              <th>Paid</th>
                              <th>Owes</th>
                              <th>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {balances.map(balance => (
                              <tr key={balance.id}>
                                <td>{balance.name}</td>
                                <td>₹{balance.paid.toFixed(2)}</td>
                                <td>₹{balance.owed.toFixed(2)}</td>
                                <td
                                  className={
                                    balance.balance > 0
                                      ? 'positive-amount'
                                      : balance.balance < 0
                                      ? 'negative-amount'
                                      : ''
                                  }
                                >
                                  ₹{balance.balance.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center my-4">
                        No balance information available yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="row">
              <div className="col-md-12">
                <div className="card mb-4">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Group Members</h5>
                    <span className="badge bg-primary">{group.members.length} Members</span>
                  </div>
                  <div className="card-body">
                    <ul className="list-group">
                      {group.members.map(member => (
                        <li
                          key={member.user._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{member.user.name}</strong>
                            <div className="text-muted small">{member.user.email}</div>
                          </div>
                          <div>
                            {member.isAdmin && (
                              <span className="badge bg-info me-2">Admin</span>
                            )}
                            {member.user._id === group.creator._id ? (
                              <span className="badge bg-secondary">Creator</span>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveMember(member.user._id)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Add New Members</h5>
                  </div>
                  <div className="card-body">
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search users by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                      <div className="list-group">
                        {searchResults.map(user => (
                          <button
                            key={user._id}
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => handleAddMember(user._id)}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupDetailPage;