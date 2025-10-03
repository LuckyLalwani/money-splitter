import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faUser,
  faUsers,
  faCalendarAlt,
  faArrowLeft,
  faCheck,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

const ExpenseDetailPage = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const response = await axios.get(`/api/expenses/${expenseId}`);
        setExpense(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load expense data');
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, [expenseId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await axios.delete(`/api/expenses/${expenseId}`);
      navigate(`/groups/${expense.group._id}`);
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const handleSettleUp = async (userId) => {
    try {
      await axios.patch('/api/expenses/settle', {
        expenseId,
        userId,
        status: 'settled'
      });
      
      // Refresh expense data
      const response = await axios.get(`/api/expenses/${expenseId}`);
      setExpense(response.data);
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
        <p className="mt-3">Loading expense details...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {expense && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="d-flex align-items-center mb-4">
              <Link
                to={`/groups/${expense.group._id}`}
                className="btn btn-outline-primary me-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Group
              </Link>
              <h2 className="mb-0">{expense.description}</h2>
            </div>

            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-primary mb-0">₹{expense.amount.toFixed(2)}</h3>
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Delete
                  </button>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="text-muted mb-1">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Paid by
                      </div>
                      <div className="fs-5">{expense.paidBy.name}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="text-muted mb-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        Date
                      </div>
                      <div className="fs-5">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-muted mb-1">
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Group
                  </div>
                  <div className="fs-5">{expense.group.name}</div>
                </div>

                {expense.notes && (
                  <div className="mb-4">
                    <div className="text-muted mb-1">Notes</div>
                    <div className="p-3 bg-light rounded">{expense.notes}</div>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="mb-3">Split Details</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Person</th>
                          <th>Amount</th>
                          {expense.splitType === 'percentage' && <th>Percentage</th>}
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expense.splits.map(split => (
                          <tr key={split._id}>
                            <td>
                              {split.user.name}
                              {split.user._id === expense.paidBy._id && (
                                <span className="ms-2 badge bg-info">Paid</span>
                              )}
                            </td>
                            <td>₹{split.amount.toFixed(2)}</td>
                            {expense.splitType === 'percentage' && (
                              <td>{split.percentage}%</td>
                            )}
                            <td>
                              {split.user._id !== expense.paidBy._id ? (
                                split.status === 'pending' ? (
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleSettleUp(split.user._id)}
                                  >
                                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                                    Mark as Settled
                                  </button>
                                ) : (
                                  <span className="badge bg-success">Settled</span>
                                )
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseDetailPage; 