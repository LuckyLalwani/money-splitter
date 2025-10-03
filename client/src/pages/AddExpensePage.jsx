import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faUsers } from '@fortawesome/free-solid-svg-icons';

const AddExpensePage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    splitType: 'equal',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [customSplits, setCustomSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}`);
        setGroup(response.data);
        
        // Initialize custom splits with equal amounts
        if (response.data.members.length > 0) {
          const initialSplits = response.data.members.map(member => ({
            user: member.user._id,
            name: member.user.name,
            amount: 0,
            percentage: 0
          }));
          setCustomSplits(initialSplits);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load group data');
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update splits if amount or split type changes
    if (name === 'amount' && value && customSplits.length > 0) {
      updateSplitAmounts(value, formData.splitType);
    } else if (name === 'splitType') {
      updateSplitAmounts(formData.amount, value);
    }
  };

  const updateSplitAmounts = (totalAmount, splitType) => {
    if (!totalAmount || isNaN(totalAmount)) return;
    
    const amount = parseFloat(totalAmount);
    
    if (splitType === 'equal') {
      // Equal split
      const equalAmount = amount / customSplits.length;
      setCustomSplits(
        customSplits.map(split => ({
          ...split,
          amount: equalAmount.toFixed(2),
          percentage: (100 / customSplits.length).toFixed(2)
        }))
      );
    } else if (splitType === 'percentage') {
      // Keep the percentages as is, but update amounts
      setCustomSplits(
        customSplits.map(split => ({
          ...split,
          amount: ((parseFloat(split.percentage) / 100) * amount).toFixed(2)
        }))
      );
    }
  };

  const handleSplitChange = (index, field, value) => {
    const updatedSplits = [...customSplits];
    updatedSplits[index][field] = value;
    
    if (formData.splitType === 'percentage' && field === 'percentage') {
      // Update amount based on percentage
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount)) {
        updatedSplits[index].amount = ((value / 100) * amount).toFixed(2);
      }
    } else if (formData.splitType === 'exact' && field === 'amount') {
      // Update percentage based on amount
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount) && amount > 0) {
        updatedSplits[index].percentage = ((value / amount) * 100).toFixed(2);
      }
    }
    
    setCustomSplits(updatedSplits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare splits data
      const splits = customSplits.map(split => ({
        user: split.user,
        amount: parseFloat(split.amount),
        percentage: parseFloat(split.percentage)
      }));

      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        groupId,
        splitType: formData.splitType,
        splits,
        date: formData.date,
        notes: formData.notes
      };

      await axios.post('/api/expenses', expenseData);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading group data...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="mb-3">Add New Expense</h2>
              <p className="text-muted mb-4">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Group: {group?.name}
              </p>

              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Expense Description
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Dinner, Groceries, Movie tickets"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Amount (₹)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faDollarSign} />
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="splitType" className="form-label">
                    Split Type
                  </label>
                  <select
                    className="form-select"
                    id="splitType"
                    name="splitType"
                    value={formData.splitType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="equal">Equal Split</option>
                    <option value="percentage">Percentage Split</option>
                    <option value="exact">Exact Amounts</option>
                  </select>
                </div>

                {/* Split details section */}
                {customSplits.length > 0 && (
                  <div className="mb-4 card">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Split Details</h5>
                    </div>
                    <div className="card-body">
                      {customSplits.map((split, index) => (
                        <div key={split.user} className="mb-3 border-bottom pb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>{split.name}</div>
                            
                            {formData.splitType !== 'equal' && (
                              <div className="d-flex gap-2">
                                {formData.splitType === 'exact' && (
                                  <div className="input-group" style={{ width: '150px' }}>
                                    <span className="input-group-text">₹</span>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={split.amount}
                                      onChange={(e) => 
                                        handleSplitChange(index, 'amount', e.target.value)
                                      }
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                )}
                                
                                {formData.splitType === 'percentage' && (
                                  <div className="input-group" style={{ width: '120px' }}>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={split.percentage}
                                      onChange={(e) =>
                                        handleSplitChange(index, 'percentage', e.target.value)
                                      }
                                      min="0"
                                      max="100"
                                      step="0.1"
                                    />
                                    <span className="input-group-text">%</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {formData.splitType === 'equal' && (
                              <div className="text-muted">
                                ₹{split.amount} ({split.percentage}%)
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="notes" className="form-label">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Any additional details about this expense"
                  ></textarea>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !formData.amount || !formData.description}
                  >
                    {submitting ? 'Adding Expense...' : 'Add Expense'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(`/groups/${groupId}`)}
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

export default AddExpensePage;